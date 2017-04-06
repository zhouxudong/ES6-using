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




