const KEEP_KANA = ["か", "この", "その", "あの", "どの", "これ", "それ", "あれ", "どれ", "ここ", "そこ", "あそこ", "どこ"];
const common = list => list.filter(e => e.f < 99).sort((a, b) => a.f - b.f).slice(0, 4);
const isVerbish = e => e.s.some(s => s.p.some(p => p.startsWith("v") || p.startsWith("adj-i")));
const dedupe = list => [...new Map(list.map(o => [o.text, o])).values()];

function commonSuffix(a, b) {
    let n = 0;
    while(n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n])
        n++;
    return n;
}

function optionsFor(words) {
    return words.map(w => {
        const keep = [{text: w.surface, base: w.bases[0]}];
        if(CHEAP.includes(w.surface) || KEEP_KANA.includes(w.surface))
            return keep;
        // verb and adjective stuff
        if(w.bases[0] !== w.surface) {
            const outs = [];
            for(const base of w.bases) {
                if(base.endsWith("する")) {
                    const noun = base.slice(0, -2);
                    for(const e of common(dict.get(noun) || [])) {
                        const kn = e.k[0]?.t;
                        if(kn && w.surface.startsWith(noun))
                            outs.push({text: kn + w.surface.slice(noun.length), base: kn + "する"});
                    }
                    continue;
                }
                for(const e of common((dict.get(base) || []).filter(isVerbish))) {
                    if(e.s[0].m?.includes("uk")) {
                        outs.push({text: w.surface, base});
                        continue;
                    }
                    const kb = e.k[0]?.t;
                    if(!kb)
                        continue;
                    const n = commonSuffix(kb, base);
                    const ks = base.slice(0, base.length - n);
                    if(w.surface.startsWith(ks))
                        outs.push({text: kb.slice(0, kb.length - n) + w.surface.slice(ks.length), base: kb});
                }
            }
            return outs.length ? dedupe(outs) : keep;
        }
        // noun stuff
        const entries = common(dict.get(w.surface) || []);
        const kanji = entries.filter(e => !e.s[0].m?.includes("uk")).map(e => e.k[0]?.t).filter(Boolean);
        return kanji.length ? dedupe(kanji.map(k => ({text: k, base: k}))) : keep;
    });
}

function options(s) {
    return optionsFor(segment(s));
}


function beamWords(t, words, width = 3) { // returns {text, score, picks} with word i having choice picks[i]
    let beams = [{text: "", score: 0, picks: []}];
    for(const choices of optionsFor(words)) {
        if(choices.length === 1) {
            beams = beams.map(b => ({text: b.text + choices[0].text, score: b.score, picks: [...b.picks, choices[0]]}));
            continue;
        }
        const next = [];
        for(const b of beams)
            for(const c of choices) {
                const text = b.text + c.text;
                next.push({text, score: ngramScore(t, text), picks: [...b.picks, c]});
            }
        next.sort((a, b) => b.score - a.score);
        beams = next.slice(0, width);
    }
    return beams[0];
}

const SEG_WEIGHT = 1;
function beam(t, s, width = 3) { // beam search!!
    let best = null;
    for(const words of segmentK(s, 3)) {
        const b = beamWords(t, words, width);
        const score = ngramScore(t, b.text) - SEG_WEIGHT * words.cost;
        if(!best || score > best.score)
            best = {text: b.text, picks: b.picks, words, score};
    }
    return best;
}