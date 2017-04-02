// function* objectEntries(obj){
//     let propKeys = Reflect.ownKeys(obj);
//
//     for(let propKey of propKeys){
//         yield [propKey, obj[propKey]];
//     }
// }
// let jane = {first: 'jane', last: 'Doe'};
// for(let [key, value] of objectEntries(jane)){
//     console.log(`${key}: ${value}`)
// }
function * objectEntries() {
    let propKeys = Object.keys(this);
    for(let propKey of propKeys){
        yield [propKey, this[propKey]];
    }
}

let jane = {first: 'Jane', last: 'Doe'};

jane[Symbol.iterator] = objectEntries;

for(let [key, value] of jane){
    console.log(`${key}: ${value}`)
}