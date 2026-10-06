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
        console.log(merge(t.tokenize(test)));
        console.log("~~~~~~");
    });
});

function merge(tokens) {
    const result = [];
    for(const tok of tokens) {
        if(shouldGlue(result, tok)) {
            result[result.length - 1].surface += tok.surface_form;
            result[result.length - 1].reading += tok.reading;
        }
        else {
            result.push({surface: tok.surface_form, pos: tok.pos, reading: tok.reading, base_form: tok.basic_form});
        }
    }
    return result;
}

function shouldGlue(result, tok) {
    if(result.length === 0)
        return false;
    const last = result[result.length - 1];
    const lastOK = last.pos === "動詞" || last.pos === "形容詞";
    const tokOK = tok.pos === "助動詞" || tok.pos_detail_1 === "接尾" || tok.surface_form === "て" || tok.surface_form === "で" || (tok.pos === "動詞" && tok.pos_detail_1 == "非自立");
    return lastOK && tokOK;
}