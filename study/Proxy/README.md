# Proxy

Proxy用于修改某些操作的默认行为，等同于在语言层面作出修改，所以属于一种"元编程"，
即对编程语言进行编程。

Proxy可以理解成，在目标对象之前架设一层"拦截"，外界对该对象的访问，都必须先通过
这层拦截，因此提供来一种机制，可以对外界的访问进行过滤和改写。Proxy这个词的原意
是代理，用在这里表示由他来"代理"某系操作，可以译为"代理器"。
```javascript
//01-proxy-obj.js
var obj = new Proxy( {}, {
    get: function(target, key, receiver) {
        console.log(`getting ${key}!`);
        return Reflect.get(target, key, receiver);
    },
    set: function(target, key, value, receiver) {
        console.log(`setting ${key}!`);
        return Reflect.set(target, key, value, receiver);
    }
})
```
上面代码对一个空对象架设了一层拦截，重定义来属性的读取（get) 和设置（set)行为。
这里暂时不解释具体的语法，只看运行结果。对设置了拦截行为的对象obj，去读写它的
属性，就会得到下面的结果。

```javascript
obj.count = 1
//setting count
++obj.count
//getting count!
//setting count
```
上面的代码说明，Proxy实际上重载（overload)了点运算符，即用自己的定义覆盖了语言的原始定义。

ES6原生提供Proxy构造函数，用来生成Proxy实例。
```javascript
var proxy = new Proxy(target, handler);
```

Proxy对象的所有用法，都是上面这种形式，不同的只是handler参数的写法。其中，new Proxy()
表示生成一个Proxy实例，target参数表示所要拦截的对象，handler参数也是一个对象，用来
定制拦截行为。

下面是另一个拦截读取属性行为的例子。
```javascript
var proxy = new Proxy({}, {
    get: function(target, property){
        return 35;
    }
});
proxy.time  //35
proxy.name  //35
proxy.title //35
```
上面代码中，作为构造函数，Proxy接受两个参数。第一个参数是所要代理的目标对象（上例是一个空对象），
即如果没有Proxy的介入，操作原来要访问的就是这个对象；第二个参数是一个匹配对象，对于每一个被代理
的操作，需要提供一个对应的处理函数，该函数将拦截对应的操作。比如，上面代码中，配置对象有一个get方法，
用来拦截对目标对象属性的访问请求。get方法的两个参数分别是目标对象和所要访问的属性。可以看到，由于
拦截函数总是返回35，所以访问任何属性都得到35。

注意，要使得Proxy起作用，必须针对Proxy实例（上例是Proxy对象）进行操作，而不是针对目标对象（上例
是空对象）进行操作。

如果handler没有设置任何拦截，那就等同于直接通向原对象。
```javascript
var target = {};
var handler = {};
var proxy = new Proxy(target, handler);
proxy.a = 'b';
target.a    //"b"
```
上面代码中，handler是一个空对象，没有任何拦截效果，访问proxy就等同于访问target.

一个技巧是将Proxy对象，设置到object.proxy属性，从而可以在object对象上调用。
```javascript
var object = {proxy: new Proxy(target, handler) };
```
Proxy实例也可以作为其它对象的原型对象。

```javascript
//02-proxy-proto.js
var proxy = new Proxy({}, {
    get: function (target, property) {
        return 35;
    }
})
var obj = Object.create(proxy);
console.log(obj.time);
//35
```
上面代码中，proxy对象是obj对象的原型，obj对象本身并没有time属性，所以根据原型链，
会在proxy对象上读取该属性，导致被拦截。

同一个拦截器函数，可以设置拦截多个操作。

```javascript
//03-proxy-oneToMore.js
var handler = {
    get: function (target, name) {
        if(name === 'prototype') {
            return Object.prototype;
        }
        return 'Hello,' + name;
    },

    apply: function (target, thisBinding, args) {
        return args[0];
    },
    construct: function (target, args) {
        return {value: args[1]}
    }
}

var fproxy = new Proxy(function (x, y) {
    return x + y;
}, handler);

console.log(fproxy(1,2));   // 1
console.log(new fproxy(1,2))    // {value: 2}
console.log(fproxy.prototype === Object.prototype); // true
console.log(fproxy.foo) // "Hello, foo"
```

下面是Proxy支持的拦截操作一览表。

对于可以设置、但没有设置拦截的操作，则直接落在目标对象上，按照原先的方式产生结果。

（1）get(target, propKey, receiver)

拦截对象属性的读取，比如proxy.foo 和 proxy['foo'].

最后一个参数receiver是一个对象，可选。

（2）set(target, propKey, value, receiver)

拦截对象属性的设置，比如proxy.foo = v或proxy['foo'] = v,返回一个布尔值。

(3)has(target, propKey)

拦截propKey in proxy的操作，返回一个布尔值。

（4）deleteProperty(target, propKey)

拦截delete proxy[propKey] 的操作，返回一个布尔值。

（5）ownKeys(target)

拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、
Object.keys(proxy),返回一个数组。该方法返回目标对象所有自身的属性的属性名，而
Object.keys()的返回结果仅包含目标对象自身的可遍历属性。

（6）getOwnPropertyDescriptor(target, propKey)

拦截Object.getOwnPropertyDescriptor(proxy, propKey),返回属性的描述对象。

（7）defineProperty(target, propKey, propDesc)

拦截Object.defineProperty(proxy, propKey, propDesc)、
Object.defineProperties(proxy, propDescs),返回一个布尔值。

（8）preventExtensions(target)

拦截Object.preventExtensions(proxy),返回一个布尔值。

（9）getPrototypeOf(target)

拦截Object.getPrototypeOf(proxy)，返回一个对象。

（10）isExtensible(target)

拦截Object.isExtensible(proxy),返回一个布尔值。

（11）setPrototypeOf(target, proto)

拦截Object.setPrototypeOf(proxy, proto),返回一个布尔值。

如果目标对象是函数，那么还有两种额外操作可以拦截。

（12）apply(target, object, args)

拦截Proxy实例作为函数调用的操作，比如proxy(...args)、proxy.call(object,...args)、
proxy.apply(...).

(13) construct(target, args)

拦截Proxy实例作为构造函数调用的操作，比如new proxy(...args).

## Proxy实例的方法

下面是上面这些拦截方法的详细介绍。

## get()

get方法用于拦截某个属性的读取操作。
```javascript
//04-proxy-get.js
var person = {
    name: 'zzz'
};
var proxy = new Proxy( person, {
    get: function (target, property) {
        if(property in target){
            return target[property];
        }else {
            throw new ReferenceError("property \"" + property + "\" does not exist.");
        }
    }
});
console.log(proxy.name);    //'zzz'
console.log(proxy.age);     // property 'age' does not exist
```
上面代码表示，如果访问目标对象不存在的属性，会抛出一个错误。如果没有这个拦截函数，
反问不存在的属性，只会返回undefined。

get方法可以继承。
```javascript
let proto = new Proxy({}, {
    get(target, propertyKey, receiver) {
        console.log('GET' + propertyKey);
        return target[propertyKey];
    }
})
let obj = Object.create(proto);
obj.xxx // "GET xxx"
```
上面代码中，拦截操作定义在Prototype对象上面，所以如果读取obj对象继承的属性时，
拦截会生效。

下面的例子使用get拦截，实现数组读取负数的索引。
```javascript
//05-proxy-get-arr.js
function createArray(...elements) {
    let handler = {
        get(target, propKey, receiver) {
            let index = Number(propKey);
            if(index < 0) {
                propKey = String(target.length + index);
            }
            return Reflect.get(target, propKey, receiver);
        }
    };

    let target = [];
    target.push(...elements);
    return new Proxy(target, handler);
}

let arr = createArray('a', 'b', 'c');
console.log(arr[-1]);   //c
```
上面代码中，数组的位置参数是-1，就会输出数组的倒数最后一个成员。

利用Proxy，可以将读取属性的操作(get)，转变为执行某个函数，从而实现属性
的链式操作。

```javascript
//06-proxy-get-chain.js
var gol = {
    double: n => n * 2,
    pow: n => n * n,
    reverseInt: n => n.toString().split("").reverse().join("") | 0

};

var pipe = (function(){
    return function (value) {
        var funcStack = [];
        var oproxy = new Proxy({}, {
            get: function( pipeObject, fnName) {
                if(fnName === 'get') {
                    return funcStack.reduce(function (val, fn) {
                        return fn(val);
                    },value);
                }
                funcStack.push(gol[fnName]);
                return oproxy;
            }
        })
        return oproxy;
    }
}());

console.log(pipe(3).double.pow.reverseInt.get);//63
```
上面代码设置Proxy以后，达到了将函数名链式使用的效果。

如果一个属性不可配置（configurable)和不可写（writable),则该属性不能被代理，
通过Proxy对象访问该属性会报错。
```javascript
const target = Object.defineProperties({}, {
    foo: {
        value: 123,
        writable: false,
        configurable: false
    }
})

const handler = {
    get(target, propKey) {
        return 'abc';
    }
};
const proxy = new Proxy(target, handler);

proxy.foo
//TypeError: Invariant check failed
```

## set()
set方法用来拦截某个属性的赋值操作。

假定Person对象有一个age属性，该属性应该是一个不大于200的整数，那么可以使用Proxy保证age的属性值符合要求。

```javascript
//07-proxy-set.js
var validator = {
    set: function (obj, prop, value) {
        if(prop === 'age') {
            if(!Number.isInteger(value)) {
                throw new TypeError('The age is not an integer')
            }
            if(value > 200) {
                throw new RangeError('The age seems invalid');
            }
        }
        //对于age以外的属性，直接保存
        obj[prop] = value;
    }
}

let person = new Proxy({}, validator);

person.age = 100;

console.log(person.age);
person.age = 'aaa'; //TypeError
parson.age = 300;   //RangeError
```

上面代码中，由于设置了存值函数set， 任何不符合要求的age属性赋值，都会抛出一个错误，
这是数据验证的一种实现方法。利用set方法，还可以数据绑定，即每当对象发生变化时，会
自动更新DOM。

有时，我们会在对象上面设置内部属性，属性名的第一个字符使用下划线开头，表示这个属性不因该
被外部使用。结合get和set方法，就可以做到防止这些内部属性被外部读写。

```javascript
//08-proxy-set-private.js
var handler = {
    get(target, key){
        invariant(key, 'get');
        return target[key];
    },
    set(target, key, value){
        invariant(key, 'set');
        target[key] = value;
        return true;
    }
};
function invariant(key, action) {
    if(key[0] === '_') {
        throw new Error(`Invalid attempt to ${action} private "${key}" property`)
    }
}
var target = {};
var proxy = new Proxy(target, handler);

proxy._prop = 'c'
//Error: Invalid attempt to set private "_prop" property
proxy._prop
//Error: Invalid attempt to get private "_prop" property
```
上面代码中，只要读写的属性名的第一个字符是下划线，一律抛错，从而达到禁止读写内部属性。

如果目标对象自身的某个属性，不可写也不可配置，那么set不得改变这个属性的值，只能返回同样的值。


## apply()
apply方法拦截函数的调用、call和apply操作。

apply方法可以接受三个参数，分别是目标对象、目标对象的上下文对象（this)和目标对象的参数数组。

```javascript
var handler = {
    apply(target, ctx, args){
        return Reflect.apply(...arguments);
    }
}
```
下面是一个例子
```javascript
//09-proxy-apply.js
var target = function () {
    return 'I am the target';
}
var handler = {
    apply: function () {
        return 'I am the proxy';
    }
}
var p = new Proxy(target, handler);
console.log(p())
//I am the proxy
```
上面代码中，变量p是Proxy的实例，当它作为函数调用时（ p() )，就会被apply方法
拦截，返回一个字符串。

```javascript
//10-proxy-apply.js
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
```
上面代码中，每当执行proxy函数（直接调用或call或apply调用),就会被apply方法拦截。

## has()
has方法用来拦截HasProperty操作，即判断对象是否具有某个属性时，这个方法会生效。
典型的操作就是in运算符。

下面的例子使用has方法隐藏某些属性，不被in运算符发现。

```javascript
//11-proxy-has.js
var handler = {
    has(target, key){
        if(key[0] === "_"){
            return false;
        }
        return key in target;
    }
};
var target = {_prop: 'bar', prop: 'foo'};
var proxy = new Proxy(target, handler);

console.log('_prop' in proxy);  //false
```
上面代码中，如果原对象的属性名的第一个字符是下划线，proxy.has就会返回false，
从而不会被in运算符发现。

如果原对象不可配置或禁止扩展，这是has拦截会报错。
```javascript
//12-proxy-has-preventEx.js
var obj = {a:10};
Object.preventExtensions(obj);

var p = new Proxy(obj, {
    has: function (target, prop) {
        return false;
    }
})

'a' in p    //TypeError is throw
```
上面代码中，obj对象禁止扩展，结果使用has拦截就会报错。也就是说，如果某个属性
不可配置（或者目标对象不可扩展），这has方法就不得"隐藏"（即返回false)目标对象
的该属性。

值得注意的是，has方法拦截的是HasProperty操作，而不是HasOwnProperty操作，即
has方法不判断一个属性是对象自身的属性，还是继承的属性。

另外，虽然for...in循环也用到了in运算符，但是has拦截对for...in循环不生效。
```javascript
//13-proxy-has-forIn.js
let stu1 = {name: 'san', score: 59};
let stu2 = {name: 'si', score: 99};

let handler = {
    has(target, prop) {
        if(prop === 'score' && target[prop] < 60) {
            console.log(`${target.name}不及格`);
            return false;
        }
        return prop in target;
    }
}

let oproxy1 = new Proxy(stu1, handler);
let oproxy2 = new Proxy(stu2, handler);

console.log('score' in oproxy1);
//san不及格
//false

console.log('score' in oproxy2);
//true

for(let a in oproxy1){
    console.log(oproxy1[a]);
}
//san
//59
```
上面代码中，has拦截只对in循环生效，对for...in循环不生效，导致不符合要求的属性
没有被排除在for...in循环之外。

## construct()
construct方法用于拦截new命令，下面是拦截对象的写法。

```javascript
var handler = {
    construct (target, args) {
        return new targrt(...args);
    }
}
```
construct方法可以接受两个参数。
* target: 目标对象
* args: 构建函数的参数对象

```javascript
//14-proxy-construct
var p = new Proxy(function(){}, {
    construct: function (target, args) {
        console.log('called: ' + args.join(', '));
        return {value: args[0] * 10}
    }
});

console.log(new p(1));
//called: 1
// {value: 10}
```
construct方法返回的必须是一个对象，否则会报错。

## deletePropperty()
deleteProperty方法用于拦截delete操作，如果这个方法抛出错误或者返回
false,当前属性就无法被delete命令删除。
```javascript
//15-proxy-delete.js
var handler = {
    deleteProperty(target, key){
        invariant(key, 'delete');
        return true;
    }
};
function invariant(key, action) {
    if(key[0] === '_') {
        throw new Error(`Invalid attempt to ${action} private "${key}" property`);
    }
}

var target = { _prop: 'foo' };
var proxy = new Proxy(target, handler);

delete proxy._prop
//Error: Invalid attempt to delete private "_prop" property
```
上面代码中，deleteProperty方法拦截了delete操作符，删除第一个字符为下划线的属性会报错。

注意，目标对象自身的不可配置的属性，不能被deleteProperty方法删除，否则报错。








