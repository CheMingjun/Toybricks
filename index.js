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