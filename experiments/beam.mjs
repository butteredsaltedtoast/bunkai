import {createRequire} from "module";
import {score} from "./ngram.mjs";
const require = createRequire(import.meta.url);
const {options, cases, fresh, fresh2, fresh3} = require("./kanjify.js");

export async function beam(s, width = 3) {
    let beams = [{text: "", score: 0}];
    for(const choices of options(s)) {
        if(choices.length === 1) {
            beams = beams.map(b => ({text: b.text + choices[0], score: b.score}));
            continue;
        }
        const next = [];
        for(const b of beams)
            for(const c of choices) {
                const text = b.text + c;
                next.push({text, score: await score(text)});
            }
        next.sort((a, b) => b.score - a.score);
        beams = next.slice(0, width);
    }
    return beams[0].text;
}

let totalcorrect = 0, total = 0;
async function run(name, set) {
    let pass = 0;
    console.log(`---tests of set ${name}---`);
    for(const [input, want] of set) {
        const got = await beam(input);
        const ok = got === want;
        if(ok) {
            pass++;
            totalcorrect++;
        }

        console.log(`${ok ? "PASS" : "FAIL"} ${got}${ok ? "" : "   (want " + want + ")"}`);
        total++;
    }
    console.log(`${name}: ${pass}/${set.length}\n`);
}

if(import.meta.url === `file://${process.argv[1]}`) {
    totalcorrect = 0;
    total = 0;
    await run("old", cases);
    await run("fresh", fresh);
    await run("fresh2", fresh2);
    await run("fresh3", fresh3);
    console.log(`total: ${totalcorrect}/${total}\n`);
}