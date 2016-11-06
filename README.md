#Toybricks 
>The javascript annotation and DI(dependency injectioin) framework

##Javascript annotation type(not decorator type in ES6)
As we know,the Annotation type is not surport in javascript language.Toybricks framework made it posible.
For example,use Toybricks, you can write code like this:

```js
'@logger';
var myLogger = {
    info:function(_msg){
        console.log(_msg);
    }
}
```

Of course,you can use it like this also:

```js
//@logger
var myLogger = {
    info:function(_msg){
        console.log(_msg);
    }
}
```

Not like decorator type,you can implement the annotation like this:

```js
require('toybricks').regAnnotation('logger',{
    scope: 'var', build: function () {
        return "return require('toybricks/lib/util').log();"
    }
})
```

Finally,at runtime,Toybricks cover the origin code like this:

```js
var myLogger = (
  function(){return require('toybricks/lib/util').log();}
)();
```

Is it interesting?
Use anthor framework Toybricks-test(base on Toybricks),you could test your code like this:

```js
var assert = require('assert');
var ds = null;

'@test.start';
var start = function () {
    ds = {};
}

'@test.step(timeout=2000)';
var test0 = function* () {
    ds.test0 = 'finish';
    var rtn = yield (function(){
        return function(_next){
            setTimeout(function(){
                _next(null,3);
            },2000)
        }
    })();
    assert.equal(rtn,3);
}

'@test.step';
var test1 = function () {
    ds.test1 = 'finish';
    return ds;
}

'@test.finish';
var fh = function () {
    ds = null;
}
```

##Dependency indection
Toybricks provided some annotations itself,among them,the annotation "extention" to help your system flexable like a **Russian nesting dolls**.
Here is a real case:

```js
module.exports = {
    deleteItem:function*(_itemObj){
        yield dao.del(_itemObj);
        delExt(rtn);
        return {suc:true};
    }
}
/**
 * Dao annotation
 */
'@dao';
var dao = function(){
    throw new Error('No one implement me?oh my God....');
}

/**
 * Extention for delete an object
 */
'@extention';
var delExt = function(_itemObj){}
```

The extention point was described in toybricks.json file:

```json
{
    "extentions": [
        {
            "name": "delAfter",
            "path": "./lib/biz:delExt",
            "desc": "The extention after delete item object."
        }
    ]
}
```

In another module,you can extend it(toybricks.json file) like this:

```json
{
    "junctions": [
        {
            "from": "./my/ext:afterDel",
            "to": "cloudIDE:delAfter"
        }
    ]
}
```