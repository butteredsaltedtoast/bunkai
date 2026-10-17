import {createRequire} from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const kuromoji = require("kuromoji");
const {uni, bi} = JSON.parse(fs.readFileSync("data/ngram.json", "utf8"));
const N = Object.values(uni).reduce((a, b) => a + b, 0); // total
const V = Object.keys(uni).length; // unique
const t = await new Promise((res, rej) => kuromoji.builder({dicPath: "node_modules/kuromoji/dict"}).build((e, tk) => e ? rej(e) : res(tk))); // longest line ever

export function score(text) { // Q: how natural is this sentence? A: sum of log P(each word | word before it)
    const words = ["<s>", ...t.tokenize(text).map(x => x.surface_form)];
    let total = 0;
    for(let k = 1; k < words.length; k++) {
        const prev = words[k - 1], w = words[k];
        const pUni = ((uni[w] || 0) + 1) / (N + V);
        const pBi = uni[prev] ? (bi[prev + "\t" + w] || 0) / uni[prev] : 0;
        total += Math.log(0.2 * pUni + 0.8 * pBi);
    }
    return total;
}

if(import.meta.url === `file://${process.argv[1]}`) {
    for(const s of ["今日は朝から雨が降っています", "今日は麻から雨が降っています", "今日は朝から雨が振っています", 
        "友達と公園へ行きました", "友達と公園へ生きました"])
        console.log(score(s).toFixed(3), s);
}