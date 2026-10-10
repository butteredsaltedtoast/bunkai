const bigjson = require("./data/jmdict-eng-3.6.2.json");
const small = []
const fs = require("fs");

const xml = fs.readFileSync("data/JMdict_e", "utf-8");
var freq = new Map();

for(const chunk of xml.split("<entry")) {
    const id = chunk.match(/<ent_seq>(\d+)<\/ent_seq>/)?.[1];
    if(!id)
        continue;
    const tags = [...chunk.matchAll(/<(?:ke|re)_pri>(\w+)</g)].map(m => m[1]);
    let score = 99;
    const nf = tags.find(t => t.startsWith("nf"));
    if(nf)
        score = Number(nf.slice(2));
    else if (tags.some(t => ["news1", "ichi1", "spec1"].includes(t)))
        score = 49;
    else if (tags.some(t => ["news2", "ichi2", "spec2", "gai1"].includes(t)))
        score = 60;
    freq.set(id, score);
}

for(const entry of bigjson.words) {
    const newEntry = {
        k: entry.kanji.map(k => ({t: k.text, ...(k.common && {c: 1})})),
        r: entry.kana.map(k => ({t: k.text, ...(k.common && {c: 1})})),
        s: entry.sense.map(s => ({p: s.partOfSpeech, ...(s.misc.length && {m: s.misc}), g: s.gloss.map(g => g.text)})),
        f: freq.get(entry.id) ?? 99
    }
    small.push(newEntry);
}
fs.writeFileSync("data/jmdict-eng-3.6.2-small.json", JSON.stringify(small));
console.log("file size: " + fs.statSync("data/jmdict-eng-3.6.2-small.json").size);