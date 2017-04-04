var thunkify = require("thunkify");
var fs = require("fs");
var readFileThunk = thunkify(fs.readFile);

// var g = gen();
// var r1 = g.next();
// r1.value(function(err, data){
//     if(err) throw err;
//     var r2 = g.next(data);
//
//     r2.value(function (err, data) {
//         if(err) throw err;
//         g.next(data);
//     })
// })
function run(fn) {
    var gen = fn();

    function next(err, data) {
        var result = gen.next(data);
        if(result.done) return;

        result.value(next)
    }

    next();
}
var g = function* (){
    var f1 = yield readFileThunk("../data1.json");
    console.log(f1.toString())
    var f2 = yield readFileThunk("../data2.json");
    console.log(f2.toString())
}

run(g);
