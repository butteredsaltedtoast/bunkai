let NG = null, NG_N = 0, NG_V = 0;

function setNgram(data) {
    NG = data;
    NG_N = Object.values(NG.uni).reduce((a, b) => a + b, 0);
    NG_V = Object.keys(NG.uni).length;
}

async function loadNgram(base = "") {
    const res = await fetch(base + "data/ngram.json");
    setNgram(await res.json());
}

function ngramScore(t, text) {
    const words = ["<s>", ...t.tokenize(text).map(x => x.surface_form)];
    let total = 0;
    for(let k = 1; k < words.length; k++) {
        const prev = words[k - 1], w = words[k];
        const pBi = NG.uni[prev] ? (NG.bi[prev + "\t" + w] || 0) / NG.uni[prev] : 0;
        const pUni = ((NG.uni[w] || 0) + 1) / (NG_N + NG_V);
        total += Math.log(0.8 * pBi + 0.2 * pUni);
    }
    return total;
}