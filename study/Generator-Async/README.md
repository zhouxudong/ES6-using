# Generator 函数的异步应用

## 协程
传统的编程语言，早有异步编程的解决方案（其实就是多任务的解决方案）。其中有一种
叫做"协程"（coroutine),意思是多个线程互相写协作，完成异步任务。

协程有点像函数，又有点像线程。它的运行流程大致如下。
* 第一步，协程A开始执行。
* 第二步，协程A执行到一半，进入暂停，执行权转移到协程B。
* 第三步， （一段时间后）协程B交还执行权。
* 第四部， 协程A恢复执行。

上面流程的协程A，就是异步任务，因为它分成两段（或多段）执行。

举例来说，读取文件的协程写法如下。

```javascript
function *asyncJob(){
    //...
    var f = yield readFile(fileA);
    //...
}
```
上面代码的函数asyncJob是一个协程，它的奥妙就在其中的yield命令。它表示执行到
此处，执行权交给其它协程。也就是说，yield命令是异步两个阶段的分界线。

协程遇到yield命令就暂停，等到执行权返回，再从暂停的地方继续往后执行。它的最大
优点，就是代码的写法非常像同步操作，如果去除yield命令，简直一摸一样。

## 协程的 Generator 函数实现

Generator函数是协程在ES6的实现，最大优点就是可以交出函数的执行权（即暂停执行）。

整个Generator函数就是一个封装的异步任务，或者说是异步任务的容器。异步操作需要暂停
的地方，都用yield语句著名。Generator函数的执行方法如下。

```javascript
//01-generator-async.js
function *gen(x) {
    var y = yield x + 2;
    return y;
}

var g = gen(1);
console.log(g.next());  //{value: 3, done: false}
console.log(g.next());  //{value: undefined: done: true}
```
上面代码中，调用Generator函数，会返回一个内部指针（即遍历器）g。这是Generator函数
不同于普通函数的另一个地方，即执行它不会返回结果，返回的是指针对象。调用指针g的next方法，
会移动内部指针（即执行异步任务的第一个段），指向第一个遇到的yield语句，上例是执行到x+2为止。

换言之，next方法的作用是分阶段执行Generator函数。每次调用next方法，会返回一个对象，
表示当前阶段的信息（value属性和done属性）。value属性是yield语句后面表达式的值，表示
当前阶段的值；done属性是一个布尔值，表示Generator函数是否执行完毕，即是否还有下一个阶段。

## Generator函数的数据交还和错误处理

Generator函数可以暂停执行和恢复执行，这是它能封装异步任务的根本原因。除此之外，它还有两个特性，
使它可以作为异步编程的完整解决方案：函数体内外的数据交换和错误处理机制。

next返回值的value属性,是Generator函数向外输出数据;next方法接受的参数，是向Generator函数
体内输入数据。

```javascript
function* gen(x){
    var y = yield x + 2;
    return y;
}
var g = gen(1);
g.next();       // {value: 3, done: false}
g.next(2);      // {value: 2, done: true}
```
上面代码中，第一个next方法的value属性，返回表达式x+2的值3。第二个next方法带有参数2,这个参数
可以传入Generator函数，作为上个阶段异步任务的返回结果，被函数体内的变量y接受。因此，这一步的
value属性，返回的就是2(变量y的值）。

Generator函数内部还可以部署错误处理代码，捕获函数体外抛出的错误。
```javascript
// 02-generator-err.js
function *gen(x) {
    try{
        var y = yield x + 2;
    }catch (e){
        console.log(e);
    }
    return y;
}
var g = gen(1);
g.next();
g.throw("error");
// error
```
上面代码的最后一行，Generator函数体外，使用指针对象的throw方法抛出的错误，可以被函数体内的
try...catch代码块捕获。这意味着，出错的代码与处理错误的代码，实现来时间和空间上的分离，这
对于异步编程无疑是很重要的。

## 异步任务的封装
下面用Generator函数，执行一个真实的异步任务。

```javascript
//03-generator-run.js
var fetch = require("node-fetch");

function * gen() {
    var url = "https://api.github.com/users/github";
    var result = yield fetch(url);

    console.log(result.bio);
}
```
上面代码中，Generator函数封装了一个异步操作，该操作先读取一个远程接口，然后从JSON格式的数据
解析信息。就像前面说过的，这段代码非常像同步操作，除了加上了yield命令。

执行这段代码的方法如下。

```javascript

var g = gen();
var result = g.next();

result.value.then(function (data) {
    return data.json();
}).then(function (data) {
    g.next(data)
})
```
上面代码中，首先执行Generator函数，获取遍历器对象，然后使用next方法，执行异步任务的第一阶段。
由于Fetch模块返回的是一个Promise对象，因此要用then方法调用下一个next方法。

可以看到，虽然Generator函数将异步操作表示的很简洁，但是流程管理却不方便（即何时执行第一阶段，
何时执行第二阶段）。

## Thunk函数
Thunk函数是自动执行Generator函数的一种方法。

## 参数的求值策略
求值策略的争论有两种。
* 一种是"传值调用"（call by value),即在进入函数体前，就计算参数表达式的值，再将值传入函数。 C
* 另一种是"传名调用"（call by name),即直接将参数表达式传入参数，只在用它时求值。 Haskell

```javascript
function f(a,b){
    return b;
}
f(3 * x * x - 2 * x -1, x);
```
上面代码中，函数f的第一个参数是一个复杂的表达式，但是函数体内根本没用到。对这个参数求值，实际上
是不必要的。因此，有一些计算机学家倾向与"传名调用"，即只在执行时求值。

## Thunk函数的含义
编译器的"传名调用"实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体。
这个临时函数就叫做Thunk函数。
```javascript
function f(m){
    return m * 2;
}
f(x + 5);

//等同于

var thunk = function(){
    return x + 5;
}
function f(thunk){
    return thunk() * 2;
}
```
上面代码中，函数f的参数x+5被一个函数替换了。凡是用到原参数的地方，对Thunk函数求值即可。

这就是Thunk函数的定义，它是"传名参数"的一种实现策略，用来替换某个表达式。

## JavaScript语言的Thunk函数
Javascript语言是传值调用，它的Thunk函数含义有所不同。在Javascript语言中，Thunk函数替换
的不是表达式，而是多参数函数，将其替换成一个只接受回调函数作为参数的但参数函数。

```javascript
//正常版本的readFile(多参数版本）
fs.readFile(fileName, callback);

//Thunk版本的readFile(单参数版本）
var thunk = function(fileName){
    return function(callback){
        return fs.readFile(fileName, callback);
    }
}

var readFileThunk = thunk(fileName);
readFileThunk(callback);
```
上面代码中,fs模块的readFile方法是一个多参数函数，两个参数分别为文件名和回调
函数。经过转化器处理，它变成了一个单参数函数，只接受回调函数作为参数。这个参数
版本，就叫做Thunk函数。

任何函数，只要参数有回调函数，就能写成Thunk函数的形式。下面是一个简单的Thunk函数转换器。

```javascript
//ES5版本
var Thunk = function(fn){
    return function(){
        var args = Array.prototype.slice.call(arguments);
        return function(callback){
            args.push(callback);
            return fn.apply(this, args);
        }
    }
}

//ES6版本
var Thunk = function(fn){
    return function(...args){
        return function(callback){
            return fn.call(this, ...args, callback);
        }
    }
}
```
使用上面的转换器，生成fs.readFile的Thunk函数。
```javascript
var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);
```

下面是一个完整的例子。

```javascript
//04-generator-thunk.js
function f(a,cb){
    cb(a);
}

let ft = Thunk(f);
let log = console.log.bind(console);
ft("a")(log)  // a
```

## Thunkify模块
生产环境的转换器，建议使用Thunkify模块。

使用方式如下。
```javascript
// 05-generator-thunkify.js
var thunkify = require("thunkify");
var fs = require("fs");

var read = thunkify(fs.readFile);

read('README.md')(function (err, str) {
    //...
})
```

## Generator函数的流程管理

Generator函数可以自动执行。

```javascript
function* gen(){
    //...
}
var g = gen();
var res = g.next();

while(!res.done){
    console.log(res.value);
    res = g.next();
}
```
上面代码中，Generator函数gen会自动执行完所有步骤

但是，这不适合异步操作。如果必须保证前一步执行完，才能执行后一步，上面的自动
执行就不可行。这时，Thunk函数就能派上用处。以读取文件为例。

下面的Generator函数封装了两个异步操作。

```javascript
//06-generator-thun-auto.js
var fs = require("fs");
var thunkify = require("thunkify");
var readFileThunk = thunkify(fs.readFile);

var gen = function* (){
    var r1 = yield readFileThunk('../data2.json');
    console.log(r1.toString());
    var r2 = yield readFileThunk('../data1.json');
    console.log(r2.toString());

}
```
上面代码中，yield命令用于将程序的执行权移出Generator函数，那么就需要一种方法，
将执行权再交还给Generator函数。

这种方法就是Thunk函数，因为它可以在回调函数里，将执行权还给Generator函数。
为了便于理解，我们先看如何手动执行上面这个Generator函数。

```javascript
var g = gen();
var r1 = g.next();
r1.value(function(err, data){
    if(err) throw err;
    var r2 = g.next(data);

    r2.value(function (err, data) {
        if(err) throw err;
        g.next(data);
    })
})
```

上面代码中，变量g是Generator函数的内部指针，表示目前执行到那一步。next方法负责
将指针移动到下一步，并返回改不的信息(value属性和done属性）。

仔细查看上面的代码，可以发现Generator函数的执行过程，其实是将同一个回调函数，
反复传入next方法的value属性。这使得我们可以用递归来自动完成这个过程。

## Thunk 函数的自动流程管理

Thunk函数真正的威力，在于可以自动执行Generator函数。下面就是一个基于Thunk函数的
Generator执行器。

```javascript
//07-generator-thunk-recursion.js
function run(fn){
    var gen = fn();

    function next(err, data){
        var result = gen.next(data);

        if(result.done) return;
        result.value(next);
    }

    next();
}
function* g(){
    //...
}
run(g);
```
上面代码的run函数，就是一个Generator函数的自动执行器。内部的next函数就是Thunk
的回调函数。next函数先将指针移到Generator函数的下一步(gen.next方法），然后判断
Generator函数是否结束（result.done），如果没结束，就将next函数再传入Thunk
函数（result.value),否则就直接退出。

有了这个执行器，执行Generator函数方便多了。不管内部有多少个异步操作，直接把Generator
函数传入run函数即可。当然，前提是每一个异步操作，都要是Thunk函数，也就是说，跟在yield
命令后面的必须是Thunk函数。

```javascript
var g = function* (){
    var f1 = yield readFile('fileA');
    var f2 = yield readFile('fileB');
    //...
    var fn = yield readFile('fileN');
}

run(g);
```
上面代码中，函数g封装了n个异步操作，只要执行run函数，这些操作就会自动完成。这样一来，
异步操作不仅可以写的像同步操作，而且一行代码就可以执行。

Thunk函数并不是Generator函数自动执行的唯一方案。因为自动执行的关键是，必须有一种机制，
自动控制Generator函数的流程，接收和交还程序的执行权。回调函数可以做到这一点，Promise
对象也可以。

## co 模块用于Generator函数的自动执行。

下面是一个Generator函数，用于依次读取两个文件。

```javascritp
//08-generator-co.js

var gen = function* (){
    var f1 = yield readFile("../data1.json");
    var f2 = yield readFile("../data2.json");

    console.log(f1.toString());
    console.log(f2.toString());
}
```
co模块可以让你不用编写Generator函数的执行器。
```javascript
var co = require("co");
co(gen);
```
上面代码中，Generator函数只要传入co函数，就会自动执行。

co函数返回一个Promise对象，因此可以用then方法添加回调函数。

```javascript
co(gen).then(function () {
    console.log("Generator函数执行完成")
});
```

## co模块的原理
前面说过，Generator就是一个异步操作的容器。它的自动执行需要一种机制，当异步操作有了结果，
就能自动交回执行权。

两种方法可以做到这一点。

1。回调函数。将异步操作包装成Thunk函数，在回调函数里面交回执行权。

2。Promise对象。将异步操作包装成Promise对象，用then方法交回执行权。

co模块其实就是将两种自动执行器（Thunk函数和Promise对象）,包装成一个模块。使用co的前提
条件是，Generator函数的yield命令后面，只能是Thunk函数或Promise对象。如果数组或对象
的成员，全部都是Promise对象，也可以使用co。

## (基于Promise对象的自动执行)[https://github.com/zhouxudong/ES6-using/blob/master/study/Generator-Async/09-generator-promise.js]

## co模块的源码

首先，co函数接受Generator函数作为参数，返回一个Promise对象。
```javascript
function co(gen){
    var ctx = this;

    return new Promise(function(resolve, reject){
    })
}
```

在返回到Promise对象里面，co先检查参数gen是否为Generator函数。如果是，就执行该函数，
得到一个内部指针对象；如果不是就返回，并将Promise对象的状态改为resolved.

```javascript
function co(gen){
    var ctx = this;

    return new Promise(function(resolve, reject){
        if(typeof gen === 'function') gen = gen.call(ctx);
        if(!gen || typeof gen.next !== 'function') return resolve(gen);
    })
}
```
接着，co将Generator函数的内部指针对象的next方法，包装成onFulfilled函数。
这主要是为了能够捕捉抛出的错误。

```javascript
function co(gen){
    var ctx = this;

    return new Promise(function(resolve, reject){
        if(typeof gen === 'function') gen = gen.call(ctx);
        if(!gen || typeof gen.next !== 'function') return resolve(gen);

        onFulfilled();
        function onFulfilled(res){
            var ret;
            try{
                ret = gen.next(res);
            }catch(e){
                return reject(e);
            }
            next(ret);
        }
    })
}
```
最后，就是关键的next函数，它会反复调用自身。
```javascript
function next(ret){
    if(ret.done) return resolve(ret.value);
    var value = toPromise.call(ctx, ret.value);
    if(value && isPromise(value)) return value.then(onFulfilled, onRejected);
    return onRejected(
        new TypeError(
            'You may only yield a function, promise, generator, array, or object,'
            + 'but the following object was passed:"'
            + String(ret.value)
            + '"'
        )
    )
}
```
上面代码中，next函数的内部代码，一共只有四行命令。

第一行，检查当前是否为Generator函数的最后一步，如果是就返回。

第二行，确保每一步的返回值，是Promise对象。

第三行， 使用then方法，为返回值加上回调函数，然后通过onFulfilled函数再次调用next函数。

第四行， 在参数不符合要求的情况下（参数非Thunk函数和Promise对象），将Promise对象的状态
改为rejected,从而终止执行。

## 处理并发的异步操作
co支持并发的异步操作，即允许某些操作同时进行，等到它们全部完成，才进行下一步。

这时，要把并发的操作都放在数组或对象里面，跟在yield语句后面。
```javascript
//数组的写法
co(function* (){
    var res = yield [
        Promise.resolve(1),
        Promise.resolve(2)
    ];
    console.log(res);
}).catch(onerror);

//对象的写法
co(function* (){
    var res = yield {
        1: Promise.resolve(1),
        2: Promise.resolve(2)
    };
    console.log(res);
}).catch(onerror);
```

下面是另一个例子
```javascript
co(function* (){
    var values = [n1, n2, n3];
    yield values.map(somethingAsync);
})

function* somethingAsync(x){
    //do something async
    return y
}
```
上面的代码允许并发三个somethingAsync异步操作，等到它们全部完成，才会进行下一步。

## 实例： 处理Stream
Node提供Stream模式读写数据，特点是一次只处理数据的一部分，数据分成一块块一次处理，
就好像"数据流"一样。这对于处理大规模数据非常有利。Stream模式使用EventEmitter API,
会释放三个事件。

* data事件： 下一块数据块已经准备好了。
* end事件： 整个"数据流"处理完了。
* error事件： 发生错误。

使用Promise.race()函数，可以判断这三个事件之中那一个最先发生，只有当data事件最先
发生时，才进入下一个数据块的处理。从而，通过一个while循环，完成所有数据的读取。

```javascript
//10-generator-co-stream.js
const co = require("co");
const fs = require("fs");

const stream = fs.createReadStream('./README.md');
let valjeanCount = 0;

co(function* () {
    while (true){
        const res = yield Promise.race([
            new Promise( resolve => stream.once('data', resolve)),
            new Promise( resolve => stream.once('end', resolve)),
            new Promise( (resolve, reject) => stream.once('error', reject))
        ]);
        if(!res) {
            break;
        }
        stream.removeAllListeners('data');
        stream.removeAllListeners('end');
        stream.removeAllListeners('error');
        valjeanCount += (res.toString().match(/valjean/ig) || []).length;
    }
    console.log("count", valjeanCount); ／／count : 5
})

```
上面代码采用Stream模式读取文件，对于每个数据块都是用stream.once方法，在data、
end、error三个事件上添加一次回调函数。变量res只有在data事件发生时，才有值。然后，
累加每个数据块之中valjean这个词出现的次数。







