async function f() {
    throw new Error("find error");
}

f().then(
    v => console.log(v),
    e => console.log(e)
)