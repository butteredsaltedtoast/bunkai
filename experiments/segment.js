const dict = require("./dict");
const {deinflect} = require("./deinflect");
const PARTICLES = ["は", "が", "を", "に", "で", "と", "も", "の", "へ", "から", "まで", "より"];
function segment(s) {
    const best = new Array(s.length + 1).fill(Infinity);
    best[0] = 0;
    const from = new Array(s.length + 1).fill(-1);
    const baseAt = new Array(s.length + 1).fill(null);
    for(let k = 1; k <= s.length; k++) {
        for(let j = Math.max(0, k - 10); j < k; j++) {
            const w = s.slice(j, k);
            let c, bases = [w];
            if(dict.has(w))
                c = cost(w);
            else {
                const cands = deinflect(w);
                if(cands.length) {
                    const bestCost = Math.min(...cands.map(cost));
                    bases = cands.filter(b => cost(b) <= bestCost + 0.5).sort((a, b) => cost(a) - cost(b));
                    c = bestCost;
                }
                else if(w.length === 1)
                    c = 8;
                else
                    continue;
            }
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
    return result.reverse();
}

function cost(w) {
    if(PARTICLES.includes(w))
        return 0.2;
    return 0.5 + (Math.min(...dict.get(w).map(e => e.f))) / 20;
}

console.log(segment("としょかんへいきます"));