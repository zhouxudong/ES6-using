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









