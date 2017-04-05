var fs = require("fs");

var readFile = function (fileName) {
    return new Promise( (resolve, reject) => {
        fs.readFile(fileName, function (err, data) {
            if(err) reject(err);

            resolve(data);
        })
    })
}

var asyncReadFile = async function () {
    var f1 = await readFile("../data1.json");
    var f2 = await readFile("../data2.json");

    console.log(f1);
    console.log(f2);
}

var result = asyncReadFile();