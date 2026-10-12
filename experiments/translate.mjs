import {pipeline} from "@huggingface/transformers";

const sets = [
    ["きょうはあさからあめがふっています", "きょう は あさ から あめ が ふっています", "今日は朝から雨がふっています", "今日は朝から雨が降っています"],
    ["わたしはねこがすきです", "わたし は ねこ が すき です", "私は猫がすきです", "私は猫が好きです"],
    ["ともだちとこうえんへいきました", "ともだち と こうえん へ いきました", "友達と公園へいきました", "友達と公園へ行きました"],
    ["まいにちみずをのみます", "まいにち みず を のみます", "毎日水をのみます", "毎日水を飲みます"],
    ["このほんはおもしろかった", "この ほん は おもしろかった", "この本はおもしろかった", "この本は面白かった"],
];
const labels = ["raw", "spaced", "nouns", "all"];

console.time("load");
const translate = await pipeline("translation", "Xenova/opus-mt-ja-en");
console.timeEnd("load");

for(const set of sets) {
    console.log(set[0]);
    for(let k = 0; k < set.length; k++) {
        const out = await translate(set[k]);
        console.log(`   ${labels[k].padEnd(7)} ${out[0].translation_text}`);
    }
}