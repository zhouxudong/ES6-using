// function * foo() {
//     yield 'a';
//     yield 'b';
// }
//
// function * bar() {
//     yield 'x';
//     yield* foo();
//     yield 'y';
// }
//
// for(let a of bar()){
//     console.log(a)  //x  a  b  y
// }

function * inner() {
    yield 'hello';
}
function * outer1() {
    yield 'open';
    yield inner();
    yield 'close';
}
var gen = outer1();
console.log(gen.next());    // 'open'
console.log(gen.next());    // 返回一个遍历器对象
console.log(gen.next());    // 'close'

function * outer2() {
    yield 'open';
    yield* inner();
    yield 'close';
}

var gen = outer2();
console.log(gen.next());    // 'open'
console.log(gen.next());    // 'hello'
console.log(gen.next());    // 'close'