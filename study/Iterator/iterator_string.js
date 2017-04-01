var str = new String("hi");
console.log([...str])

str[Symbol.iterator] = function () {
    return {
        next: function () {
            if(this._first){
                this._first = false;
                return {value: 'bye', done: false}
            }else {
                return {done: true}
            }
        },
        _first: true
    }
}
console.log([...str])
console.log(str);