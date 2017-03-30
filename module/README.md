# Module 的语法

## 概述
ES6 模块的设计思想，是尽量的静态化，使得编译时就能确定模块的依赖关系，<br>
以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些</br>
东西。比如，commonJS模块就是对象，输入是必须查找对象属性。
```javascript
//CommonJS模块
let { stat, exists, readFile } = require("fs");

//等同于
let _fs = require("fs");
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```
上面代码的实质是整体加载fs模块（即加载fs的所有方法),生成一个对象(_fs),<br>
然后再从这个对象上面读取3个方法。这种加载称为"运行时加载"，因为只有运行时<br>
才能得到这个对象，导致完全没有办法在编译时做"静态优化"。

ES6的模块不是对象，而是通过export命令显示指定输出的代码，在通过import命令输入。
```javascript
//ES6模块
import {stat, exists, readFile } from 'fs';
```
上面代码的实质是从fs模块加载3个方法，其它方法不加载。这种加载称为"编译时加载"<br>
或者静态加载，即ES6可以在编译时就完成模块加载，效率要比 CommonJS模块的加载<br>
方式高。当然，这也导致类没法应用ES6模块本身，因为它不是对象。

由于ES6模块是编译时加载，使得静态分析成为可能。有了它，就能进一步拓宽Javascript<br>
的语法，比如引入宏(macro)和类型检验(type system)这些只能靠静态分析实现的功能。

除了静态加载带来的好处，ES6模块还有以下好处
* 不再需要UMD模块格式类，将来服务器和浏览器都会支持ES6模块格式。
* 将来浏览器的新API就能用模块格式提供，不再必须做成全局变量或者Navigator对象的属性
* 不再需要对象作为命名空间（比如Math对象），未来这些功能可以通过模块提供。

## ES6的模式自动采用严格模式，不管你有没加"use strict";

## export命令
模块功能主要有两个命令构成： export 和 import。 export命令用于规定模块的对外接口<br>
import命令用于输入其它模块提供的功能。

一个模块就是一个独立的文件。该文件内部的所有变量，外部无法获取。如果你希望外部能够<br>
读取模块内部的某个变量，就必须使用export关键字输出该变量。
```javascript
//profile.js
export var firstName = "Michael";
export var lastName = "Jackson";
export var year = 1985;
```
上面代码是profile.js文件，保存类用户信息。ES6将其视为一个模块，里面用export<br>
命令对外输出了三个变量。

export的另一种写法

```javascript
//profile.js
var firstName = "Michael";
var lastName = "Jackson";
var year = 1985;

export {firstName, lastName, year}
```
上面代码在export命令后面，使用大括号指定所要输出的一组变量。它与前一种写法是等价的<br>

export 命令除了输出变量，还可以输出函数或类（class)。
```javascript
export function multiply(x, y) {
    return x * y;
}
```
上面代码对外输出一个函数multiply。

通常情况下，export输出的变量就是本来的名字，但是可以使用as关键字重命名。

```javascript
function v1() {}
function v2() {}

export {
    v1 as streamV1,
    v2 as streamV2,
    v2 as StreamLatestVersion
}
```

上面代码使用as关键字，重命名了函数v1和v2的对外接口。重命名后，v2可以<br>
用不同的名字输出两次。

需要特别注意的是，export命令规定的是对外的接口，必须与模块内部的<br>
变量建立一一对应关系。
```javascript
//报错
export 1;

//报错
var m = 1;
export m;
```
上面两种写法都会报错，因为没有提供对外的接口。第一种写法直接输出1，第二种<br>
写法通过变量m,还是直接输出1。 1只是一个值，不是接口。正确的写法是下面这样。
```javascript
//写法一
export var m = 1;

//写法二
var m = 1;
export {m}

//写法三
var n = 1;
export {n as m}
```
上面三种写法都是正确的，规定对外的接口m.其它脚本可以通过这个接口，取到值1<br>
它们的实质是，在接口名与模块内部变量之间，建立类一一对应的关系。

```javascript
//报错
function f(){}
export f;

//正确
export function f(){};

//正确
function f() {}
export {f};
```
另外，export语句输出的接口，与其对应的值是动态绑定关系，即通过该接口<br>
可以取到模块内部实时的值。
```javascript
export var foo = 'bar';
setTimeout(() => foo = 'baz', 500);

```
上面代码输出变量foo,值为bar,500毫秒之后变成baz.

这一点与CommonJS规范完全不同。CommonJS模块输出的是值的缓存，不存在动态更新。

最后export命令可以出现在模块的任何位置，只要处于模块顶层就可以。如果处于<br>
块级作用域内，就会报错，import命令也是如此。这是因为处于条件代码块之中，<br>
就没法做静态优化类，违背类ES6模块的设计初衷。
```javascript
function foo(){
    export default 'bar'    //SyntaxError
}
foo()
```

## import 命令
使用export命令定义类模块的对外接口以后，其它JS文件就可以通过import命令加载这个模块。
```javascript
//main.js
import {firstName, lastName, year} from './profile';

function setName(element) {
    element.textContent = firstName + " " + lastName;
}
```
上面代码的import命令，用于加载profile.js文件，并从中输出变量。import命令接受一对<br>
大括号，里面指定要从其它模块导入的变量名。大括号里面的变量名，必须与被导入模块对外<br>
接口的名称相同。

如果想为输入的变量重新取一个名字，import命令要使用as关键字，将输入的变量重命名。

```javascript
import {last as surname} from './profile';
```

import 后面的from指定文件的位置，可以是相对路径，也可以是绝对路径，`.js`路径可以省略。<br>
若果只是模块名，不带有路径，那么必须有配置文件，告诉javascript引擎该模块的位置。
```javascript
import {myMethod} from 'util';
```
上面代码中,util是模块文件名，由于不带有路径，必须通过配置，告诉引擎怎么取到这个模块。

注意，import命令具有提升效果，会提升到整个模块的头部，首先执行。

```javascript
foo();
import { foo } from 'my_module';
```
上面的代码不会报错，因为import的执行早于foo的调用。这种行为的本质是，import<br>
命令是编译阶段执行的，在代码运行之前。

由于import是静态执行，所以不能使用表达式和变量，这些只有在运行时才能得到结果的语法解构

```javascript
//报错
import {'f' + "oo'} from 'my_module';

//报错
let module = 'my_module';
import {foo} from module;

//报错
if(x === 1) {
    import { foo } from 'module1';
}else {
    import { foo } from 'module2';
}
```

上面三种写法都会报错，因为他们用到了表达式、变量和if解构。在静态分析阶段，这些语法都是没法得到值的。

最后,import语句执行所加载的模块，因此可以有下面的写法

```javascript
import 'lodash';
```
上面代码仅仅执行lodash模块，但是不输入任何值。

如果多次重复执行同一句import语句，那么只会执行一次，而不会执行多次。
```javascript
import 'lodash';
import 'lodash';
```
上面代码加载了两次lodash，但是只会执行一次。

```javascript
import {foo } from 'my_module';
import {bar } from 'my_module';

//等同于
import {foo, bar} from 'my_module';
```
上面代码中，虽然foo和bar在两个语句中加载，但是它们对应的是同一个<br>
my_module实例。也就是说，import语句是Singleton模式。

## 模块的整体加载

除了指定加载某个输出值，还可以使用整体加载，即用星号（*）指定一个对象，<br>
所有输出值都加载在这个对象上面。

下面是一个circle.js文件，它输出两个方法 area 和 circumference

```javascript
//circle.js
export function area(radius) {
    return Math.PI * radius * radius;
}
export function circumference(radius) {
    return 2 * Math.PI * radius;
}
```
现在，加载这个模块
```javascript
import * as circle from './circle';

console.log('area' + circle.area(4));
console.log('circumference' + circle.circumference(14));
```

## export default 命令
```javascript
//export-default.js
export default function() {
    console.log('foo');
}
```
上面的代码是一个模块文件 export-default.js,它的默认输出是一个函数。

其它模块加载该模块时， import命令可以为该匿名函数指定任意名字。
```javascript
import customName from './export-default';

customName();   //'foo'
```
上面代码的import命令，可以用任意名称指向`export-default.js`输出的方法，<br>
这时就不需要知道原模块输出的函数名。需要注意的是，这时import后面不使用大括号。

export default命令用在非匿名函数前，也是可以的。

## export 与import的复合写法
如果在一个模块之中，先输入后输出同一个模块，import 语句可以与export 写在一起
```javascirpt
export {foo, bar} from "my_module";

//等同于
import {foo, bar} from "my_module";
export {foo, bar}
```
上面代码中，export 和 import语句可以结合在一起，写成一行。

模块的接口改名和整体输出，也可以采用这种写法。

```javascript
//接口改名
export { foo as myFoo} from 'my_module';

//整体输出
export * from 'my_module';
```

## 跨模块常量
如果想设置跨模块的常量（即跨多个文件），或者说一个值被多个模块共享

```javascript
// constants.js 模块
export const A = 1;
export const B = 2;
export const C = 3;

//test1.js 模块
import * as constants from './constants';
console.log(constants.A);   //1
console.log(constants.B);   //2

//test2.js模块
import{A, B} from './constants';
console.log(A);     //1
console.log(B);     //2
```
如果要使用的常量非常多，可以建一个专门的constants目录，将各种<br>
常量写在不同的文件里面，保存在该目录下。

```javascript
//constants/db.js
export const db = {
    url: "my.con.local:8080",
    username: "123456",
    password: "root"
}

//constants/user.js
export const users = ['root', 'admin', 'user'];
```
然后，将这些文件输出的常量，合并在index.js里面

```javascript
//constants/index.js
export {db} from './db';
export {users} from './users';
```
使用的时候，直接加载index.js就可以了
```javascript
//script.js
import {db, users} from './constants';
```

## import()
import命令会被javascript引擎静态分析，先于模块内的其它模块执行。所以，下面代码报错
```javascript
//报错
if(x === 2) {
    import MyModul form './myModual';
}
```
上面代码中，引擎处理import语句是在编译时，这时不会去分析或执行if 语句，所以<br>
import语句放在if代码之中毫无意义，因此会报语法错误，而不是执行时错误。也就是<br>
说，import和export命令只能在模块的顶层，不能在代码之中。

这样的设计，固然有利于编译器提高效率，但也导致无法在运行时加载模块。从语法上，<br>
条件加载就不可能实现。如果import命令要取代Node的require方法，这就形成了一个障碍<br>
因为require是运行时加载模块，import命令无法取代require的动态加载功能。

```javascript
const path = './' + fileName;
const myModual = require(path);
```
上面的语句就是动态加载，require到底加载那一个模块，只有运行时才知道。<br>
import语句做不到这一点。

因此有一个提案，建议进入import()函数，完成动态加载。<br>

import命令能够接受上面参数，import()函数就能接受上面参数，两者<br>
区别主要是后者为动态加载。

import() 返回一个Promise对象。

```javascript
const main = document.querySelector('main');

import(`./section-module/${someVariable}.js`)
    .then(module => {
        module.loadPageInfo(main);
    })
    .catch(err => {
        main.textContent = err.message
    })
```
import()函数可以用在任何地方，不仅仅是模块，非模块的脚本也可以使用。它是运行时执行，<br>
也就是说，什么时候运行到这一句，就会加载指定的模块。另外，import()函数与所加载的<br>
模块没有静态连接关系，这点也是与import语句不相同。

`import()`类似于Node的 require方法，区别主要是前者是异步加载，后者是同步加载。

import()的使用场合
* 按需加载
* 条件加载  if...else
* 动态的模块路径  import(f())

import()加载模块成功以后，这个模块会作为一个对象，当作then方法的参数。








