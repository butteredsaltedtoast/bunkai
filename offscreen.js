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
    // merge tokens
    const tokens = merge(t.tokenize(text)).filter(c => c.pos !== "記号");
    const words = tokens.map(tok => ({
        word: tok.surface,
        reading: toHira(tok.reading),
        dictionary_form: tok.base_form,
        part_of_speech: tok.pos,
        meaning: lookup(tok.base_form, tok.pos, tok.stemReading, tok.pos_detail_1),
        role: ""
    }));
    return {result: {original: text, overall_meaning: "", words}};
}