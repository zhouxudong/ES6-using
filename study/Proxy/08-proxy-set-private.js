var handler = {
    get(target, key){
        invariant(key, 'get');
        return target[key];
    },
    set(target, key, value){
        invariant(key, 'set');
        target[key] = value;
        return true;
    }
};
function invariant(key, action) {
    if(key[0] === '_') {
        throw new Error(`Invalid attempt to ${action} private "${key}" property`)
    }
}
var target = {};
var proxy = new Proxy(target, handler);

proxy._prop = 'c'
//Error: Invalid attempt to set private "_prop" property
proxy._prop
//Error: Invalid attempt to get private "_prop" property