var handler = {
    defineProperty(target, key, descriptor) {
        return target[key];
    }
};
var target = {};
var proxy = new Proxy(target, handler);

proxy.foo = 'bar';
console.log(proxy.foo);