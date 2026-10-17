const fs = require("fs");
const kuromoji = require("kuromoji")
const lines = fs.readFileSync("data/jpn_sentences.tsv", "utf8").split("\n");

kuromoji.builder({dicPath: "node_modules/kuromoji/dict"}).build((err, t) => {
    if(err)
        throw err;
    const uni = new Map(); // word to appearances
    const bi = new Map(); // how many times word2 follows word1
    const add = (m, k) => m.set(k, (m.get(k) || 0) + 1);

    let done = 0;
    for(const line of lines) {
        const text = line.split("\t")[2];
        if(!text)
            continue;
        const words = ["<s>", ...t.tokenize(text).map(x => x.surface_form), "</s>"];
        for(let k = 0; k < words.length; k++) {
            add(uni, words[k]);
            if(k > 0)
                add(bi, words[k - 1] + "\t" + words[k]);
        }
        if(done % 20000 === 0)
            console.log(done, "sentences"); // js for progress
        done++;
    }
    const biOut = {};
    for(const [k, v] of bi)
        if(v >= 2)
            biOut[k] = v;
    fs.writeFileSync("data/ngram.json", JSON.stringify({uni: Object.fromEntries(uni), bi: biOut}));
    console.log("words:", uni.size, "   pairs kept:", Object.keys(biOut).length, "of", bi.size);
    console.log("file size:", fs.statSync("data/ngram.json").size);
});