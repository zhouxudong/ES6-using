const co = require("co");
const fs = require("fs");

const stream = fs.createReadStream('./README.md');
let valjeanCount = 0;

co(function* () {
    while (true){
        const res = yield Promise.race([
            new Promise( resolve => stream.once('data', resolve)),
            new Promise( resolve => stream.once('end', resolve)),
            new Promise( (resolve, reject) => stream.once('error', reject))
        ]);
        if(!res) {
            break;
        }
        stream.removeAllListeners('data');
        stream.removeAllListeners('end');
        stream.removeAllListeners('error');
        valjeanCount += (res.toString().match(/valjean/ig) || []).length;
    }
    console.log("count", valjeanCount);
})

