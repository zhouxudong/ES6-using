var gol = {
    double: n => n * 2,
    pow: n => n * n,
    reverseInt: n => n.toString().split("").reverse().join("") | 0

};

var pipe = (function(){
    return function (value) {
        var funcStack = [];
        var oproxy = new Proxy({}, {
            get: function( pipeObject, fnName) {
                if(fnName === 'get') {
                    return funcStack.reduce(function (val, fn) {
                        return fn(val);
                    },value);
                }
                funcStack.push(gol[fnName]);
                return oproxy;
            }
        })
        return oproxy;
    }
}());


console.log(pipe(3).double.pow.reverseInt.get);//63