var d1 = Date.now();
var p1 = new Promise(function (resolve, reject) {
    setTimeout( () => reject(new Error("fail")), 3000)
})
var p2 = new Promise(function (resolve, reject) {
    setTimeout( () => resolve(p1), 3000)
})
p2.then( result => console.log(result))
.catch( error => {
    console.log(error);

    var d2 = Date.now();
    console.log("time" +  (d2 -d1 ) / (1000))
})
