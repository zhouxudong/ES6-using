var target = {
    a: 1,
    b: 2,
    c: 3,
    [Symbol.for('secret')]: '4',
};

Object.defineProperty(target, 'key', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: 'static'
});

var handler = {
    ownKeys(target) {
        return ['a', 'd', Symbol.for('secret'), 'key'];
    }
};

var proxy = new Proxy(target, handler);
console.log(Object.keys(proxy));
// [ 'a' ]

var p = new Proxy({}, {
    ownKeys(target) {
        return ['a', 'b', 'c'];
    }
})

console.log(Object.getOwnPropertyNames(p))

//non-extensition
var obj = {
    a: 1
};
Object.preventExtensions(obj);
var p = new Proxy(obj, {
    ownKeys(target){
        return ['a', 'b'];
    }
})

Object.getOwnPropertyNames(p);
//TypeError: 'ownKeys' on proxy: trap returned extra keys but proxy target is non-extensible