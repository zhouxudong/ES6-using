var p = new Proxy({}, {
    isExtensible(target) {
        console.log('called');
        return true;
    }
});
Object.isExtensible(p);
//called
//true