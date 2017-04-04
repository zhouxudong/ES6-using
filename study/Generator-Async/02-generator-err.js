function *gen(x) {
    try{
        var y = yield x + 2;
    }catch (e){
        console.log(e);
    }
    return y;
}
var g = gen(1);
g.next();
g.throw("error");