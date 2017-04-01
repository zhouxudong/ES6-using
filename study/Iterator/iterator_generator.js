var myIterable = {};

myIterable[Symbol.iterator] = function* (){
    yield 1;
    yield 2;
    yield 3;
};
console.log([...myIterable])    //[1,2,3]

//或采用下面的简洁写法
let obj = {
    * [Symbol.iterator] () {
     yield 'hello';
     yield 'world';
    }
}
for(let x of obj){
    console.log(x);
}
//hello
//world