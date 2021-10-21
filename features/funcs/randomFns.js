const randomFns = () => {
    let code = "";
    for (let i = 0; i < 6; ++i) {
        code += parseInt(Math.random() * 10);
    }
    return code;
}

module.exports = randomFns;