import {createRequire} from "module";
import {score} from "./lm.mjs";
const require = createRequire(import.meta.url);
const {options, cases} = require("./kanjify.js");

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

if(import.meta.url === `file://${process.argv[1]}`) {
    let pass = 0;
    for(const [input, want] of cases) {
        const got = await beam(input);
        const ok = got === want;
        if(ok)
            pass++;
        console.log(`${ok ? "PASS" : "FAIL"} ${got}${ok ? "" : "    (want " + want + ")"}`);
    }
    console.log(`\nbeam: ${pass}/${cases.length}`);
}