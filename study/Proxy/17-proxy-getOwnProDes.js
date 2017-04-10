var handler = {
    getOwnPropertyDescriptor(target, key) {
        if(key[0] === '_') {
            return;
        }
        return Object.getOwnPropertyDescriptor(target, key);
    }
};
var target = { _foo: 'bar', baz: 'tar' };
var proxy = new Proxy(target, handler);

console.log(Object.getOwnPropertyDescriptor(proxy, 'wat'));
//undefined
console.log(Object.getOwnPropertyDescriptor(proxy, '_foo'));
//undefined
console.log(Object.getOwnPropertyDescriptor(proxy, 'baz'));
// { value: 'tar', writable: true, enumerable: true, configurable: true }