#Toybricks 
>The javascript annotation and DI(dependency injectioin) framework

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