let stu1 = {name: 'san', score: 59};
let stu2 = {name: 'si', score: 99};

let handler = {
    has(target, prop) {
        if(prop === 'score' && target[prop] < 60) {
            console.log(`${target.name}不及格`);
            return false;
        }
        return prop in target;
    }
}

let oproxy1 = new Proxy(stu1, handler);
let oproxy2 = new Proxy(stu2, handler);

console.log('score' in oproxy1);
//san不及格
//false

console.log('score' in oproxy2);
//true

for(let a in oproxy1){
    console.log(oproxy1[a]);
}
//san
//59