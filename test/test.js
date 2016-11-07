/*!
 * 
 * Author: CheMingjun
 */

var tbs = require('./../index');
module.exports = {
    test:function(){
        var rtn = ext0(3,{id:3435});
        console.log(rtn);
    },
    //--------------------------------------------------------------------------
    invokeB: function (_a,_b) {
        return _a+','+_b;
    },
    invokeF: function (_a,_b) {
        return _a+','+_b;
    },
    service: function (_a,_b) {
        return _a+','+_b;
    }
}

/**
 * Extention for invoke before
 */
'@extention';
var ext0 = function(_p0,_p1){
    console.log(23333);
}