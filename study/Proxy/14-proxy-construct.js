var p = new Proxy(function(){}, {
    construct: function (target, args) {
        console.log('called: ' + args.join(', '));
        //return 1; TypeError: 'construct' on proxy: trap returned non-object('1')
        return {value: args[0] * 10}
    }
});

console.log(new p(1));
//called: 1
// {value: 10}