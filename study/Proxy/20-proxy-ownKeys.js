// var target = {
//     a: 1,
//     b: 2,
//     c: 3
// };
//
// var handler = {
//     ownKeys(target) {
//         return ['a']
//     }
// };
//
// var proxy = new Proxy(target, handler);
// console.log(Object.keys(proxy))

var target = {
    _bar: 'foo',
    _prop: 'bar',
    prop: 'aaaa'
}

var handler = {
    ownKeys(target) {
        return Reflect.ownKeys(target).filter(key => key[0] !== '_');
    }
};

var proxy = new Proxy(target, handler);

for(let key of Object.keys(proxy)) {
    console.log(target[key]);
}
//aaaa