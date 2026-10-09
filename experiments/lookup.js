const dict = require("./dict");
function lookup(base, pos, reading) {
    let entries = dict.get(base);
    if(!entries && base.endsWith("する"))
        entries = dict.get(base.slice(0, -2));
    if(!entries)
        return "???";
    if(pos === "助詞")
    {
        const prts = entries.filter(e => e.sense.some(s => s.partOfSpeech.includes("prt")));
        if(prts.length)
            entries = prts;
    }
    const r = toHira(reading);
    const byReading = entries.filter(e => e.kana.some(k => r.startsWith(k.text.slice(0, -1))));
    if(byReading.length)
        entries = byReading;
    const hasKanji = /[\u4e00-\u9faf]/.test(base);
    if(!hasKanji) {
        const uk = entries.filter(e => e.sense.some(s => s.misc.includes("uk")));
        if(uk.length)
            entries = uk;
    }
    const pick = entries.find(e => [...e.kanji, ...e.kana].some(s => s.common)) || entries[0];
    return pick.sense[0].gloss[0].text;
}

function toHira(s) {
    if(!s)
        return "";
    return s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

module.exports = {lookup};