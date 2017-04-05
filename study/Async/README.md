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
```




