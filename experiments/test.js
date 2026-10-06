const kuromoji = require("kuromoji");
kuromoji.builder({dicPath: "node_modules/kuromoji/dict"}).build((err, t) => {
    if(err) throw err;
    console.log(merge(t.tokenize("昨日食べられなかった")));
});

function merge(tokens) {
    const result = [];
    for(const tok of tokens) {
        // check if last exists, last.pos is 動詞, and tok is either a 助動詞 or has a pos_detail_1 of 接尾
        if(result.length > 0 && result[result.length - 1].pos == "動詞" && (tok.pos == "助動詞" || tok.pos_detail_1 == "接尾")) {
            result[result.length - 1].surface += tok.surface_form;
            result[result.length - 1].reading += tok.reading;
        }
        else {
            result.push({surface: tok.surface_form, pos: tok.pos, reading: tok.reading, base_form: tok.basic_form});
        }
    }
    return result;
}