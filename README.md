# ES6 using
## [class](https://github.com/zhouxudong/ES6-using/blob/master/module/graphics/ball.js)
### js传统方法是通过构造函数定义新对象
    function Ball(radius, color){
        this.radius = radius || 10;
        this.color = color || "#ff0000";
    }
    Ball.prototype.draw = function(cxt){
        cxt.save();
        ...
        cxt.arc(0, 0, this.radius, 0, Math.PI * 2, true);
        ...
        cxt.restore();
    }
### 新的class写法定义对象,等同上面的函数构造方法
    class Ball{
        constructor(radius, color){
            this.radus = radius || 10;
            this.color = color || "#ff0000";
        }
        draw(cxt){
            cxt.save();
            ...
            cxt.arc(0, 0, this.radius, 0, Math.PI * 2, true);
            ...
            cxt.restore();
        }
    }

    class完全可以看作构造函数的另一种写法。

    typeof Ball //function
    Ball === Ball.prototype.constructor //true
    上列表明 类的数据类型就是函数，类本身就指向构造函数。

    使用class的时候，也是用new命令，跟构造函数的用法完全一致。
    var ball = new Ball(20, "#ffff00");

    class的方法都定义在类的prototype上，示例中
    Ball类里面的draw 方法 等同于  Ball构造函数的 Ball.prototype.draw

    prototye对象的constructor属性，直接指向类本身，与ES5行为一致
    Ball.prototype.constructor === Ball  //true

    类的内部定义的所有方法，都是不可枚举的，这与ES5行为不一致
### constructor方法

    constructor方法是类的默认方法，通过new命令生成对象实例时，自动调用该方法。一个类
    必须有constructor方法，如果没有显式定义，一个空的constructor会被默认添加。

    constructor(){}

    constructor方法默认返回实例对象，即this。完全可以指定返回另一个对象

    class Ball{
        constructor(){
            return Object.create(null);
        }
    }
    new Ball() instanceof Ball  //false

    类的构造函数，不用new是不能调用的，这是它跟普通构造函数的主要区别
    Ball()   //TypeError: Class constructor Ball cannot be invoked without 'new'

### 类的实例对象

    与ES5一样，实例的属性除非定义在其本身（即this对象上），否则都是定义在原型上（即定义在class上）
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

    与ES5一样，类的所有实例共享一个原型对象

    var ball1 = new Ball();
    var ball2 = new Ball();
    ball1.__proto__ === ball2.__proto__  //true

    这也意味着可以通过__proto__属性为class添加方法

    ball1.__proto__.getBounce = function(){return 1}

    ball1.getBounce();  //1
    ball2.getBounce();  //1

    var ball3 = new Ball();
    ball3.getBounce();  //1

    使用实例的__proto__修改原型，必须相当谨慎，不推荐使用。
    因为这会改变Class的原始定义，影响到所有实例

### 不存在变量提升,这与ES5完全不同

    new Ball()  //ReferenceError
    class Ball(){}

### Class表达式
    与函数一样，类也可以使用表达式的形式定义

    const Ball3D = class Ball{
        getClassName(){
            return Ball.name;
        }
    }
    这个类的名字是Ball3D,而不是Ball,Ball只在当前类中可用，指向当前类
    var point = new Ball3D();
    point.getClassName()    //Ball
    Ball.name   //ReferenceError: Me is not defined

    如果类的内部没有用到Ball的话，可以省略Ball,写成下面的
    const Ball3D = class{}

    用class表达式，可以写出立即执行的class
    var ball = new class{
        constructor(radius, color){
            this.radus = radius
        }
        getRadius(){
            console.log(this.radius)
        }
    }(10);
    ball.getRadius();   //10

### 定义私有方法
    ES6不提供私有方法，只能通过模拟实现

    1。在命名上加以区别
    class Ball{
        isContainPoint(x,y){
            this._getBounce(x,y);
        }

        _getBounce(x,y){
            return !(x<left || x>right || y<top || y>bottom)
        }
    }
    方法前面加下划线，表示这是一个只限于内部使用的私有方法。但是这种方法不保险，
    在类的外部还是可以可以调用到这个方法。

    2。将私有方法移出模块，因为模块内部的所有方法都是对外可见的。
    class Ball{
        isContainPoint(x,y){
            getBounce.apply(this, arguments);
        }
    }
    function getBounce(x,y){
        return !(x<left || x>right || y<top || y>bottom)
    }

    3. 使用Symbol值的唯一性，将私有方法的名字命名为一个Symbol值

    const getBounce = Symbol("getBounce");
    class Ball{
        isContainPoint(x,y){
            this[getBounce](x,y);
        }
        [getBounce](x,y){
            return !(x<left || x>right || y<top || y>bottom)
        }
    }
    因为getBounce是Symbol值，导致第三方无法获取它们，因此达到类私有方法的效果

### class的继承
    class是通过extends关键字实现继承，这比ES5通过原型链实现继承要清晰方便很多



