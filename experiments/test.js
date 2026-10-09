const {lookup} = require("./lookup");
const {merge} = require("./merge");
const tests = [
    "昨日食べられなかった",
    "食べている",
    "食べること",
    "高くなかった",
    "読んでしまった",
    "勉強しなければならない",
    "行きたくない",
    "雨が降っているのに出かけた",
];

const kuromoji = require("kuromoji");
kuromoji.builder({dicPath: "node_modules/kuromoji/dict"}).build((err, t) => {
    if(err) throw err;
    tests.forEach(test => {
        console.log(`input: ${test}`);
        for(const c of merge(t.tokenize(test))) {
            console.log(c.surface, "-->", lookup(c.base_form, c.pos, c.stemReading));
        }
        console.log("~~~~~~");
    });
});