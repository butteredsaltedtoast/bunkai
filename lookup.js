function lookup(base, pos, reading, detail) {
    let entries = dict.get(base);
    if(!entries && base.endsWith("する"))
        entries = dict.get(base.slice(0, -2));
    if(!entries)
        return "???";
    const senseFor = e => {
        if(pos === "助詞" && detail === "格助詞")
        {
            const s = e.s.find(s => !s.p.includes("conj"));
            if(s)
                return s.g[0];
        }
        return e.s[0].g[0];
    };
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
    entries = [...entries].sort((a, b) => a.f - b.f);
    entries = entries.filter(e => e.f <= entries[0].f + 10);
    if(entries[0].f < 99)
        entries = entries.filter(e => e.f < 99);
    const top = entries.slice(0, 3);
    if(top.length == 1)
        return senseFor(top[0]);
    return top.map(e => `${e.k[0]?.t || e.r[0].t}: ${senseFor(e)}`).join(" / ");
}

function toHira(s) {
    if(!s)
        return "";
    return s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}