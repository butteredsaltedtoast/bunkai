const fs = require("fs");

const loadTsv = path => {
    const m = new Map();
    for(const line of fs.readFileSync(path, "utf8").split("\n")) {
        const [id, , text] = line.split("\t");
        if(text)
            m.set(id, text);
    }
    return m;
};

const jpn = loadTsv("data/jpn_sentences.tsv");
const eng = loadTsv("data/eng_sentences.tsv");
console.log("loaded", jpn.size, "japanese and", eng.size, "english sentences");

const byWord = new Map(); // word maps to jp, en, good
for(const line of fs.readFileSync("data/jpn_indices.csv", "utf8").split("\n")) {
    const [jid, eid, bline] = line.split("\t");
    const jp = jpn.get(jid), en = eng.get(eid);
    if(!jp || !en || !bline || jp.length > 30) // short only!!
        continue;
    for(const token of bline.trim().split(" ")) {
        const head = token.split(/[([{~]/)[0];
        const reading = token.match(/\(([^)]+)\)/)?.[1];
        const good = token.includes("~");
        for(const key of [head, reading]) {
            if(!key)
                continue;
            if(!byWord.has(key))
                byWord.set(key, []);
            byWord.get(key).push({jp, en, good});
        }
    }
}

const sentences = [];
const sentIndex = new Map();
const index = {};
for(const [word, list] of byWord) {
    list.sort((a, b) => (b.good - a.good) || (a.jp.length - b.jp.length));
    const picked = [];
    for(const {jp, en} of list) {
        if(picked.length === 3)
            break;
        const k = jp + "\t" + en;
        if(!sentIndex.has(k)) {
            sentIndex.set(k, sentences.length);
            sentences.push([jp, en]);
        }
        if(!picked.includes(sentIndex.get(k)))
            picked.push(sentIndex.get(k));
    }
    index[word] = picked;
}

fs.writeFileSync("../data/example.json", JSON.stringify({sentences, index}));
console.log("words:", Object.keys(index).length, " sentences:", sentences.length);
console.log("file size:", fs.statSync("../data/examples.json").size);