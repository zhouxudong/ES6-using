function* helloworldGenerator() {
    yield 'hello';
    yield 'world';
    return 'ending';
}
var hw = helloworldGenerator();

console.log(hw.next());
console.log(hw.next());
console.log(hw.next());