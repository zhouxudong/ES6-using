# Generator 函数的语法

## 基本概念
Generator函数是ES6提供的一种异步编程解决方案，语法行为与传统函数完全不同。

Generator函数有多种理解角度。从语法上，首先可以把它理解成，Generator函数
是一个状态机，封装了多个内部状态。

执行Generator函数会返回一个遍历器对象，也就是说，Generator函数除了状态机，
还是一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历Generator函数内部
的每一个状态。

形式上，Generator函数是一个普通函数，但是有两个特征。一是，function关键字与
函数名之间有一个星号；二是，函数体内部使用yield语句，定义不同的内部状态。

```javascript
function* helloWorldGenerator(){
    yield 'hello';
    yield 'world';
    return 'ending';
}
var hw = helloWorldGenerator();

hw.next();  // {value: 'hello', done: false}
hw.next();  // {value: 'world', done: false}
hw.next();  // {value: 'ending', done: true}
hw.next();  // {value: undefined, done: true}
```
上面代码定义了一个Generator函数 helloWorldGenerator,它内部有两个yield语句
"hello" 和 "world",即该函数有三个状态： hello, world 和 return语句(执行结束).

然后，Generator函数的调用方法与普通函数一样，也是在函数名后面加上一对圆括号。不同的是，
调用Generator函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的
指针对象，也就是上一章介绍的遍历器对象(Iterator Object).

下一步，必须调用遍历器对象的next方法，使得指针移向下一个状态。也就是说，每次调用next
方法，内部指针就从函数头部或上一次停下来的地方开始执行，知道遇到下一个yield语句（或return
语句)为止。换言之，Generator函数是分段执行的，yield语句是暂停执行的标记，而next方法可以恢复执行。

## yield语句
由于Generator函数返回的遍历器对象，只有调用next方法才会遍历下一个内部状态，所以其实提供了
一种可以暂停执行的函数。yield语句就是暂停的标志。

遍历器对象的next方法的运行逻辑如下。

1。遇到yield语句，就暂停执行后面的操作，并将紧跟在yield后面的那个表达式的值，作为返回
对象的value属性值。

2。下一次调用next方法时，再继续往下执行，直到遇到下一个yield语句。

3。如果没有再遇到新的yield语句，就一直运行到函数结束，直到return语句为止，并将return语句后面
的表达式的值，作为返回的对象的value属性值。

4.如果该函数没有return语句，则返回的对象的value属性值为undefined.

需要注意的是，yield语句后面的表达式，只有当调用next方法、内部指针指向该语句时才会执行，
因此等于为Javascript提供了手动的"惰性求值"的语法功能。

```javascript
function* gen(){
    yield 123 + 456;
}
```
上面代码中，yield后面的表达式123 + 456,不会立即求值，只会在next方法将指针移到这一句是，才会求值。

Generator函数可以不用yield语句，这是就变成了一个单纯的暂缓执行函数。

```javascript
function* f(){
    console.log("执行了");
}
var generator = f();
setTimeout(function(){
    generator.next();
},2000)
```
上面代码中，函数f如果是普通函数，在为变量generator赋值时就会执行。但是，函数f是一个Generator函数，
就变成只有调用next方法时，函数f才会执行。

yield语句如果用在一个表达式之中，必须放在圆括号里面。
```javascript
function* demo(){
    console.log('Hello' + yield);   //SyntaxError
    console.log('Hello' + yield 123);   //SyntaxError

    console.log('Hello' + (yield)); //OK
    console.log('Hello' + (yield 123)); //OK
}
```

yield语句作为函数参数或放在赋值表达式的右边，可以不加括号。
```javascript
function* demo(){
    foo(yield 'a', yield 'b');
    let input = yield; //OK
}
```

## 与Iterator接口的关系
任意一个对象的Symbol.iterator方法，等于该对象的遍历器生成函数，调用
该函数会返回该对象的一个遍历器对象。

由于Generator函数就是遍历器生成函数，因此可以把Generator赋值给对象的Symbol.iterator
属性，从而使得该对象具有Iterator接口。

```javascript
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
    yield 1;
    yield 2;
    yield 3;
}

[...myIterable] //[1,2,3]
```
上面代码中，Generator函数赋值给Symbol.iterator属性，从而使得myIterable对象具有了
Iterator接口，可以被...运算符遍历了。

Generator函数执行后，返回一个遍历器对象。该对象本身也具有Symbol.iterator属性，
执行后返回自身。
```javascript
function* gen(){
    //...
}
var g = gen();
g[Symbol.iterator]() === g
```
上面代码中，gen是一个Generator函数，调用它会生成一个遍历器对象g。它的Symbol.iterator
属性，也是一个遍历器对象生成函数，执行后返回它自己。

## next方法的参数
yield语句本身没有返回值，或者说总是返回undefined。next方法可以带一个参数，该参数就会
被当作上一个yield语句的返回值。

```javascript
//03-generator-nextParam.js
function *f() {
    for(var i = 0; true; i++){
        var reset = yield i;
        if(reset) {i = -1}
    }
}
var g = f();
console.log(g.next());      // {value: 0, done: false}
console.log(g.next());      // {value: 1, done: false}
console.log(g.next(true));  // {value: 0, done: false}
console.log(g.next());      // {value: 1, done: false}
```
上面代码先定义了一个可以无限运行的Generator函数f,如果next方法没有参数，
每次运行到yield语句，变量reset的值总是undefined。当next方法带一个参数
true时，变量reset就被重置为这个参数（即true)，因此i会等于-1,下一轮循环就会从-1开始递增。

这个功能有很重要的语法意义。Generator函数从暂停状态到恢复运行，它的上下问状态(context)
是不变的。通过next方法的参数，就有办法在Generator函数开始运行之后，继续向函数体内部注入值。
也就是说，可以在Generator函数运行的不同阶段，从外部向内部注入不同的值，从而调整函数行为。

```javascript
//04-generator-next-2.js
function *foo(x) {
    var y = 2 * (yield (x + 1));
    var z = yield (y / 3);
    return (x + y + z);
}
var a = foo(5);
console.log(a.next()); // {value: 6, done: false}
console.log(a.next()); // {value: NaN, done: false}
console.log(a.next()); // {value: NaN, done: true}

var b = foo(5);
console.log(b.next());  // {value: 6, done: false}
console.log(b.next(12));// {value: 8, done: false}
console.log(b.next(13));// {value: 42, done: true}
```
上面代码中，第二次运行next方法的时候不带参数，导致y的值等于 2 * undefined(即NaN),
除以3以后还是NaN,因此返回对象的value属性也等于NaN。第三次运行next方法的时候不带参数，
所以z等于undefined,返回对象的value属性等于 5 + NaN + undefined,即NaN。

如果向next方法提供参数，返回结果就完全不一样了。上面代码第一次调用b的next方法时，
返回x+1的值6；第二次调用next方法，将上一次yield语句的值设为12，因此y等于24，返回y/3的值8;
第三次调用next方法，将上一次yield语句的值设为13,因此z等于13，这是x=5,y=24,所以return语句
的值等于 5 + 24 + 13 = 42;

注意，由于next方法的参数表示上一个yield语句的返回值，所以第一次调用next方法时，不能带有参数。
V8引擎直接忽略第一次使用next方法时的参数，只有从第二次使用next方法开始，参数才是有效的。从
语义上讲，第一个next方法用来启动遍历器对象，所以不用待参数。

如果想要第一次调用next方法时，就能够输入值，可以在Generator函数外面再包一层。
```javascript
//05-generator-first-nextp.js
function wrapper(generatorFunc) {
    return function (...args) {
        let generatorObj = generatorFunc(...args);
        generatorObj.next();
        return generatorObj;
    }
}
const wrapped = wrapper(function* () {
    console.log(`First input: ${yield}`);
    return 'DONE';
})

wrapped().next('hello!');
//First input: hello!
```

## for...of循环

for...of循环可以自动遍历Generator函数的Iterator对象，且此时不再需要调用next方法。

```javascript
//06-generator-forOf.js
function *foo() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    return 5;
}
for(let v of foo()){
    console.log(v);
}
//1 2 3 4
```
上面代码使用for...of循环，依次显示5个yield语句的值。这里需要注意，一旦next方法的返回
对象的done属性为true,for...of循环就会终止，且不包含该返回对象，所以上面代码的return
语句返回的5不包含在for...of循环之中。

下面是一个利用Generator函数和for...of循环，实现斐波那契数列的例子。

```javascript
//07-generator-fibonacci.js
function *fibonacci() {
    let [pre, curr] = [0, 1];
    for(;;){
        [pre, curr] = [curr, pre + curr];
        yield curr;
    }
}
for(let n of fibonacci()){
    if(n > 1000) break;
    console.log(n);
}
```
从上面的代码可见，使用for...of语句时，不需要使用next方法。

利用for...of循环，可以写出遍历任意对象的方法。 原生的Javascript对象没有
遍历接口，无法使用for...of循环，通过Generator函数为它加上这个接口，就可以用了
```javascript
//08-generator-obj.js
function* objectEntries(obj){
    let propKeys = Reflect.ownKeys(obj);

    for(let propKey of propKeys){
        yield [propKey, obj[propKey]];
    }
}
let jane = {first: 'jane', last: 'Doe'};
for(let [key, value] of objectEntries(jane)){
    console.log(`${key}: ${value}`)
}
//first: Jane
//last: Doe
```
上面代码中，对象jane原生不具备Iterator接口，无法用for...of遍历。这时，我们通过
Generator函数objectEntries为它加上遍历器接口，就可以用for...of遍历了。加上遍历器
接口的另一种写法是，将Generator函数对象加到对象的Symbol.iterator属性上面。
```javascript
function * objectEntries() {
    let propKeys = Object.keys(this);
    for(let propKey of propKeys){
        yield [propKey, this[propKey]];
    }
}

let jane = {first: 'Jane', last: 'Doe'};

jane[Symbol.iterator] = objectEntries;

for(let [key, value] of jane){
    console.log(`${key}: ${value}`)
}
```

除了for...of循环以外，扩展运算符（...)、结构赋值和Array.from方法内部调用的，都是
遍历器接口，这意味着，它们都可以将Generator函数返回的Iterator对象，作为参数。

```javascript
function* numbers() {
    yield 1;
    yield 2;
    return 3;
}

var nums = numbers();

//扩展运算符
[...nums] //[1,2]

//Array.from方法
Array.from(nums)    //[1,2]

//解构赋值
let [x,y] = nums;
x   //1
y   //2

//for...of循环
for(let n of nums) {
    console.log(n)
}
//1
//2
```

## Generator.prototype.return()
Generator函数返回的遍历器对象，还有一个return方法，可以返回给定的值，
并且终结遍历Generator函数。

```javascript
function* gen(){
    yield 1;
    yield 2;
    yield 3;
}
var g = gen();
g.next();       // {value: 1, done: false}
g.return('foo');// {value: 'foo', done: true}
g.next();       // {value: undefined, done: true}
```
上面代码中，遍历器对象g调用return方法后，返回值的value属性就是return方法的参数foo。
并且，Generator函数的遍历就终止了，返回值的done属性为true,以后再调用next方法，
done属性总是返回true。

如果return方法调用时，不提供参数，则返回值的value属性为undefined。

如果Generator函数内部有try...finally代码块，那么return 方法会推迟到finally代码
块执行完在执行。

```javascript
//09-generator-try-finally.js
function *numbers() {
    yield 1;
    try{
        yield 2;
        yield 3;
    } finally {
        yield 4;
        yield 5;
    }
    yield 6;
}
var g = numbers();
console.log(g.next());      // {value: 1, done: false}
console.log(g.next());      // {value: 2, done: false}
console.log(g.return(7));   // {value: 4, done: false}
console.log(g.next());      // {value: 5, done: false}
console.log(g.next())       // {value: 7, done: true}
```
上面代码中，调用return方法后，就开始执行finally代码块，然后等到
finally代码块执行完，再执行return方法。






