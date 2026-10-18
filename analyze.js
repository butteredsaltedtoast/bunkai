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

function analyzeWith(t, text) {
    const hasKanji = /[\u4e00-\u9faf]/.test(text);
    const tokens = hasKanji ? merge(t.tokenize(text)).filter(c => c.pos !== "記号") : kanaChunks(text);
    const words = tokens.map(tok => ({
        word: tok.surface,
        reading: toHira(tok.reading),
        base_reading: dict.get(tok.base_form)?.[0]?.r[0]?.t || "",
        dictionary_form: tok.base_form,
        part_of_speech: tok.pos,
        meaning: tok.bases?.length > 1 ?
            tok.bases.map(b => `${b}: ${lookup(b, tok.pos, b)}`).join(" / ") :
            lookup(tok.base_form, tok.pos, tok.stemReading, tok.pos_detail_1),
        details: findEntries(tok.base_form, tok.pos, tok.stemReading, tok.pos_detail_1).map(e => ({
            spellings: [...e.k, ...e.r].map(s => s.t),
            senses: e.s.map((s, i) => ({
                pos: i > 0 && s.p.join() === e.s[i - 1].p.join() ? "" : s.p.map(c => POS_NAMES[c] || c).join(", "),
                gloss: s.g.join("; "),
            }))
        })),
        role: roleFor(tok),
    }));
    // kanji view is ONLY!! for text with hiragana and no kanji
    const kanji = !hasKanji && /[\u3041-\u309f]/.test(text) ? beam(t, text) : "";
    return {original: text, kanji, overall_meaning: "", words};
}