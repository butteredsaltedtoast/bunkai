const fs = require("fs");
const vm = require("vm");
const ctx = {dict: require("./dict"), console};
vm.createContext(ctx);
for(const f of ["deinflect.js", "segment.js", "merge.js", "lookup.js", "roles.js"]) {
    vm.runInContext(fs.readFileSync("../" + f, "utf-8"), ctx);
}

const CHEAP = vm.runInContext("CHEAP", ctx);

function kanjify(s) {
    const words = ctx.segment(s);
    let out = "";
    for(const w of words) {
        if(CHEAP.includes(w.surface)) {
            out += w.surface;
            continue;
        }
        if(w.bases[0] === w.surface && ctx.dict.has(w.surface)) {
            const entries = ctx.findEntries(w.surface, "", w.surface);
            if(!entries.length || entries[0].s[0].m?.includes("uk")) {
                out += w.surface;
                continue;
            }
            if(entries[1] && entries[1].f === entries[0].f) {
                out += w.surface;
                continue;
            }
            const kanji = entries[0]?.k[0]?.t
            out += kanji || w.surface
        }
        else if (w.bases[0] !== w.surface) {
            const base = w.bases[0];
            const entries = ctx.findEntries(base, "動詞", base);
            const kanjiBase = entries[0]?.k[0]?.t;
            if(!kanjiBase || entries[0].s[0].m?.includes("uk")) {
                out += w.surface;
                continue;
            }
            const n = commonSuffix(kanjiBase, base);
            const kanjiStem = kanjiBase.slice(0, kanjiBase.length - n);
            const kanaStem = base.slice(0, base.length - n);
            if(w.surface.startsWith(kanaStem))
                out += kanjiStem + w.surface.slice(kanaStem.length);
            else
                out += w.surface;
        }
        else
            out += w.surface;
    }
    return out;
}

function commonSuffix(a, b) {
    let n=  0;
    while(n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n])
        n++;
    return n;
}

if(require.main === module) {
const tests = ["きょうはあさからあめがふっています", "わたしはねこがすきです", "ともだちとこうえんへいきました", "まいにちみずをのみます", "このほんはおもしろかった"];
for(const s of tests)
    console.log(s, "->", kanjify(s));
}

module.exports = {kanjify};