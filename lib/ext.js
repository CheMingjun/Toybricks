/*!
 * 
 * Author: CheMingjun
 */

/**
 * Extention for invoke before
 */
'@extention';
var invokeBefore = function (_a,_b,_c,_d,_e,_f,_g) {}
/**
 * Extention for invoke after
 */
'@extention';
var invokeAfter = function (_a,_b,_c,_d,_e,_f,_g) {}
module.exports = {
    invokeBefore: function () {
        return invokeBefore.apply(this,Array.prototype.slice.call(arguments));
    },
    invokeAfter: function(){
        return invokeAfter.apply(this,Array.prototype.slice.call(arguments));
    }
}
