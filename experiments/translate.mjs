import {pipeline} from "@huggingface/transformers";

const triples = [
    ["きょうはあさからあめがふっています", "きょう は あさ から あめ が ふっています", "今日は朝から雨がふっています"],
    ["わたしはねこがすきです", "わたし は ねこ が すき です", "私は猫が好きです"],
    ["ともだちとこうえんへいきました", "ともだち と こうえん へ いきました", "友達と公園へいきました"],
    ["まいにちみずをのみます", "まいにち みず を のみます", "毎日水をのみます"],
    ["このほんはおもしろかった", "この ほん は おもしろかった", "この本はおもしろかった"],
];

console.time("load");
const translate = await pipeline("translation", "Xenova/opus-mt-ja-en");
console.timeEnd("load");

for(const [raw, spaced, kanji] of triples) {
    const a = await translate(raw);
    const b = await translate(spaced);
    const c = await translate(kanji);
    console.log(raw);
    console.log("   raw:    ", a[0].translation_text);
    console.log("   spaced: ", b[0].translation_text);
    console.log("   kanji:  ", c[0].translation_text);
}