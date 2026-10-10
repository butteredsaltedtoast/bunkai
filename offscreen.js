const ready = new Promise(resolve => {
    kuromoji.builder({dicPath: "lib/dict"}).build(async (err, t) => {
        if(err)
        {
            console.error(err);
            return;
        }
        await loadDict();
        resolve(t);
    });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg.type !== "OFFSCREEN_ANALYZE")
        return;
    analyze(msg.text).then(sendResponse);
    return true;
});

async function analyze(text) {
    const t = await ready;
    const tokens = /[\u4e00-\u9faf]/.test(text) ? merge(t.tokenize(text)).filter(c => c.pos !== "記号") : kanaChunks(text);
    const words = tokens.map(tok => ({
        word: tok.surface,
        reading: toHira(tok.reading),
        dictionary_form: tok.base_form,
        part_of_speech: tok.pos,
        meaning: tok.bases?.length > 1 ? tok.bases.map(b => `${b}: ${lookup(b, tok.pos, b)}`).join(" / ") : lookup(tok.base_form, tok.pos, tok.stemReading, tok.pos_detail_1),
        role: ""
    }));
    return {result: {original: text, overall_meaning: "", words}};
}

function kanaChunks(text) {
    const runs = text.match(/[\u3041-\u309f]+|[\u30a0-\u30ff]+/g) || [];
    const chunks = [];
    for(const run of runs) {
        const isHira = /^[\u3041-\u309f]/.test(run);
        const words = isHira ? segment(run) : [{surface: run, bases: [run]}];
        for(const w of words) {
            const base = w.bases[0];
            const isVerb = base !== w.surface;
            const isParticle = !isVerb && dict.get(base)?.some(e => e.s.some(s => s.p.includes("prt")));
            chunks.push({surface: w.surface, reading: w.surface, stemReading: base, base_form: base, bases: w.bases, pos: isVerb ? "動詞" : isParticle ? "助詞" : ""});
        }
    }
    return chunks;
}