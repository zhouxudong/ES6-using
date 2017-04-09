var twice = {
    apply(target, ctx, args) {
        return Reflect.apply(...arguments) * 2;
    }
};

function sum(num1, num2) {
    return num1 + num2;
};

var proxy = new Proxy(sum, twice);

console.log(proxy(1,2));    //6
console.log(proxy.call(null, 5,6)); //22
console.log(proxy.apply(null, [7,8]));  //30
console.log(Reflect.apply(proxy, null, [9,10]));    //38
