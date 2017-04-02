function wrapper(generatorFunc) {
    return function (...args) {
        let generatorObj = generatorFunc(...args);
        generatorObj.next();
        return generatorObj;
    }
}
const wrapped = wrapper(function* () {
    console.log(`First input: ${yield}`);
    return 'DONE';
})

wrapped().next('hello!');
//First input: hello!