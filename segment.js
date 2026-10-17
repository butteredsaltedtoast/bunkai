const CHEAP = ["は", "が", "を", "に", "で", "と", "も", "の", "へ", "から", "まで", "より", "です", "でした", "だ", "だった", "この", "その", "あの", "どの"];
function segment(s) {
    const best = new Array(s.length + 1).fill(Infinity);
    best[0] = 0;
    const from = new Array(s.length + 1).fill(-1);
    const baseAt = new Array(s.length + 1).fill(null);
    for(let k = 1; k <= s.length; k++) {
        for(let j = Math.max(0, k - 10); j < k; j++) {
            const w = s.slice(j, k);
            let c, bases = [w];
            if(CHEAP.includes(w))
                c = 0.2;
            else { // a word can be both dictionary entry AND!!! conjugated form, so try both!
                const dictC = dict.has(w) ? cost(w) : Infinity;
                const cands = deinflect(w);
                const defC = cands.length ? Math.min(...cands.map(cost)) : Infinity;
                if(dictC === Infinity && defC === Infinity) {
                    if(w.length === 1)
                        c = 8;
                    else
                        continue;
                } 
                else if(defC < dictC) {
                    bases = cands.filter(b => cost(b) <= defC + 0.5).sort((a, b) => cost(a) - cost(b));
                    c = defC;
                }
                else
                    c = dictC;
            }
            const prevWord = j > 0 ? s.slice(from[j], j) : null;
            if(prevWord === w && CHEAP.includes(w))
                c += 5;
            if(best[j] + c < best[k]) {
                best[k] = best[j] + c;
                from[k] = j;
                baseAt[k] = bases;
            }
        }
    }
    const result = [];
    let k = s.length;
    while(k > 0) {
        const j = from[k];
        if(j === -1)
            throw new Error("no segmentation found");
        result.push({surface: s.slice(j, k), bases: baseAt[k]});
        k = j;
    }
    const out = [];
    for(const w of result.reverse()) {
        const prev = out[out.length - 1];
        const canSuru = prev && dict.get(prev.bases[0])?.some(e => e.s.some(s => s.p.includes("vs")));
        if(canSuru && w.bases.includes("する")) {
            prev.surface += w.surface;
            prev.bases = [prev.bases[0] + "する"];
        }
        else
            out.push(w);
    }
    return out;
}

function cost(w) {
    if(CHEAP.includes(w))
        return 0.2;
    if(w.includes("を"))
        return 5;
    const entries = dict.get(w);
    if(entries.every(e => e.s[0].p.includes("exp")))
        return 5;
    let c = 0.5 + Math.min(...entries.map(e => e.f)) / 20;
    if(w.length === 1)
        c += 1;
    if(/^[\u3041-\u309f]+$/.test(w) && !entries.some(e => e.r.some(r => r.t === w && r.c))) // basically rare reading of common words DO NOT inherit frequency
        c += 1.5;
    return c;
}