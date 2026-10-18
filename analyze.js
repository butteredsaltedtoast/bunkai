function kanaChunks(t, text) {
    const runs = text.match(/[\u3041-\u309f]+|[\u30a0-\u30ff]+/g) || [];
    const chunks = [];
    for(const run of runs) {
        const isHira = /^[\u3041-\u309f]/.test(run);
        const words = isHira ? segment(run) : [{surface: run, bases: [run]}];
        const picks = isHira ? beam(t, run).picks : []; // picks[i] works with words[i] so this is fine.
        words.forEach((w, i) => {
            const base = w.bases[0];
            const isVerb = base !== w.surface;
            const isParticle = !isVerb && dict.get(base)?.some(e => e.s.some(s => s.p.includes("prt")));
            const pick = picks[i];
            chunks.push({
                surface: w.surface, reading: w.surface, stemReading: base, base_form: base, bases: w.bases,
                kanjiBase: pick && pick.text !== w.surface ? pick.base : null,
                pos: isVerb ? "動詞" : isParticle ? "助詞" : "",
            });
        });
    }
    return chunks;
}

function analyzeWith(t, text) {
    const hasKanji = /[\u4e00-\u9faf]/.test(text);
    const tokens = hasKanji ? merge(t.tokenize(text)).filter(c => c.pos !== "記号") : kanaChunks(t, text);
    const words = tokens.map(tok => ({
        word: tok.surface,
        reading: toHira(tok.reading),
        base_reading: tok.kanjiBase ? tok.base_form: (dict.get(tok.base_form)?.[0]?.r[0]?.t || ""),
        dictionary_form: tok.kanjiBase || tok.base_form,
        part_of_speech: tok.pos,
        meaning: tok.pos_detail_1 === "数" || /^[0-9０-９,.]+$/.test(tok.surface)
            ? (Number.isFinite(parseJaNumber(tok.surface)) ? `number: ${parseJaNumber(tok.surface).toLocaleString("en-US")}` : "number")
            : tok.kanjiBase
                ? lookup(tok.kanjiBase, tok.pos, tok.stemReading, tok.pos_detail_1)
                : tok.bases?.length > 1
                    ? tok.bases.map(b => `${b}: ${lookup(b, tok.pos, b)}`).join(" / ")
                    : lookup(tok.base_form, tok.pos, tok.stemReading, tok.pos_detail_1),
        details: findEntries(tok.kanjiBase || tok.base_form, tok.pos, tok.stemReading, tok.pos_detail_1).map(e => ({
            spellings: [...e.k, ...e.r].map(s => s.t),
            senses: e.s.map((s, i) => ({
                pos: i > 0 && s.p.join() === e.s[i - 1].p.join() ? "" : s.p.map(c => POS_NAMES[c] || c).join(", "),
                gloss: s.g.join("; "),
            }))
        })),
        role: roleFor(tok),
    }));
    // kanji view is ONLY!! for text with hiragana and no kanji
    const parts = !hasKanji && /[\u3041-\u309f]/.test(text) ? kanjiParts(t, text) : [];
    const kanji = parts.map(p => p.base).join("");
    return {original: text, kanji, kanjiParts: parts, overall_meaning: "", words};
}

function kanjiParts(t, text) {
    const parts = [];
    for(const chunk of text.match(/[\u3041-\u309f]+|[^\u3041-\u309f]+/g) || []) {
        if(!/^[\u3041-\u309f]/.test(chunk)) {
            parts.push({base: chunk});
            continue;
        }
        const words = segment(chunk);
        const picks = beam(t, chunk).picks;
        words.forEach((w, i) => {
            const text = picks[i]?.text || w.surface;
            if(text === w.surface) {
                parts.push({base: text});
                return;
            }
            const n = commonSuffix(text, w.surface);
            parts.push({base: text.slice(0, text.length - n), ruby: w.surface.slice(0, w.surface.length - n)});
            if(n > 0)
                parts.push({base: text.slice(text.length - n)});
        });
    }
    return parts;
}