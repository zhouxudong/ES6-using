var fs = require("fs");
var readFile = function (path) {
    return new Promise( function (resolve, reject) {
        fs.readFile(path,function (error, data) {
            if(error) return reject(error);
            resolve(data);
        })
    })
}

var gen = function* () {
    var f1 = yield readFile("../data1.json");
    var f2 = yield readFile("../data2.json");
    console.log(f1.toString());
    console.log(f2.toString());
}
//手动执行Generator函数
// var g = gen();
//
// g.next().value.then(function (data) {
//     g.next(data).value.then(function (data) {
//         g.next(data);
//     })
// })

//自动执行器
function run(gen) {
    var g = gen();

    function next(data) {
        var result = g.next(data);
        if(result.done) return result.value;
        result.value.then(function (data) {
            next(data);
        })
    }

    next();
}
run(gen)