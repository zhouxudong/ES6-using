let iterable = {
    a: 'a',
    b: 'b',
    c: 'c',
    length: 3,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
}
for(let item of iterable){
    console.log(item)   //undefined,  undefined,  undefined
}
