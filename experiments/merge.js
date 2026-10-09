function merge(tokens) {
    const result = [];
    for(const tok of tokens) {
        if(shouldGlue(result, tok)) {
            const last = result[result.length - 1];
            if (tok.basic_form === "する" && last.pos === "名詞") {
                last.base_form += "する";
                last.pos = "動詞";
            }
            result[result.length - 1].surface += tok.surface_form;
            result[result.length - 1].reading += tok.reading;
        }
        else {
            result.push({surface: tok.surface_form, pos: tok.pos, reading: tok.reading, base_form: tok.basic_form, pos_detail_1: tok.pos_detail_1, stemReading: tok.reading});
        }
    }
    return result;
}

function shouldGlue(result, tok) {
    if(result.length === 0)
        return false;
    const last = result[result.length - 1];
    if(last.pos === "名詞" && last.pos_detail_1 === "サ変接続" && tok.basic_form === "する")
        return true;
    const lastOK = last.pos === "動詞" || last.pos === "形容詞";
    const tokOK = tok.pos === "助動詞" || tok.pos_detail_1 === "接尾" || tok.surface_form === "て" || tok.surface_form === "で" || (tok.pos === "動詞" && tok.pos_detail_1 == "非自立") || tok.surface_form == "ば";
    return lastOK && tokOK;
}

module.exports = {merge};