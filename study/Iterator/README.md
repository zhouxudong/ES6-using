# Iterator 和 for...of循环

## Iterator的概念
Javascript原有的表示"集合"的数据结构，主要是数组和对象，ES6又添加了Map和Set.

Iterator是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要
部署Iterator接口，就可以完成遍历操作。

Iterator的作用有三个：

1。为各种数据结构，提供一个统一的、简便的访问接口；

2。使得数据结构的成员能够按某种次序排列；

3。ES6创造了一种新的遍历命令 `for...of`循环，Iterator接口主要供 `for...of`使用。

Iterator的遍历过程了这样的：

1。创建一个指针对象，指向当前数据的起始位置。也就是说遍历器对象本质上就是一个指针对象。

2。第一次调用指针对象的 `next`方法，可以将指针指向数据结构的第一个成员。

3。第二次调用指针对象的 `next`方法，指针就指向数据结构的第二个成员。

4。不断调用指针对象的 `next`方法，知道它指向数据结构的结束位置。

每一个调用 next 方法，都会返回数据结构的当前成员的信息。具体说，就是返回一个包含
`value`和`done`两个属性的对象。其中，`value`属性是当前成员的值，`done`属性是一个
布尔值，表示遍历是否结束。

下面是一个模拟`next`方法返回值的例子

```javascript
function makeIterator(array){
    var nextIndex = 0;
    return {
        next: function() {
            return nextIndex < array.length ?
            {value: array[nextIndex++], done: false} :
            {value: undefined, done: true}
        }
    }
}

var it = makeIterator(['a', 'b']);
it.next()   //{value: 'a', done: false}
it.next()   //{value: 'b', done: false}
it.next()   //{value: undefined, done: true}
```
对于遍历器对象来说，`done: false`和`value: undefined`属性都是可以省略的，
因此上面的makeIterator函数可以简写成下面的形式。
```javascript
function makeIterator(array) {
    var nextIndex = 0;
    return {
        next: function(){
            return nextIndex < array.length ?
            {value: array[nextIndex++]} :
            {done: true}
        }
    }
}
```

在ES6中，有些数据结构原生具有Iterator接口（比如数组），即不用任何处理，
就可以被`for...of`循环遍历，有些就不行（比如对象）。原因在于，这些数据
结构原生部署了`Symbol.iterator`属性，另外一些数据结构没有。凡是部署了
Symbol.iterator属性的数据结构，就称为部署了遍历器接口。调用这个接口，
就会返回一个遍历器对象。

## 数据结构的默认Iterator接口

ES6规定，默认的Iterator接口部署在数据结构的Symbol.iterator属性，或者说，一个数据
结构只要具有Symbol.iterator属性，就可以认为是"可遍历的"（iterable).

```javascript
const obj = {
    [Symbol.iterator]: function(){
        return {
            next: function(){
                return {
                    value: 1,
                    done: true
                }
            }
        }
    }
}
```
上面代码中，对象obj是可遍历的(iterable),因为具有 Symbol.iterator属性。

在ES6中，有三类数据结构原生具备Iterator接口：数组、某些类似数组的对象（NodeList,arguments）、
Set和Map结构

```javascript
let arr = ['a','b','c'];
let iter = arr[Symbol.iterator]();

iter.next() // {value: 'a', done: false}
iter.next() // {value: 'b', done: false}
iter.next() // {value: 'c', done: false}
iter.next() // {value: undefined, done: true}
```
上面代码中，变量arr是一个数组，原生就具有遍历器接口，部署在arr的Symbol.iterator属性
上面。所以，调用这个属性，就得到遍历器对象。

一个对象如果要有可被for...of循环调用的Iterator接口，就必须在Symbol.iterator的
属性上部署遍历器生成方法（原型链上的对象具有该方法也可以）。

```javascript
//iterator_test.js
class RangeIterator {
    constructor(start, stop) {
        this.value = start;
        this.stop = stop;
    }

    [Symbol.iterator](){
        return this;
    }

    next(){
        var value = this.value;
        if(value < this.stop) {
            this.value++;
            return {done: false, value: value};
        }
        return {done: true, value: undefined};
    }
}
function range(start, stop) {
    return new RangeIterator(start, stop);
}
for(var value of range(0, 3)){
    console.log(value); //0  1  2
}
```
上面代码是一个类部署Iterator接口的写法。Symbol.iterator属性对应一个函数，执行
后返回当前对象的遍历器对象。

下面是通过遍历器实现指针结构的例子

```javascript
//iterator_test1.js
function Obj(value) {
    this.value = value;
    this.next = null;
}
Obj.prototype[Symbol.iterator] = function () {
    var iterator = {
        next: next
    };
    var current = this;

    function next() {
        if(current){
            var value = current.value;
            current = current.next;
            return {
                done: false,
                value: value
            };
        }else {
            return {
                done: true
            }
        }
    }
    return iterator;
}

var one = new Obj(1);
var two = new Obj(2);
var three = new Obj(3);

one.next = two;
two.next = three;

for(var i of one){
    console.log(i);
}
//1
//2
//3
```
上面代码首先在构造函数的原型链上部署Symbol.iterator方法，调用该方法会返回遍历器
对象iterator，调用该对象的next方法，在返回一个值的同时，自动将内部指针移到下一个实例。

下面是另一个为对象添加Iterator接口的例子

```javascript
let obj = {
    data: ['hello', 'world'],
    [Symbol.iterator](){
        const self = this;
        let index = 0;
        return {
            next(){
                if(index < self.data.length) {
                    return {
                        value: self.data[index++],
                        done: false
                    };
                }else {
                    return {value: undefined, done: true}
                }
            }
        }
    }
}
```

对于类似数组的对象， 部署Iterator接口，有一个简便方法，就是Symbol.iterator
方法直接引用数组的Iterator接口。

```javascript
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
//或者
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];

[...document.querySelectorAll('div')]   //可以执行类
```

下面是类似数组的对象调用数组的Symbol.iterator方法的例子

```javascript
//iterator_test2.js
let iterable = {
    0: 'a',
    1: 'b',
    2: 'c',
    length: 3,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
}

for(let item of iterable){
    console.log(item);  //'a', 'b', 'c'
}
```

注意，普通对象部署数组的Symbol.iterator方法，并无效果。

```javascript
//iterator_test3.js
let iterable = {
    a: 'a',
    b: 'b',
    c: 'c',
    length: 3,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
}
for(let item of iterable){
    console.log(item)   //undefined,  undefined,  undefined
}

```







