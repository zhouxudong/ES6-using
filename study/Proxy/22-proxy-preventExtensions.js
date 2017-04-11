var p = new Proxy({}, {
    preventExtensions(target){
        console.log('called');
        Object.preventExtensions(target);
        return true;
    }
});

console.log(Object.preventExtensions(p));