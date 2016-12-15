/*!
 * 
 * Author: CheMingjun
 */

/**
 * Extention for invoke before
 */
'@extention';
var invokeBefore = function () {}
/**
 * Extention for invoke after
 */
'@extention';
var invokeAfter = function () {}
module.exports = {
    invokeBefore: function () {
        return invokeBefore.apply(this,Array.prototype.slice.call(arguments));
    },
    invokeAfter: function(){
        return invokeAfter.apply(this,Array.prototype.slice.call(arguments));
    }
}
