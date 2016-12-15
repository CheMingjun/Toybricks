/*!
 * 
 * Author: CheMingjun
 */
'use strict';
const MDName = 'toybricks', MyPath = MDName + '/lib/weave';
var fs = require("fs"), path = require("path"), assert = require('assert').ok, util = require('./util');
var depReg = {},//all extentions register
    extFileMDReg = {},//save all extentions by key[filePath][origin name]
    tPDPath = {}, //temp
    allMDReg = {}, bsFileName = (function () {
        let pt = module.parent, rtn = pt ? pt.filename : __filename;
        while (pt != null) {
            rtn = pt ? pt.filename : __filename;
            pt = pt.parent;
        }
        if (!rtn) {
            throw new Error('Toybricks init error.');
        }
        return rtn;
    })(), bsMdPath = util.path.modulePath(bsFileName), regExtention = function (_opt, _mPath, _pkgJson) {
        if (typeof _opt === 'object' && _opt['name'] && _opt['path']) {
            _mPath = _mPath || bsMdPath;
            if (!_pkgJson) {
                _pkgJson = require(path.join(_mPath, 'package.json'))
            }
            var tary = _opt['path'].split(':');
            if (tary.length == 2) {
                var to = extFileMDReg[path.join(_mPath, tary[0])];
                if (!to) {
                    extFileMDReg[path.join(_mPath, tary[0])] = to = {};
                }
                to[tary[1]] = {mdef: _pkgJson, def: _opt};
                depReg[_pkgJson.name + ":" + _opt['name']] = {mdef: _pkgJson, mpath: _mPath, value: []};
            } else {
                throw new Error("The extention config in module[" + _pkgJson.name + "] is error.");
            }
        } else {
            throw new Error("The extention config in module[" + _pkgJson.name + "] is error.");
        }
        return this;
    }, regJunction = function (cjc, mn) {
        mn = mn || emn;
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
        return this;
    }, parseMd = function (_mPath, _level) {
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
                    dps.forEach(function (_cfg) {
                        regExtention(_cfg, _mPath, pckJson);
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

//--------------------------------------------------------------------------------------------------------

var emn = null;
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
                jc.forEach(regJunction, mn)
            }
        }
    }
}
//---------------------------------------------------------------------------------------------------
module.exports = {
    addExtention: regExtention,
    addJunction: regJunction,
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
        throw new Error('No junction found for extention[' + _mName + ':' + _dName + '].')
    },
    routeVal: function (_mName, _dName) {
        let v = this.routeEval(_mName, _dName), ext = require('./ext');
        if (v && v.length > 0) {
            let args = Array.prototype.slice.call(arguments, 2);
            let rtn = [];
            v.forEach(function (_tv) {
                if (_tv.val) {
                    rtn.push(_tv.val);
                } else {
                    let ff = require(_tv.from.filePath);
                    if (_mName !== MDName || _dName !== 'invokeBefore') {
                        ext.invokeBefore.apply(this, args);
                    }
                    rtn.push(ff[_tv.from.serviceName].apply(this, args));
                    if (_mName !== MDName || _dName !== 'invokeAfter') {
                        ext.invokeAfter.apply(this, args);
                    }
                }
            })
            return rtn.length == 1 ? rtn[0] : rtn;
        }
    }
};
//---------------------------------------------------------------------------------------------------
require('at-js').define('extention', {
    scope: 'var', build: function (_ctx, _argAry) {
        _argAry = _argAry ? ',' + _argAry.join(',') : '';
        let def = extFileMDReg[_ctx.filePath.substring(0, _ctx.filePath.lastIndexOf('.'))];
        if (typeof def === 'object' && typeof(def = def[_ctx.refName]) === 'object') {
            let fn = function (_ct) {
                return _ctx.defType ? "return function(){" + _ct + "}" : _ct;
            }
            if (_ctx.desc && _ctx.desc['returnEval']) {
                return fn("return require('" + MyPath + "').routeEval('" + def.mdef.name + "','" + def.def.name + "'" + _argAry + ");");
            } else {
                return fn("return require('" + MyPath + "').routeVal('" + def.mdef.name + "','" + def.def.name + "'" + _argAry + ");");
            }
        } else {
            util.log().warn('No junction found for extention[' + _ctx.refName + '] in file[' + _ctx.filePath + ']');
        }
    }
})
