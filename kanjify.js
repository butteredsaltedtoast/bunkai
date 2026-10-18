const KEEP_KANA = ["か", "この", "その", "あの", "どの", "これ", "それ", "あれ", "どれ", "ここ", "そこ", "あそこ", "どこ"];
const common = list => list.filter(e => e.f < 99).sort((a, b) => a.f - b.f).slice(0, 4);
const isVerbish = e => e.s.some(s => s.p.some(p => p.startsWith("v") || p.startsWith("adj-i")));

function commonSuffix(a, b) {
    let n = 0;
    while(n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n])
        n++;
    return n;
}

function options(s) { // every kanji spelling a word COULD be
    return segment(s).map(w => {
        if(CHEAP.includes(w.surface) || KEEP_KANA.includes(w.surface))
            return [w.surface];
        if(w.bases[0] !== w.surface) {
            const outs = [w.surface];
            for(const base of w.bases) {
                if(base.endsWith("する")) {
                    const noun = base.slice(0, -2);
                    for(const e of common(dict.get(noun) || [])) {
                        const kn = e.k[0]?.t;
                        if(kn && w.surface.startsWith(noun))
                            outs.push(kn + w.surface.slice(noun.length));
                    }
                    continue;
                }
                for(const e of common((dict.get(base) || []).filter(isVerbish))) {
                    if(e.s[0].m?.includes("uk"))
                        continue;
                    const kb = e.k[0]?.t;
                    if(!kb)
                        continue;
                    const n = commonSuffix(kb, base);
                    const ks = base.slice(0, base.length - n);
                    if(w.surface.startsWith(ks))
                        outs.push(kb.slice(0, kb.length - n) + w.surface.slice(ks.length));
                }
            }
            return outs.length > 1 ? [...new Set(outs.slice(1))] : outs;
        }
        const entries = common(dict.get(w.surface) || []);
        const kanji = entries.filter(e => !e.s[0].m?.includes("uk")).map(e => e.k[0]?.t).filter(Boolean);
        return kanji.length ? [...new Set(kanji)] : [w.surface];
    });
}

function beam(t, s, width = 3) {
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
                next.push({text, score: ngramScore(t, text)});
            }
        next.sort((a, b) => b.score - a.score);
        beams = next.slice(0, width);
    }
    return beams[0].text;
}