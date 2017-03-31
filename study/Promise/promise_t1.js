/*
function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms, 'done');
    })
}

timeout(100).then( value => {
    console.log(value);
})
*/

/*
let promise = new Promise(function (resolve, reject) {
    console.log("promise");
    resolve();
})
promise.then(function () {
    console.log("Resolved.");
})
console.log("Hi");
*/

/*
function loadImageAsync(url) {
    return new Promise(function (resolve, reject) {
        var image = new Image();

        image.onload = function () {
            resolve(image);
        }
        image.error = function () {
            reject(new Error('could not load image at' + url));
        }

        image.src = url;
    })
}
*/

//test in  ./promise_ajax.html
var getJSON = function (url) {
    var promise = new Promise((resolve,reject) => {
        var client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "json";
        client.setRequestHeader("Accept", "application/json");
        client.send();

        function handler() {
            if(this.readyState !== 4){
                return;
            }
            if(this.status === 200){
                resolve(this.response);
            }else{
                reject(new Error(this.statusText))
            }
        }
    })
    return promise;
}
getJSON("posts.json").then( function (json) {
    console.log('contents:' + json);
},function (error) {
    console.log('error', error);
})








