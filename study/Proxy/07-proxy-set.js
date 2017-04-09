var validator = {
    set: function (obj, prop, value) {
        if(prop === 'age') {
            if(!Number.isInteger(value)) {
                throw new TypeError('The age is not an integer')
            }
            if(value > 200) {
                throw new RangeError('The age seems invalid');
            }
        }
        //对于age以外的属性，直接保存
        obj[prop] = value;
    }
}

let person = new Proxy({}, validator);

person.age = 100;

console.log(person.age);
person.age = 'aaa'; //TypeError
parson.age = 300;   //RangeError