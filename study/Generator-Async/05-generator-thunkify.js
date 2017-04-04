var thunkify = require("thunkify");
var fs = require("fs");

var read = thunkify(fs.readFile);

read('README.ms')(function (err, str) {
    //...
})