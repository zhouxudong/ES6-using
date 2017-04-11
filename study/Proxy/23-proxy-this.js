const target = {
    m: function () {
        console.log(this === proxy);
    }
}
const handler = {};

const proxy = new Proxy(target, handler);

console.log(target.m());    //false
console.log(proxy.m());     //true