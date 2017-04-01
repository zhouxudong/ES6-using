var arr = ['a','b','c','b'];
var engines = new Set(arr);
for(var e of engines){
    console.log(e);
}
//a
//b
//c

var es6 = new Map();
es6.set('edition', 6);
es6.set('commit', 'Tc');
for(var [name,value] of es6){
    console.log(name + " " + value);
}
//edition 6
//commit Tc