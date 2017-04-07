var proxy = new Proxy({}, {
    get: function (target, property) {
        return 35;
    }
})
var obj = Object.create(proxy);
console.log(obj.time)