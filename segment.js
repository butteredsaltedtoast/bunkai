const CHEAP = ["は", "が", "を", "に", "で", "と", "も", "の", "へ", "から", "まで", "より", "です", "でした", "だ", "だった", "この", "その", "あの", "どの"];

function wordCost(w) {
    if(CHEAP.includes(w))
        return {c: 0.2, bases: [w]};
    const dictC = dict.has(w) ? cost(w) : Infinity;
    const cands = deinflect(w);
    const defC = cands.length ? Math.min(...cands.map(cost)) : Infinity;
    if(dictC === Infinity && defC === Infinity)
        return w.length === 1 ? {c: 8, bases: [w]} : null;
    if(defC < dictC)
        return {c: defC, bases: cands.filter(b => cost(b) <= defC + 0.5).sort((a, b) => cost(a) - cost(b))};
    return {c: dictC, bases: [w]};
}

function glueSuru(words) {
    const out = [];
    for(const w of words) {
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

function segmentK(s, K = 3) {
    const cand = Array.from({length: s.length + 1}, () => []);
    cand[0] = [{cost: 0, j: -1, r: -1, word: null, bases: null}];
    for(let k = 1; k <= s.length; k++) {
        const list = [];
        for(let j = Math.max(0, k - 10); j < k; j++) {
            if(!cand[j].length)
                continue;
            const w = s.slice(j, k);
            const wc = wordCost(w);
            if(!wc)
                continue;
            cand[j].forEach((p, r) => {
                let c = wc.c;
                if(p.word === w && CHEAP.includes(w))
                    c += 5;
                list.push({cost: p.cost + c, j, r, word: w, bases: wc.bases});
            });
        }
        list.sort((a, b) => a.cost - b.cost);
        cand[k] = list.slice(0, K);
    }
    if(!cand[s.length].length)
        throw new Error("no segmentation found");
    return cand[s.length].map(end => {
        const path = [];
        let e = end;
        while(e.j !== -1) {
            path.push({surface: e.word, bases: e.bases});
            e = cand[e.j][e.r];
        }
        const words = glueSuru(path.reverse());
        words.cost = end.cost;
        return words;
    });
}

function segment(s) {
    return segmentK(s, 1)[0];
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