import {createRequire} from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const vm = require("vm");
const kuromoji = require("kuromoji");
const {cases, fresh, fresh2, fresh3, fresh4} = require("./sets.js");

const ctx = {dict: require("./dict"), console};
vm.createContext(ctx);
for(const f of ["deinflect.js", "segment.js", "ngram.js", "kanjify.js"])
    vm.runInContext(fs.readFileSync("../" + f, "utf8"), ctx);
ctx.setNgram(JSON.parse(fs.readFileSync("../data/ngram.json", "utf8")));

const t = await new Promise((res, rej) => 
    kuromoji.builder({dicPath: "node_modules/kuromoji/dict"}).build((e, tk) => e ? rej(e) : res(tk)));

let totalCorrect = 0, total = 0;
function run(name, set) {
    let pass = 0;
    console.log(`---tests of set ${name}---`);
    for(const [input, want] of set) {
        const got = ctx.beam(t, input).text;
        const ok = [].concat(want).includes(got);
        if(ok) {
            pass++;
            totalCorrect++;
        }
        total++;
        console.log(`${ok ? "PASS" : "FAIL"} ${got}${ok ? "" : "    (want " + want + ")"}`);
    }
    console.log(`${name}: ${pass}/${set.length}\n`);
}

run("old", cases);
run("fresh", fresh);
run("fresh2", fresh2);
run("fresh3", fresh3);
run("fresh4", fresh4);
console.log(`total: ${totalCorrect}/${total}`);