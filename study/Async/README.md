# async 函数

## 含义
ES2017标准引入了async函数，使得异步操作变得更加方便。

async函数简单说来就是Generator函数的语法糖。

用Generator函数，依次读取两个文件。
```javascript
var fs = require('fs');

var readFile = function(fileName){
    return new Promise(function(resolve, reject){
        fs.readFile(fileName, function(err, data){
            if(err) reject(err);

            resolve(data);
        })
    })
}
var gen = function* (){
    var f1 = yield readFile('../data1.json');
    var f2 = yield readFile('../data2.json');
}
```

写成async函数

```javascript
//01-async-readFile.js
var asyncReadFile = async function(){
    var f1 = await readFile("../data1.json");
    var f2 = await readFile("../data2.json");
}
```

比较发现，async函数就是将Generator函数的星号（*）替换成async，将yield替换成await。
仅此而已。

async函数对Generator函数的改进，体现在以下四点。

（1）内置执行器

Generator函数的执行必须依靠执行器，所以才有了co模块，而async函数自带执行器。也就是
说，async函数的执行，与普通函数一摸一样，只要一行。

```javascript
var result = asyncReadFile();
```
上面的代码调用了asyncReadFile函数，然后它就会自动执行，输出最后结果。这完全不像
Generator函数，需要调用next方法，或者用co模块，才能真正执行。

（2）更好的语义
async和await,比起星号和yield，语义更清楚了。async表示函数里有异步操作，await表示
紧跟在后面的表达式需要等待结果。

（3）更广的适用性

co模块约定，yield命令后面只能是Thunk函数或Promise对象，而async函数的await命令后面，
可以是Promise对象和原始类型的值（数值、字符串和布尔值，但这时等同于同步操作）。

（4）返回值是Promise。
async函数的返回值是Promise对象，这比Generator函数的返回值是Iterator对象方便多了。
你可以用then方法指定下一步的操作。

进一步说，async函数完全可以看作多个异步操作，包装成的一个Promise对象，而await命令就是
内部then命令的语法糖。


## 基本用法

async函数返回一个Promise对象，可以使用then方法添加回调函数。当函数执行的时候，一旦遇到
await就会先返回，等到异步操作完成，再接着执行函数体内后面的语句。

下面是一个例子。
```javascript
async function getStockPriceByName(name){
    var symbol = await getStockSymbol(name);
    var stockPrice = await getStockPrice(symbol);

    return stockPrice;
}
getStockPriceByName("good").then(function (result){
    console.log(result);
})
```
上面代码是一个获取股票报价的函数，函数前面的async关键字，表明该函数内部有异步操作。
调用该函数时，会立即返回一个Promise对象。

下面是另一个例子，指定多少毫秒后输出一个值。
```javascript
//02-async-timeout.js
function timeout(ms) {
    return new Promise( resolve => {
        setTimeout(resolve, ms);
    })
}

async function asyncPrint(value, ms) {
    await timeout(ms);
    console.log(value);
}
asyncPrint("hello world", 1000);
```
上面代码指定1秒后输出"hello world".

由于async函数返回的是Promise对象，可以作为await命令的参数。所以，上面的例子也可以
写成下面的形式。
```javascript
//03-async-promise.js
async function timeout(ms) {
    await new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

async function asyncPrint(value, ms) {
    await timeout(1000);
    console.log(value);
}

asyncPrint("hello world", 1000);
```
async函数有多种使用形式。

```javascript
//函数声明
async function foo() {}

//函数表达式
const foo = async function() {};

//对象的方法
let obj = {async foo(){}};
obj.foo().then(...)

//箭头函数
const foo = async () => {}

//class的方法
class Storage {
    constructor(){
        this.cachePromise = caches.open('avatars');
    }

    async getAvatar(name) {
        const cache = await this.cachePromise;
        return cache.match(`/avatars/${name}.jpg`);
    }
}

const storage = new Storage();
storage.getAvatar('jake').then(...);
```

## 返回Promise对象
async函数返回一个Promise对象。

async函数内部return语句返回的值，会成为then方法回调函数的参数。
```javascript
//04-async-return-param.js
async function f() {
    return 'hello world'
}

f().then( v => console.log(v));
// 'hello world'
```

上面代码中，函数f内部return 命令返回的值，会被then方法回调函数接收到。

async函数内部抛出错误，会导致返回的Promise对象变为reject状态。抛出的错误对象
会被catch方法回调函数接收到。

```javascript
//05-async-throw-param.js
async function f() {
    throw new Error("find error");
}

f().then(
    v => console.log(v),
    e => console.log(e)
)
// finde error
```
## Promise对象的状态化

async函数返回的Promise对象，必须等到内部所有await命令后面的Promise对象执行完，
才会发生状态改变，除非遇到return语句或抛出错误。也就是说，只有async函数内部的
异步执行完，才会执行then方法指定的回调函数。

下面是一个例子。
```javascript
async function getTitle(url) {
    let response = await fetch(url);
    let html = await response.text();
    return html.match(/<title>([\s\S]+)<\/title>/i)[1];
}
getTitle('https://tc39.github.io/ecma262/').then(console.log);
```
上面代码中，函数getTitle内部有三个操作：抓取网页、取出文本、匹配页面标题。只有这三个
操作全部完成，才会执行then方法里面的console.log。

## await命令
正常情况下，await命令后面是一个Promise对象。如果不是，会被转成一个立即resolve的Promise对象。
```javascript
async function f(){
    return await 123;
}
f().then( v => console.log(v))
//123
```
上面代码中，await命令的参数是数值123，它被转成Promise对象，并立即resolve。

await命令后面的Promise对象如果变为reject状态，则reject的参数会被catch方法的回调
函数接收到。
```javascript
async function f(){
    await Promise.reject("error");
}
f()
.then( v => console.log(v))
.then( e => console.log(e))
//error
```
上面代码中，await语句前面没有return，但是reject方法的参数依然传入了catch方法的回调函数。
这里如果在await前面加上return，效果一样。

只要一个await语句后面的Promise变为reject,那么整个async函数都会中断执行。

```javascript
async function f() {
    await Promise.reject('error');
    await Promise.resolve("hello world");//不会执行
}
```
上面代码中，第二个await 语句是不会执行的，因为第一个await语句状态变成了reject。

有时，我们希望即使前一个异步操作失败，也不要中断后面的异步操作。这时可以将第一个await
放在try...catch结构里面，这样不管这个异步操作是否成功，第二个await都会执行。

```javascript
async function f(){
    try {
        await Promise.reject("error");
    }catch(e){
    }
    return await Promise.resolve('hello world');
}
f().then( v => console.log(v));
// hello world
```
另一种方法是await后面的Promise对象再跟一个catch方法，处理前面可能出现的错误。

```javascript
async function f() {
    await Promise.reject('出错')
        .catch(e => console.log(e));
    return await Promise.resolve('hello world');
}
f().then(v => console.log(v));
//出错
//hello world
```

多个await命令后面的异步操作，如果不存在继发关系，最好让他们同时触发。

```javascript
//写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

//写法二
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;
```
上面两种写法，getFoo和getBar都是同时触发，这样就会缩短程序的执行时间。

## async函数的实现原理
async函数的实现原理，就是将Generator函数和自动执行器，包装在一个函数里。

```javascript
async function fn(args){
    //...
}

//等同于

function fn(args) {
    return spawn(function* (){
        //...
    })
}
```
所有async函数都可以写成上面的第二种形式，其中的spawn函数就是自动执行器。

下面是spawn函数的实现。
```javascript
function spawn(genF) {
    return new Promise(function(resolve, reject){
        var gen = genF();
        function step(nextF){
            try{
                var next = nextF();
            }catch(e){
                return reject(e);
            }
            if(next.done) {
                return resolve(next.value);
            }
            Promise.resolve(next.value).then(function(v){
                step(function(){ return gen.next(v); });
            }, function(e){
                step(function(){ return gen.throw(e); })
            });
        }
        step(function() {return gen.next(undefined); })
    })
}
```

## 按顺序完成异步操作
实际开发中，经常遇到一组异步操作，需要按照顺序完成。比如，依次远程读取一组
URL，然后按照读取的顺序输出结果。

```javascript
async function logInOrder(urls) {
    for(const url of urls) {
        const response = await fetch(url);
        console.log(await response.text());
    }
}
```
上面代码的问题是所有远程操作都是继发。只有前一个url返回结果，才会去读取下一个url,
这样作效率很差，非常浪费时间。我们需要的是并发发出远程请求。

```javascript
async function logInOrder(urls) {
    //并发读取远程URL
    const textPromise = urls.map(async url => {
        const response = await fetch(url);
        return response.text();
    })

    //按次序输出
    for(const textPromise of textPromises) {
        console.log(await textPromise);
    }
}
```
上面代码中，虽然map方法的参数是async函数，但它是并发执行的，因为只有async函数内部是继发执行，
外部不受影响。后面的for...of循环内部使用了await，因此实现了按顺序输出。

## 异步遍历器
Iterator接口是一种数据遍历的协议，只要调用遍历器对象的next方法，就会得到一个对象，表示当前遍历
指针所在的那个位置的信息。next方法返回的结构是{value,done},其中value表示当前的数据的值，done
是一个布尔值，表示遍历是否结束。

这里隐含这一个规定，next方法必须是同步的，只要调用就必须立刻返回值。也就是说，一旦执行next方法，
就必须同步地得到value和done这两个属性。如果遍历指针正好指向同步操作，当然没有问题，但对于异步操作，
就不太合适了。目前的解决方法是，Generator函数里面的异步操作，返回一个Thunk函数或者Promise对象，
即value属性是一个Thunk函数或者Promise对象，等待以后返回真正的值，而done属性则还是同步产生的。

目前，有一个提案，为异步操作提供原生的遍历器接口，即value和done这两个属性都是异步产生，这
称为"异步遍历器"（Async Iterator).

## 异步遍历器的接口
异步遍历器的最大的语法特点，就是调用遍历器的next方法，返回一个Promise对象
```javascript
asyncIterator
    .next()
    .then( ({value,done}) => /*...*/);
```
上面代码中，asyncIterator是一个异步遍历器，调用next方法以后，返回一个Promise对象。因此，可以使用
then方法指定，这个Promise对象的状态变为resolve以后的回调函数。回调函数的参数，则是一个具有value和
done两个属性的对象，这个跟同步遍历器是一样的。

一个同步遍历器的接口，部署在Symbol.iterator属性上面。同样地，对象的异步遍历器接口，部署在Symbol.asyncIterator
属性上面。不管是什么样的对象，只要它Symbol.asyncIterator属性有值，就表示应该对它进行异步遍历。

下面是一个异步遍历的例子
```javascript
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncItrrator = asyncIterable[Symbol.asyncIterator]();

asyncItrrator
    .next()
    .then(iterResult1 => {
        console.log(iterResult1);   // {value: 'a', done: false}
        return asyncItrrator.next();
    })
    .then( iterResult2 => {
        console.log(iterResult2);   // { value: 'b', done: false}
        return asyncItrrator.next();
    })
    .then(iterResult3 => {
        console.log(iterResult3);   // {value: undefined, done: true}
    })
```
上面代码中，异步遍历器其实返回了两次值。第一次调用的时候，返回一个Promise对象；等到
Promise对象resolve了，再返回一个表示当前数据成员信息的对象。这就是说，异步遍历器与
同步遍历器最终行为是一致的，只是会先返回Promise对象，作为中介。

由于异步遍历器的next方法，返回的是一个Promise对象。因此，可以把它放在await命令后面

```javascript
async function f(){
    const asyncIterable = createAsyncIterable(['a', 'b']);
    const asyncItrrator = asyncIterable[Symbol.asyncIterator]();

    console.log(await asyncIterator.next());
    //{ value: 'a', done: false}
    console.log(await asyncIterator.next());
    //{ value: 'b', done: false }
    console.log(await asyncIterator.next());
    //{ value: undefined, done: true }
}
```
上面代码中，next方法用await处理以后，就不必使用then方法了。真个流程已经很接近同步
处理了。

注意，异步遍历器的next方法是可以连续调用的，不必等到上一步产生的Promise对象resolve
以后再调用。这种情况下，next方法会累计起来，自动按照每一步的顺序运行下去。下面是一个
例子，把所有的next方法放在Promise.all方法里面。

```javascript
const asyncGenObj = createAsyncIterable(['a', 'b']);
const [{value: v1}, {value: v2}] = await Promise.all([
    asyncGenObj.next(), asyncGenObj.next()
])
console.log(v1, v2);    //a b
```
另一种用法是一次性调用所有的next方法，然后await最后一步操作。

```javascript
const writer = openFile('someFile.text');
writer.next('hell');
writer.next('world');
await writer.return();
```

## for await...of
前面介绍过，for...of循环用于遍历同步的Iterator接口。新引入的for await...of循环，
则是用于遍历异步的Iterator接口。
```javascript
async function f() {
    for await(const x of createAsyncIterable(['a', 'b'])) {
        console.log(x);
    }
}
//a
//b
```
上面代码中，createAsyncIterable()返回一个异步遍历器，for...of循环自动调用这个遍历器的
next方法，会得到一个Promise对象。await用来处理这个Promise对象，一旦resolve,就把得到
的值（x)传入for...of的循环体。

for await...of 循环的一个用途，是部署了asyncIterable操作的异步接口，可以直接放入这个循环。

```javascript
let body = '';
for await(const data of req) body += data;
const parsed = JSON.parse(body);
console.log('got',parsed);
```
上面代码中，req是一个asyncIterable对象，用来异步读取数据。可以看到，使用for await...of循环
以后，代码会非常简洁。

如果next方法返回的Promise对象被reject，那么就要用try...catch捕捉。

```javascript
async function() {
    try{
        for await(const x of createRejectingIterable()) {
            console.log(x);
        }
    }catch(e) {
        console.error(e);
    }
}
```
注意，for await...of循环也可以用于同步遍历器。
```javascript
(async function(){
    for await(const x of ['a', 'b']) {
        console.log(x);
    }
})()
//a
//b
```

## 异步Generator函数
就像Generator函数返回一个同步遍历器对象一样，异步 Generator函数的作用，是返回
一个异步遍历器对象。

在语法上，异步Generator函数是async函数与Generator函数的结合。
```javascript
async function* readLines(path){
    let file = await fileOpen(path);

    try {
        while(!file.EOF) {
            yield await file.readLine();
        }
    }finally {
        await file.close();
    }
}
```
上面代码中，异步操作前面使用await关键字表明，即await后面的操作，应该返回Promise对象。
凡是使用yield关键字的地方，就是next方法停下来的地方，它后面的表达式的值（即await
file.readLine()的值），会作为next()返回对象的value属性，这一点与同步Generator函数一致。

可以像下面这样，使用上面代码定义的异步Generator函数。
```javascript
for await(const line of readLiens(filePath)) {
    console.log(line);
}
```
异步Generator函数可以与for await...of循环结合起来使用。
```javascript
async function* prefixLines(asyncIterable) {
    for await(const line of asyncIterable) {
        yield '>' + line;
    }
}
```
yield命令依然是立刻返回的，但返回的是一个Promise对象。

```javascript
async function* asyncGenerator() {
    console.log('Start');
    const result = await doSomethingAsync();//(A)
    yield 'Result: ' + result;// (B);
    console.log('Done');
}
```
上面代码中，调用next方法以后，会在B出暂停执行，yield命令立刻返回一个
Promise对象。这个Promise对象不同于A处await命令后面的那个Promise对象。
主要有两点不同，一是A处的Promise对象resolve以后产生的值，会放入result
变量；B处的Promise对象resolve以后产生的值，是表达式'Result: ' + result
的值；二是A处的Promise对象一定先于B处的Promise对象resolve.

如果异步Generator函数抛出的错误，会被Promise对象reject，然后抛出的错误被
catch方法捕获。

```javascript
async function* asyncGenerator() {
    throw new Error('Problem!');
}
asyncGenerator()
.next()
.catch( err => console.log(err));//Error: Problem!
```
注意，普通的async函数返回的是一个Promise对象，而异步Generator函数返回的是一个
异步Iterator对象。基本上，可以这样理解，async函数和异步Generator函数，是封装异步
操作的两种方法，都是来达到同一种目的。区别在于，前者自带执行器，后者通过for await...of
执行，或者自己编写执行器。下面是一个异步Generator函数的执行器。
```javascript
async function takeAsync(asyncIterable, count = Infinity) {
    const result = [];
    const iterator = asyncIterable[Symbol.asyncIterator]();
    while(result.length < count){
        const {value, done} = await iterator.next();
        if(done) break;
        result.push(value);
    }
    return result;
}
```
上面代码中，异步Generator函数产生的异步遍历器，会通过while循环自动执行，每当await iterator.next()
完成，就会进入下轮循环。

下面是这个自动执行器的一个使用实例。
```javascript
async function f() {
    async function* gen() {
        yield 'a';
        yield 'b';
        yield 'c';
    }
    return await takeAsync(gen());
}
f().then(function(result){
    console.log(result);    //['a', 'b', 'c']
})
```
异步Generator函数出现以后，Javascript就有来四种函数形式：普通函数、async函数、Generator函数和
异步Generator函数。请注意区分每种函数的不同之处。

最后，同步的数据结构，也可以使用异步Generator函数。
```javascript
async function* createAsyncIterable(asyncIterable){
    for(const elem of asyncIterable) {
        yield ele;
    }
}
```

上面代码中，由于没有异步操作，所以也就没有使用await关键字。

## yield* 语句
yield* 语句也可以跟一个异步遍历器。
```javascript
async function* gen1(){
    yield 'a';
    yield 'b';
    return 2;
}
async function* gen2() {
    const result = yield* gen1();
}
```
上面代码中，gen2函数里面的result变量，最后的值是2。

与同步Generator函数一样，for await...of循环会展开yield*.
```javascript
(async function(){
    for await(const x of gen2()){
        console.log(x);
    }
})();
// a
// b
```


