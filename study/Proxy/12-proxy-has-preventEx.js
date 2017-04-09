var obj = {a:10};
Object.preventExtensions(obj);

var p = new Proxy(obj, {
    has: function (target, prop) {
        return false;
    }
})

'a' in p    //TypeError is throw