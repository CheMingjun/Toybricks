/*!
 * Toybricks
 *
 * Javascript annotarion and DI(dependency injection) framework
 * <p>Annotaion not decorator(in ES6),most of the time,decorate is not enough.</p>
 *
 * Copyright(c) 2016
 * Author: CheMingjun <chemingjun@126.com>
 */
'use strict';
var assert = require('assert').ok, util = require("./lib/util"),anno = require('./lib/anno'),inited = false;
/**
 * override node.js require
 * @param _fpath
 * @returns {*}
 */
module.constructor.prototype.require = function (_fpath) {
    if (!inited) {
        inited = true;
        this.constructor._extensions['.js'] =anno.analyze;
    }
    if(typeof _fpath==='string'){
        return this.constructor._load(_fpath, this);
    }
}
require('./lib/weave');//init all runtime
//---------------------------------------------------------------------------------------------
var toybricks = {};
module.exports = toybricks;
/**
 * The configuaration of Toybricks
 * @param _cfg {logger}
 */
toybricks.config=function (_cfg) {
    if (typeof _cfg === 'object') {
        if (typeof _cfg.logger === 'function') {
            util.init(_cfg.logger);
        }
        if (util.is.array(_cfg.annotations)) {
            _cfg.annotations.forEach(anno.reg);
        }
    }
};
/**
 * 注册"注释"类型
 * @param _name
 * @param _impl
 */
toybricks.regAnnotation = anno.reg;
toybricks.getModule = function (_mdName) {return typeof _mdName === 'string' ? allMDReg[_mdName] : allMDReg[emn];};
toybricks.getAllModules = function () {return allMDReg;};

//---------------------------------------------------------------------------
toybricks.regAnnotation('dependency',{
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
toybricks.regAnnotation('logger',{
    scope: 'var', build: function () {
        return "return require('toybricks/lib/util').log();\n"
    }
})
