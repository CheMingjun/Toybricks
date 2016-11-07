/*!
 * 
 * Author: CheMingjun
 */
'use strict';
var fs = require("fs"), path = require("path"), assert = require('assert').ok, util = require('./util');
var depReg = {},//all extentions register
    depFileMDReg = {},
    tPDPath = {}, //temp
    allMDReg = {}, allFileReg = {}, bsFileName = (function () {
        let pt = module.parent, rtn = pt ? pt.filename : __filename;
        while (pt != null) {
            rtn = pt ? pt.filename : __filename;
            pt = pt.parent;
        }
        if (!rtn) {
            throw new Error('Toybricks init error.');
        }
        return rtn;
    })(), bsMdPath = util.path.modulePath(bsFileName), parseMd = function (_mPath, _level) {
        if (tPDPath[_mPath]) {
            return;
        }
        var pckPath = path.join(_mPath, 'package.json'), dpReg;
        if (fs.existsSync(pckPath)) {
            tPDPath[_mPath] = true;

            var pckJson = require(pckPath), cfgObj = {
                pck: pckJson,
                name: pckJson.name,
                path: _mPath
            }, tbConfig = null;
            try {
                tbConfig = require(path.join(_mPath, 'toybricks.json'));
            } catch (ex) {

            }
            if (tbConfig) {
                cfgObj.tbConfig = tbConfig;
                var dps = tbConfig['extentions'];
                if (dps) {
                    dps.forEach(function (_dp) {
                        if (_dp['name'] && _dp['path']) {
                            var tary = _dp['path'].split(':');
                            if (tary.length == 2) {
                                depFileMDReg[path.join(_mPath, tary[0])] = {mdef: pckJson, def: _dp};
                                depReg[pckJson.name + ":" + _dp['name']] = {mdef: pckJson, mpath: _mPath, value: []};
                            } else {
                                throw new Error("The extention config in module[" + pckJson.name + "] is error.");
                            }
                        }
                    })
                }
            }
            allMDReg[pckJson.name] = cfgObj;

            let tpath = path.join(_mPath, 'node_modules');//寻找依赖的模块
            if (fs.existsSync(tpath)) {
                let dirs = fs.readdirSync(tpath), results = {}, tPath, extName;
                dirs.forEach(function (filename, _index) {
                    let tp = path.join(tpath, filename);
                    let _stats = fs.statSync(tp);
                    if (_stats.isDirectory()) {
                        parseMd(tp, 0);
                    }
                });
            }
        } else if (_level == 0) {//存在多级目录的情况
            let dirs = fs.readdirSync(_mPath), results = {}, tPath, extName;
            dirs.forEach(function (filename, _index) {
                let tp = path.join(_mPath, filename);
                let _stats = fs.statSync(tp);
                if (_stats.isDirectory()) {
                    parseMd(tp, ++_level);
                }
            });
        }
    };

parseMd(bsMdPath, 0);

let emn = null;
for (let mn in allMDReg) {
    let md = allMDReg[mn];
    if (md.path == bsMdPath) {
        emn = mn;
    }
    if (md.tbConfig) {
        let tb = md.tbConfig;
        if (tb) {
            let jc = tb['junctions'];
            if (jc) {
                for (var i = 0; i < jc.length; i++) {
                    var cjc = jc[i];
                    assert(typeof cjc === 'object', "Toybricks junction must be a object.");
                    assert(typeof cjc['to'] === 'string', "Toybricks junction's to must be a string.");
                    var tary = cjc['to'].split(':');
                    let toPath = tary.length == 1 ? (mn + ':' + tary[0]) : tary.join(':'), cv;
                    if (cjc['from']) {
                        var fary = cjc['from'].split(':');
                        assert(fary.length == 2, "Toybricks junction's option 'from' must like 'a:serviceName'.");
                        cv = {
                            from: {
                                mdName: mn,
                                filePath: path.join(allMDReg[mn].path, fary[0] + '.js'),
                                serviceName: fary[1]
                            }
                        };
                    } else if (cjc['value']) {
                        cv = {from: {mdName: mn}, val: cjc['value']};
                    }
                    depReg[toPath].value.push(cv);
                }
            }
        }
    }
}
//---------------------------------------------------------------------------------------------------
module.exports = {
    getModule: function (_mdName) {
        return allMDReg[typeof _mdName === 'string' ? _mdName : emn];
    },
    getAllMDReg: function () {
        return allMDReg;
    },
    routeEval: function (_mName, _dName) {
        let def = depReg[_mName + ':' + _dName];
        if (def) {
            return def['value'];
        }
    },
    routeVal: function (_mName, _dName) {
        let v = this.routeEval(_mName, _dName)
        if (v && v.length > 0) {
            let args = [];
            for (var i = 2; i <= arguments.length - 1; i++) {
                args.push(arguments[i]);
            }

            let rtn = [];
            v.forEach(function (_tv) {
                if (_tv.val) {
                    rtn.push(_tv.val);
                } else {
                    let ff = require(_tv.from.filePath);
                    rtn.push(ff[_tv.from.serviceName].apply(this, args));
                }
            })
            return rtn.length == 1 ? rtn[0] : rtn;
        }
    }
}

//---------------------------------------------------------------------------------------------------
require('at-js').regAnnotation('dependency', {
    scope: 'var', build: function (_ctx, _argAry) {
        _argAry = _argAry ? ',' + _argAry.join(',') : '';
        let def = depFileMDReg[_ctx.filePath.substring(0, _ctx.filePath.lastIndexOf('.'))];
        if (def) {
            if (_ctx.desc && _ctx.desc['returnEval']) {
                return "return require('toybricks/lib/weave').routeEval('" + def.mdef.name + "','" + def.def.name + "'" + _argAry + ");\n"
            } else {
                return "return require('toybricks/lib/weave').routeVal('" + def.mdef.name + "','" + def.def.name + "'" + _argAry + ");\n"
            }
        } else {
            util.log().warn('No junction found for dependency[' + _ctx.name + '] in file[' + _ctx.filePath + ']');
        }
    }
})