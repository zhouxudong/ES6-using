# ES6 Class
## [class](https://github.com/zhouxudong/ES6-using/blob/master/module/graphics/ball.js)
### js传统方法是通过构造函数定义新对象
```javascript
function Ball(radius, color){
    this.radius = radius || 10;
    this.color = color || "#ff0000";
}
Ball.prototype.draw = function(cxt){
    cxt.save();
    //...
    cxt.arc(0, 0, this.radius, 0, Math.PI * 2, true);
    //...
    cxt.restore();
}
```
### 新的class写法定义对象,等同上面的函数构造方法
```javascript
class Ball{
    constructor(radius, color){
        this.radus = radius || 10;
        this.color = color || "#ff0000";
    }
    draw(cxt){
        cxt.save();
        //...
        cxt.arc(0, 0, this.radius, 0, Math.PI * 2, true);
        //...
        cxt.restore();
    }
}
```
### class完全可以看作构造函数的另一种写法。
```javascript
typeof Ball //function
Ball === Ball.prototype.constructor //true
```
上列表明 类的数据类型就是函数，类本身就指向构造函数。

使用class的时候，也是用new命令，跟构造函数的用法完全一致。
```javascript
var ball = new Ball(20, "#ffff00");
```
class的方法都定义在类的prototype上，示例中<br>
Ball类里面的draw 方法 等同于  Ball构造函数的 Ball.prototype.draw

prototye对象的constructor属性，直接指向类本身，与ES5行为一致
```javascript
Ball.prototype.constructor === Ball  //true
```
类的内部定义的所有方法，都是不可枚举的，这与ES5行为不一致
### constructor方法

constructor方法是类的默认方法，通过new命令生成对象实例时，自动调用该方法。一个类<br>
必须有constructor方法，如果没有显式定义，一个空的constructor会被默认添加。
```javascript
    constructor(){}
```
constructor方法默认返回实例对象，即this。完全可以指定返回另一个对象
```javascript
class Ball{
    constructor(){
        return Object.create(null);
    }
}
new Ball() instanceof Ball  //false
```

类的构造函数，不用new是不能调用的，这是它跟普通构造函数的主要区别
```javascript
Ball()   //TypeError: Class constructor Ball cannot be invoked without 'new'
```

### 类的实例对象

与ES5一样，实例的属性除非定义在其本身（即this对象上），否则都是定义在原型上（即定义在class上）
```javascript
class Ball{
    constructor(radius, color){
        this.radus = radius || 10;
        this.color = color || "#ff0000";
    }
    draw(cxt){}
}

var ball = new Ball(10, "#ffff00");
ball.hasOwnProperty("radius")  //true
ball.hasOwnProperty("color")   //true
ball.hasOwnProperty("draw")    //false
ball.__proto__.hasOwnProperty("draw") //true
```

与ES5一样，类的所有实例共享一个原型对象
```javascript

var ball1 = new Ball();
var ball2 = new Ball();
ball1.__proto__ === ball2.__proto__  //true
```

这也意味着可以通过__proto__属性为class添加方法
```javascript
ball1.__proto__.getBounce = function(){return 1}

ball1.getBounce();  //1
ball2.getBounce();  //1

var ball3 = new Ball();
ball3.getBounce();  //1
```
使用实例的__proto__修改原型，必须相当谨慎，不推荐使用。<br>
因为这会改变Class的原始定义，影响到所有实例

### 不存在变量提升,这与ES5完全不同
```javascript
new Ball()  //ReferenceError
class Ball(){}
```
### Class表达式
与函数一样，类也可以使用表达式的形式定义
```javascript
const Ball3D = class Ball{
    getClassName(){
        return Ball.name;
    }
}
```
这个类的名字是Ball3D,而不是Ball,Ball只在当前类中可用，指向当前类
```javascript
var point = new Ball3D();
point.getClassName()    //Ball
Ball.name   //ReferenceError: Me is not defined
```

如果类的内部没有用到Ball的话，可以省略Ball,写成下面的
```javascript
const Ball3D = class{}

//用class表达式，可以写出立即执行的class
var ball = new class{
    constructor(radius, color){
        this.radus = radius
    }
    getRadius(){
        console.log(this.radius)
    }
}(10);
ball.getRadius();   //10
```

### 定义私有方法
ES6不提供私有方法，只能通过模拟实现

1。在命名上加以区别
```javascript
class Ball{
    isContainPoint(x,y){
        this._getBounce(x,y);
    }

    _getBounce(x,y){
        return !(x<left || x>right || y<top || y>bottom)
    }
}
```
方法前面加下划线，表示这是一个只限于内部使用的私有方法。但是这种方法不保险，<br>
在类的外部还是可以可以调用到这个方法。

2。将私有方法移出模块，因为模块内部的所有方法都是对外可见的。
```javascript
class Ball{
    isContainPoint(x,y){
        getBounce.apply(this, arguments);
    }
}
function getBounce(x,y){
    return !(x<left || x>right || y<top || y>bottom)
}
```

3. 使用Symbol值的唯一性，将私有方法的名字命名为一个Symbol值
```javascript
const getBounce = Symbol("getBounce");
class Ball{
    isContainPoint(x,y){
        this[getBounce](x,y);
    }
    [getBounce](x,y){
        return !(x<left || x>right || y<top || y>bottom)
    }
}
```
因为getBounce是Symbol值，导致第三方无法获取它们，因此达到类私有方法的效果

### class的继承
class是通过extends关键字实现继承，这比ES5通过原型链实现继承要清晰方便很多
```javascript
class Ball extends Graphics{
    constructor(){
        super()
    }
}
```
上面代码中，super在这里表示父类的构造函数，用来新建父类的this对象。

子类必须在constructor方法中调用super方法，否则新建实例时会报错。这是因为<br>
子类没有自己的this对象，而是继承父类的this对象，然后对其进行加工。如果不调用<br>
super,子类就得不到this对象
```javascript
class Graph{}
class Ball{
    constructor(){}
}
var ball = new Ball()   //ReferenceError
```

ES5的继承，实质是先创建子类的实例对象this,然后再将父类的方法添加到this上面<br>
(Parent.apply(this))。ES6的继承机制完全不同，实质是先创建父类的实例对象this，<br>
然后再用子类的构造函数修改this（所以必须现调用super方法);<br>

如果子类没有定义constructor方法，这个方法会被默认添加
```javascript
constructor(...args){
    super(...args);
}
```
在子类的构造函数中，只有调用super后，才可以使用this关键字，否则会报错。这是因为<br>
子类实例的创建，是基于对父类实例的加工，只有super才能返回父类实例
```javascript
class Bass extends Graph{
    constructor(x,y){
        this.x = x; //ReferenceError
        super();
        this.x = x; //true
    }
}

var ball = new Ball();
ball instanceof Ball    //true
ball instanceof Graph   //true
```
上面代码中ball同时是Ball 与Graph的实例，这与ES5的行为完全一致
### 类的prototype属性 和 __proto__属性

在ES5中，每一个对象都有__proto__属性，指向对应的构造函数的prototype属性。<br>
Class作为构造函数的语法糖，同时有prototype属性和__proto__属性，因此同时<br>
存在两条继承链<br>
（1）子类的__proto__属性，表示构造函数的继承，总是指向父类<br>
（2）子类prototype属性的__proto__属性，表示方法的继承，总是指向父类的prototype属性
```javascript
class A{}
class B extends A{}
B.__proto__ === A   //true
B.prototype.__proto__ === A.prototype   //true
```
这样的结果上因为，类的继承上按照下面的模式实现的
```javascript
class A {}
class B {}

//B的实例继承A的实例
Object.setPrototypeOf(B.prototype, A.prototype);
const b = new B();

//B的实例继承A的静态属性
Object.setPrototypeOf(B, A);
const b = new B();
```
这两条继承链，可以这样理解： 作为一个对象，子类（B）的原型（__proto__属性）上父类（A）；<br>
作为一个构造函数，子类（B）的原型（prototype属性）是父类的实例

### Extends 的继承目标
`extends`关键字后面可以跟多种类型的值。
```javascript
class B extends A {
}
```
上面的代码`A`，只要是一个有`prototype`属性的函数，就能被`B`继承。由于函数<br>
都有`prototype`属性,因此`A`可以是任意函数。

### super关键字
`super`这个关键字，既可以当作函数使用，也可以当作对象使用，但用法完全不同。<br>

第一种情况，`super`作为函数调用时，代表父类的构造函数。
```javascript
class A {}

class B extends A {
    constructor() {
        super()
    }
}
```
super虽然代表类父类A的构造函数，但是返回的是子类B的实例，即`super`内部的<br>
`this`指向的是`B`,因此supper()在这里相当于A.prototype.constructor.call(this)<br>

作为函数时, `super()`只能用在子类的构造函数之中，用在其它地方就会报错。
```javascript
class A {}

class B {
    m() {
        super();     //报错
    }
}
```

第二种情况,`super`作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。<br>
需要注意的是，由于`super`指向父类的原型对象，所以定义在父类实例上的方法或属性无法通过super调用。
```javascript
class A {
    constructor() {
        this.p = 2;
    }
}

class B extends A {
    get m() {
        return super.p
    }
}

var b = new B();
b.m //undefined
```

上面代码中，p 是父类 A 实例的属性，super.p 就引用不到它。<br>
如果属性定义在父类的原型对象上, super 就可以取到。<br>

ES6规定，通过super调用父类的方法时， super会绑定子类的this.
```javascript
class A {
    constructor() {
        this.x = 1;
    }
    print(){
        console.log(this.x);
    }
}

class B extends A {
    constructor() {
        supper();
        this.x = 2;
    }
    m() {
        super.print();
    }
}

let b = new B();
b.m();  //2
```
上面代码中， super.print()虽然调用的是A.prototype.print(),但是<br>
A.prototype.print() 会绑定子类B的this,实际上执行`super.print.call(this)`.<br>

如果`super`作为对象，用在静态方法之中，这时`super`将指向父类，而不是父类的原型对象。
```javascript
class Parent {
    static myMethod(msg) {
        console.log('static', msg);
    }

    myMethod(msg) {
        console.log("instance", msg);
    }
}

class Child extends Parent {
    static myMethod(msg) {
        super.myMethod(msg);
    }

    myMethod(msg) {
        super.myMethod(msy);
    }
}

Child.myMethod(1);  //static 1

var child = new Child();
child.myMethod(2);  //instance 2
```
上面代码中，`super`在静态方法之中指向父类，在普通方法中指向父类的原型对象.

注意，使用super的时候，必须显示指定是作为函数、还是作为对象使用，否则会报错。

### 原生构造函数的继承
#### ES5的原生构造函数是无法继承的<br>
ES5是先新建子类的实例对象this,再将父类的属性添加到子类上，由于父类的内部属性<br>
无法获取，导致无法继承原生的构造函数。比如,Array构造函数有一个内部属性[[DefineOwnProperty]]<br>
用来定义新属性时，更新length属性，这个内部属性无法在子类获取，导致子类的length属性行为不正常。

下面例子中，我们想让一个普通对象继承Error对象
```javascript
var e = {};
Object.getOwnPropertyNames(Error.call(e));
//['stack']

Object.getOwnPropertyNames(e);
//[]
```
上面代码中，我们想通过Error.call(e)这种写法，让普通对象e具有Error对象的实例属性。但是<br>
Error.call()完全忽略传入的第一个参数，而是返回一个新对象，`e`本身没有任何变化。这证明<br>
来Error.call(e)这种写法，无法继承原生构造函数。

ES6允许继承原生构造函数定义子类，因为ES6是先建父类的实例对象this，然后再用子类的构造函数<br>
修饰this,使得父类的所有行为都可以继承。下面是一个继承Array的例子
```javascript
class VersionedArray extends Array {
    constructor() {
        super();
        this.history = [[]];
    }
    commit() {
        this.history.push(this.slice())
    }
    revert() {
        this.splice(0, this.length, ...this.history[this.history.length - 1]);
    }
}
var x = new VersionedArray();
x.push(1);
x.push(2);
x   //[1,2]
x.history   [[]]

x.commit();
x.history   [[],[1,2]]
x.push(3);
x   //[1,2,3]

x.revert();
x   //[1,2]
```
上面的代码中,VersionedArray解构会通过commit方法，将自己的当前状态存入history属性，然后通过<br>
revert方法，可以撤销当前版本，回到上一版本。除此外，VersionedArray依然上一个数组，所有原生方法<br>
都可以在它上面调用

### Class的取值函数（getter) 和 存值函数（setter)
与ES5一样，在Class内部可以使用`get`和`set`关键字，对某个属性设置存值函数和取之函数，拦截该属性的存取行为。
```javascript
class MyClass {
    constructor() {
        //...
    }
    get prop() {
        return 'getter';
    }
    set prop(value) {
        console.log('setter: ' + value);
    }
}
let inst = new MyClass();
inst.prop = 123;
// setter: 123
inst.prop
// 'getter'
```
上面代码中，prop属性有对应的存取值函数，因此赋值和读取行为都被自定义来。

存值函数和取值函数上设置在属性`descriptor`对象上的。

```javascript
class CustomHTMLElement {
    constructor(element) {
        this.element = element;
    }
    get html() {
        return this.element.innerHTML;
    }

    set html() {
        this.element.innerHTML = value;
    }
}
var descriptor = Object.getOwnPropertyDescriptor(CustomHTMLElement.prototype, "html");

"get" in descriptor //true
"set" in descriptor //true
```
上面代码中，存值函数和取值函数上定义在 html 属性的描述对象上面,这与ES5完全一致。

### Class的Generator方法
如果某个方法之前加上星号（*），就表示该方法上一个Generator函数。
```javascript
class Foo {
    constructor(...args){
        this.args = args;
    }
    * [Symbol.iterator]() {
        for(let arg of this.args){
            yield arg;
        }
    }
}

for(let x of new Foo('hello', 'world'){
    console.log(x);
}
//hello
//world
```
上面代码中，Foo类的Symbol.iterator方法前有一个星号，表示该方法上一个Generator函数。<br>
Symbol.iterator方法返回一个Foo类的默认遍历器，for。。。of循环自动调用这个遍历器。

### Class的静态方法







