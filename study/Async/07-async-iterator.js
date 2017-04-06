const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncItrrator = asyncIterable[Symbol.asyncIterator]();

asyncItrrator
    .next()
    .then(iterResult1 => {
        console.log(iterResult1);   // {value: 'a', done: false}
        return asyncItrrator.next();
    })
    .then( iterResult2 => {
        console.log(iterResult2);   // { value: 'b', done: false}
        return asyncItrrator.next();
    })
    .then(iterResult3 => {
        console.log(iterResult3);   // {value: undefined, done: true}
    })