var proto = {};

var proxy = new Proxy({}, {
    getPrototypeOf(target) {
        return proto;
    }
});
console.log(Object.getPrototypeOf(proxy) === proto);
//true