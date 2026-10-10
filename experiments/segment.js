const dict = require("./dict");
function segment(s) {
    const best = new Array(s.length + 1).fill(Infinity);
    best[0] = 0;
    const from = new Array(s.length + 1).fill(-1);
    for(let k = 1; k <= s.length; k++) {
        for(let j = Math.max(0, k - 10); j < k; j++) {
            const w = s.slice(j, k);
            let c;
            if(dict.has(w))
                c = cost(w);
            else if(w.length === 1)
                c = 5;
            else
                continue;
            if(best[j] + c < best[k]) {
                best[k] = best[j] + c;
                from[k] = j;
            }
        }
    }
    // walk backwards to collect words
    const result = [];
    let k = s.length;
    while(k > 0) {
        const j = from[k];
        if(j === -1)
            throw new Error("no segmentation found");
        result.push(s.slice(j, k));
        k = j;
    }
    return result.reverse();
}

function cost(w) {
    return 0.5 + (Math.min(...dict.get(w).map(e => e.f))) / 20;
}

console.log(segment("きょうはあさからあめがふっています"));