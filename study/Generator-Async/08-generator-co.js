var fs = require("fs");
var co = require("co");
var thunkify = require("thunkify");
var readFile = thunkify(fs.readFile)

var gen = function* (){
    var f1 = yield readFile("../data1.json");
    var f2 = yield readFile("../data2.json");

    console.log(f1.toString());
    console.log(f2.toString());
}
co(gen).then(function () {
    console.log("Generator函数执行完成")
});