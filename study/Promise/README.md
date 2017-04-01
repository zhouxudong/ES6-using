# Promise 对象
## Promise 的含义
Promise是异步编程的一种解决方法，比传统的解决方案--回调函数和事件--
更合理和更强大。

所谓Promise,就是一个容器，里面保存这某个未来才会结束的事件（通常
是一个异步操作）的结果。从语法上说，Promise是一个对象，从它可以
获取异步操作的消息。Promise提供统一的API，各种异步操作都可以用同样的方法处理

Promise对象有以下两个特点。

（1）对象的状态不受外界影响。Promise对象代表一个异步操作，有三种
状态: Pending(进行中)、Resolved(已完成)和Rejected(已失败）.
只有异步操作的结果，可以决定当前是哪一种状态，任何其它操作都无法改变
这个状态。这也是Promise这个名字的又来，它的英语意思就是"承诺",表示其它手法无法改变

（2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。Promise对象的状态
改变，只有两种可能：从Pending变为Resolved 和 从Pending变为Rejected.只要这两种
状况发生，状态就凝固了，不会再变了，会一直保持这个结果。如果改变已经发生了,
你再对Promise对象添加回调函数，也会立即得到这个结果。这与事件(Event)完全不同。
事件的特点是，如果你点了它，再去监听，是得不到结果的。

## Promise基本用法
Promise对象是一个构造函数，用来生成Promise实例。

下面代码创造了一个Promise实例
```javascript
var promise = new Promise(function(resolve, reject){
    //...somecode
    if(/*异步操作成功*/){
        resolve(value);
    }else{
        reject(error);
    }
})
```
Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是`resolve`和`reject`.<br>
它们是两个函数，有Javascript引擎提供，不用自己部署。

resolve函数的作用是，将Promise对象的状态从"未完成"变为"完成"，在异步操作成功是调用，并将
异步操作的结果，作为参数传递出去；reject函数的作用是，将Promise对象的状态从"未完成"变为
"失败"，在异步操作失败时调用，并将一步操作报出的错误，作为参数传递出去。

Promise实例生成以后，可以用then方法分别指定Resolved状态和Reject状态的回调函数。

```javascript
promise.then(function(value){
//success code
},function(error){
//error code
})
```
then方法可以接受两个回调函数作为参数。第一个回调函数是Promise对象的状态变为Resolved时调用，
第二个回调函数是Promise对象的状态变为Reject时调用。其中，第二个函数是可选的。这两个函数都
接受Promise对象穿出的值作为参数。

```javascript
function timeout(ms){
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms, 'done');
    })
}

timeout(100).then( value => {
    console.log(value);
})
```
上面代码中，timeout方法返回一个Promise实例，表示一段时间以后才会发生的结果。过了指定时间（ms)
以后，Promise实例状态变为Resolved, 就会触发then方法绑定的第一个回调函数。

Promise新建后就会立即执行。
```javascript
let promise = new Promise(function (resolve, reject) {
    console.log("promise");
    resolve();
})
promise.then(function () {
    console.log("Resolved.");
})
console.log("Hi");

//promise
//Hi
//Resolve
```
上面代码中，Promise新建后立即执行，所以首先输出的是"promise"。然后，then方法指定的
回调函数，将在当前脚本所有同步任务执行完才会执行，所以"Resolved"最后输出。

```javascript
function loadImageAsync(url) {
    return new Promise(function (resolve, reject) {
        var image = new Image();

        image.onload = function () {
            resolve(image);
        }
        image.error = function () {
            reject(new Error('could not load image at' + url));
        }

        image.src = url;
    })
}
```
上面代码中，使用Promise包装了一个图片加载的异步操作。如果加载成功，就调用resolve方法，
否则就调用reject方法

下面是一个用Promise对象实现的Ajax操作的例子 (代码)[https://github.com/zhouxudong/ES6-using/blob/master/study/Promise/promise_t1.js]

```javascript
var getJSON = function (url) {
    var promise = new Promise((resolve,reject) => {
        var client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "json";
        client.setRequestHeader("Accept", "application/json");
        client.send();

        function handler() {
            if(this.readyState !== 4){
                return;
            }
            if(this.status === 200){
                resolve(this.response);
            }else{
                reject(new Error(this.statusText))
            }
        }
    })
    return promise;
}
getJSON("posts.json").then( function (json) {
    console.log('contents:' + json);
},function (error) {
    console.log('error', error);
})
```
上面代码中，getJSON是对XMLHttpRequest对象的封装，用于发出一个针对JSON数据的
HTTP请求，并且返回一个Promise对象。需要注意的是，在getJSON内部，resolve函数
和reject函数调用时，都带有参数。

如果调用resolve函数和reject函数时带有参数，那么它们的参数会被传递给回调函数。
reject函数的参数通常是Error对象的实例；resolve函数的参数除了正常的值以外，还
可能是另一个Promise实例，表示一个异步操作的结果可能是一个值，也可能是另一个异步
操作，比如像下面这样。

```javascript
var p1 = new Promise(function(resolve, reject){
    //...
})
var p2 = new Promise(function(resolve, reject){
    resolve(p1);
})
```

上面代码中，p1和p2都是Promise的实例，但是p2的resolve方法将p1作为参数，即一个异步
操作的结果返回另一个异步事件。

这是，p1的状态就会传递给p2,也就是说，p1的状态决定了p2的状态。如果p1的状态是Pending，
那么p2的回调函数会等待p1的状态改变；如果p1的状态已经是Resolved或者Rejected，那么p2
的回调函数将会立即执行。

```javascript
var d1 = Date.now();
var p1 = new Promise(function (resolve, reject) {
    setTimeout( () => reject(new Error("fail")), 3000)
})
var p2 = new Promise(function (resolve, reject) {
    setTimeout( () => resolve(p1), 1000)
})
p2.then( result => console.log(result))
.catch( error => {
    console.log(error);

    var d2 = Date.now();
    console.log("time:" +  (d2 -d1 ) / 1000)
})

//Error: fail
//time: 3.022

```
上面代码中，p1是一个Promise，3秒之后变为rejected。p2的状态在一秒之后改变，
resolve方法返回的是p1。由于p2返回的是另一个promise,导致p2自己的状态无效了，
由p1的状态决定p2的状态。所以，后面的then语句都变成针对p1。又过了2秒，p1变为
rejected，导致触发catch方法的回调函数。

## Promise.prototype.then()

Prommise实例具有then方法，也就是说，then方法是定义在原型对象Promise.prototype上的。

then方法返回的是一个新的Promise实例，因此，可以采用链式写法，即then方法后面再调用另一个then方法。

```javascript
getJSON("posts.json").then(function(json){
    return json.post;
}).then(function(post){
    //...
})
```
上面代码使用then方法，一次指定了两个回调函数。第一个回调函数完成以后，会将放回结果
作为参数，传入第二个回调函数。

采用链式的then，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回
的还是一个Promise对象，这时，后一个回调函数，就会等待该Promise对象的状态发生变化，
才会被调用。

```javascript
getJSON("province.json").then( function(post){
    return getJSON("city.json?province=" + post.id);
}).then(function funcA(city){
    console.log("Resolved" + city);
},function funcB(err){
    console.log("Rejected:" ,err);
})
```
上面代码中，第一个then方法返回一个Promise对象。这时，第二个then方法指定的回调函数，
就会等待这个新的Promise对象状态发生变化。如果变为Resolved,就调用funcA,如果状态变为
Rejected,就调用funcB.

## Promise.prototype.catch()
Promise.prototype.cath方法是.then(null,rejection)的别名，用于指定发生错误是的回调函数
```javascript
getJSON("posts.json").then(function(posts){
    //...
}).catch(function(err){
    //处理getJSON和前一个回调函数运行时发生的错误
    console.log('err',err);
})
```

上面代码中，getJSON返回一个Promise对象，如果该对象变为Rejected， 则会调用then 方法指定的
回调函数；如果异步操作抛出错误，状态就会变为Rejected,就会调用catch方法指定的回调函数，处理
这个错误。另外，then方法指定的回调函数，如果运行中抛出错误，也会被catch方法捕获。

```javascript
var promise = new Promise(function(resolve, reject){
    throw new Error('test');
})
promise.catch(function(error){
    console.log(error);
})
//Error: test
```

Promise对象的错误具有"冒泡"性质，会一直向后传递，知道被捕获为止。也就是说，错误
总是会被下一个catch语句捕获。

```javascript
getJSON('posts.json').then(function(post){
    return getJSON(post.commentURL);
}).then(function(comments){
    //some code
}).catch(function(error){
    //处理前面三个Promise产生的错误
})
```
上面代码中，一共有三个Promise对象：一个有getJSON产生，两个由then产生。它们之中任何一个
抛出错误，都会被最后一个catch捕获。

一般来说，不要在then方法里面定义Rejected状态的回调函数,总是使用catch方法。

```

跟传统的try/catch代码不同的是，如果没有使用catch方法指定错误处理的回调函数，
Promise对象抛出的错误不会传递到外层代码，即不会有任何反应。

```javascript
var someAsyncThing = function(){
    return new Promise(function(resolve, reject){
        //下面一行会报错，因为x没有声明
        resolve(x + 2);
    })
}
someAsyncThing().then(function(){
    console.log('everything is great');
})
```
上面代码中，someAsyncThing函数产生的Promise对象会报错，但是由于没有指定
catch方法，这个错误不会被捕获，也不会传递到外层代码，导致运行后没有任何
输出。

需要注意的是，catch方法返回的还是一个Promise对象，因此后面还可以接着调用then方法。

```javascript
Promise.resolve()
.catch(function(error){
    console.log('oh no', error);
})
.then(function(){
    console.log('carry on');
})
//carry on

```
上面的代码，因为没有报错，跳过了catch方法，直接执行后面的then方法。此时，
要是then方法里面报错，就与前面的catch无关了。

catch方法中，还能在抛出错误

```javascript
var someAsyncThing = function(){
    return new Promise(function(resolve, reject){
        resolve(x + 2)
    })
}
someAsyncThing().then(function(){
    return someOtherAsyncThing();
}).catch(function(error){
    console.log('oh no', error);
    y + 2;
}).catch(function(error){
    console.log('carry on', error);
})

//oh no [ReferenceError: x is not defined]
//carry on [ReferenceError: y is not defined]
```

## Promise.all()

Promise.all方法用于将多个Promise实例，包装成一个新的Promise实例
```javascript
var p = Promise.all([p1, p2, p3]);
```
上面代码中,Promise.all方法接受一个数组参数，p1, p2, p3都是Promise对象的实例将，
如果不是，就会先调用Promise.resolve方法，将参数转为Promise实例，再进一步处理。
(Promise.all方法的参数可以不是 数组，但必须具有Iterator接口，且返回的每个成员
都是Promise实例)

p的状态有p1, p2, p3决定，分成两种情况。
1。只有p1, p2, p3的状态都变成fulfilled,p的状态才会变成fulfilled,此时，p1, p2, p3
的返回值组成一个数组，传递给p的回调函数。

2。只要p1, p2, p3之中有一个被rejected, p的状态就变成rejected,此时第一个reject的实例
的值返回，会传递给p的回调函数。

```javascript
//生成一个promise对象的数组
var promises = [2,3,4,5,6].map(function(id){
    return getJSON("post" + id + ".json");
})

Promise.all(promises).then(function(posts){
    //...
}).catch(function(reason){
    //...
})
```
上面代码中，Promises 是包含5个Promise实例的数组，只有这5个实例的状态都变成fulfilled，
或者其中一个变为rejected，才会调用Promise.all方法后面的回调函数。

```javascript
const databasePromise = connectDatabase();

const booksPromise = databasePromise.then(findAllBooks);

const userPromise = databasePromise.then(getCurrentUser);

Promise.all([booksPromise, userPromise])
.then(([books, users]) => pickTopRecommentations(books, user));
```
上面的代码中，booksPromise和userPromise是两个一步操作，只有等到它们的结果都
返回了，才会触发pickTopRecommentations这个回调函数

## Promise.race()

Promies.race方法同样是将多个Promise实例，包装成一个新的Promise实例。
```javascript
var p = Promise.race([p1, p2, p3])
```

上面代码中，只要p1, p2, p3之中有一个实例率先改变状态，p的状态就跟着改变。
那个率先改变的Promise实例的返回值，就传递给p的回调函数。

下面是一个例子，如果指定时间内没有获得结果，就将Promise的状态变为reject,
否则变为resolve.

```javascript
const p = Promise.race([
    fetch('/resoure-t'),
    new Promise(function(resolve, reject){
        setTimeout( () => reject(new Error('request timeout')), 5000)
    })
]);
p.then(response => console.log(response));
p.catch(error => console.log(error));
```
上面代码中，如果5秒内fetch方法无法返回结果，变量p的状态就会变为reject，
从而触发catch方法指定的回调函数。

## Promise.resolve()

有时需要将现有对象转为Promise对象，Promise.resolve方法就起到这个作用。
```javascript
var jsPromise = Promise.resolve($.ajax('/what.json'));
```
上面代码将jQuery生成的deferred对象，转为一个新的Promise对象。

Promise.resolve等价于下面的写法。
```javascript
Promise.resolve('foo');
//等价于
new Promise(resolve => resolve('foo'))
```

Promise.resolve方法的参数份4中情况。
1。参数是一个Promise实例。  不做任何修改
2。参数是一个thenable对象。

thenabel对象指的是具有then方法的对象，比如下面这个对象
```javascript
let thenable = {
    then: function(resolve, reject){
        resolve(20);
    }
}
```
Promise.resolve方法会将这个对象转为Promise对象，然后就立即执行
thenable对象的then方法。

```javascript
let thenable = {
    then: function(resolve, reject){
        resolve(20);
    }
}

let p1 = Promise.resolve(thenable);
p1.then(function(value){
    console.log(value); //20
})
```
上面代码中，thenable对象的then方法执行后，对象p1的状态就变为resolved，从而
立即执行最后那个then方法指定的回调函数，输出20.

3。参数不是具有then方法的对象，或根本就不是对像

```javascript
var p = Promise.resolve('Hello');
p.then(function(s){
    console.log(s)
})
// Hello
```
上面代码生成一个新的Promise对象的实例p。由于字符串Hello不属于异步操作（判断
方法是它不具有then方法的对象),返回Promise实例的状态从一生成就是Resolved,
所以回调函数会立即执行。Promise.resolve方法的参数，会同时传给回调函数。

4。不带任何参数

Promise.resolve方法允许调用时不带参数，直接返回一个Resolved状态的Promise对象。

```javascript
setTime(function(){
    console.log('three');
},0)

Promise.resolve().then(function(){
    console.log('two');
})

console.log('one');

//one
//two
//three
```
上面代码中，setTimeout(fn, 0)在下一轮"事件循环"开始时执行， Promise.resolve()在
本轮"事件循环"结束时执行，console.log则是立即执行。

## Promise.reject();
Promise.reject(reason) 方法也会返回一个新的Promise实例，该实例的状态为rejected.

```javascript
var p = Promise.reject('err on');
//等同于
var p = new Promise( (resolve, reject) => reject('err on'))

p.then(null, function(s){
    console.log(s)
})
//err on
```









