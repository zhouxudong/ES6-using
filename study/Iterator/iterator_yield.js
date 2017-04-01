let generator = function* (){
    yield 1;
    yield* [2,3,4];
    yield 5;
};
var iterator = generator();

var a = iterator.next();
var ab = iterator.next();
var ac = iterator.next();
var ad = iterator.next();
var ae = iterator.next();
var af = iterator.next();