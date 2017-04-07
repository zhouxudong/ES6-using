var person = {
    name: 'zzz'
};
var proxy = new Proxy( person, {
    get: function (target, property) {
        if(property in target){
            return target[property];
        }else {
            throw new ReferenceError("property \"" + property + "\" does not exist.");
        }
    }
});
console.log(proxy.name);
console.log(proxy.age);