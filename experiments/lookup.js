const dict = require("./dict");
function lookup(base, pos, reading) {
    let entries = dict.get(base);
    if(!entries && base.endsWith("する"))
        entries = dict.get(base.slice(0, -2));
    if(!entries)
        return "???";
    if(pos === "助詞")
    {
        const prts = entries.filter(e => e.s.some(s => s.p.includes("prt")));
        if(prts.length)
            entries = prts;
    }
    const r = toHira(reading);
    const byReading = entries.filter(e => e.r.some(k => r.startsWith(k.t.slice(0, -1))));
    if(byReading.length)
        entries = byReading;
    const hasKanji = /[\u4e00-\u9faf]/.test(base);
    if(!hasKanji) {
        const uk = entries.filter(e => e.s.some(s => s.m?.includes("uk")));
        if(uk.length)
            entries = uk;
    }
    const pick = entries.find(e => [...e.k, ...e.r].some(s => s.c)) || entries[0];
    return pick.s[0].g[0];
}

function toHira(s) {
    if(!s)
        return "";
    return s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

module.exports = {lookup};