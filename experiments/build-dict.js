const bigjson = require("./data/jmdict-eng-3.6.2.json");
const small = []
const fs = require("fs");

for(const entry of bigjson.words) {
    const newEntry = {
        k: entry.kanji.map(k => ({t: k.text, ...(k.common && {c: 1})})),
        r: entry.kana.map(k => ({t: k.text, ...(k.common && {c: 1})})),
        s: entry.sense.map(s => ({p: s.partOfSpeech, ...(s.misc.length && {m: s.misc}), g: s.gloss.map(g => g.text)}))
    }
    small.push(newEntry);
}
fs.writeFileSync("data/jmdict-eng-3.6.2-small.json", JSON.stringify(small));
console.log("file size: " + fs.statSync("data/jmdict-eng-3.6.2-small.json").size);