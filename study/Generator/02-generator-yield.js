function* demo(){
    //console.log('Hello' + yield);   //SyntaxError
    //console.log('Hello' + yield 123);   //SyntaxError

    console.log('Hello' + (yield)); //OK
    console.log('Hello' + (yield 123)); //OK
}

var generator = demo();

//generator.next();
generator.next();
generator.next(1);
generator.next();