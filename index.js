/*!
 * Toybricks
 *
 * Javascript DI(dependency injection) framework
 *
 * Copyright(c) 2016
 * Author: CheMingjun <chemingjun@126.com>
 */
'use strict';
require('at-js');
var weave = require('./lib/weave'), T = {};
/**
 * add extention in weave
 * @param opt{name,path(filePath:functionName e.g. "./lib/main:deleteBefore"),desc}
 */
T.addExtention = weave.addExtention;
/**
 * add junction in weave
 * @param opt{from(filePath:moduleExportItem e.g. "./lib/main:delete"),
 *                      to(filePath:functionName e.g. "./lib/main:deleteBefore")}
 * @type {regJunction}
 */
T.addJunction = weave.addJunction;
/**
 * get module description
 * @param _mdName
 * @returns {*}
 */
T.getModule = weave.getModule;
/**
 * get all modules description
 */
T.getAllModules = weave.getAllMDReg;

module.exports = T;