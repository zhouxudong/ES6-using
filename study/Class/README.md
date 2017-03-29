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
###class完全可以看作构造函数的另一种写法。
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
        supper()
    }
}
```
上面代码中，supper在这里表示父类的构造函数，用来新建父类的this对象。

子类必须在constructor方法中调用supper方法，否则新建实例时会报错。这是因为<br>
子类没有自己的this对象，而是继承父类的this对象，然后对其进行加工。如果不调用<br>
supper,子类就得不到this对象
```javascript
class Graph{}
class Ball{
    constructor(){}
}
var ball = new Ball()   //ReferenceError
```

ES5的继承，实质是先创建子类的实例对象this,然后再将父类的方法添加到this上面<br>
(Parent.apply(this))。ES6的继承机制完全不同，实质是先创建父类的实例对象this，<br>
然后再用子类的构造函数修改this（所以必须现调用supper方法);<br>

如果子类没有定义constructor方法，这个方法会被默认添加
```javascript
constructor(...args){
    supper(...args);
}
```
在子类的构造函数中，只有调用supper后，才可以使用this关键字，否则会报错。这是因为<br>
子类实例的创建，是基于对父类实例的加工，只有supper才能返回父类实例
```javascript
class Bass extends Graph{
    constructor(x,y){
        this.x = x; //ReferenceError
        supper();
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



