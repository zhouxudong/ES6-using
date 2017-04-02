function *fibonacci() {
    let [pre, curr] = [0, 1];
    for(;;){
        [pre, curr] = [curr, pre + curr];
        yield curr;
    }
}
for(let n of fibonacci()){
    if(n > 1000) break;
    console.log(n);
}