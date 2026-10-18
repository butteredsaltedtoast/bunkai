const ready = new Promise(resolve => {
    kuromoji.builder({dicPath: "lib/dict"}).build(async (err, t) => {
        if(err) {
            console.error(err);
            return;
        }
        await loadDict();
        await loadNgram();
        resolve(t);
    });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg.type === "OFFSCREEN_ANALYZE") {
        ready.then(t => sendResponse({result: analyzeWith(t, msg.text)}));
        return true;
    }
    if(msg.type === "OFFSCREEN_TRANSLATE") {
        ready.then(async t => {
            try {
                const hasKanji = /[\u4e00-\u9faf]/.test(msg.text);
                const input = hasKanji ? msg.text: msg.text.replace(/[\u3041-\u309f]+/g, run => beam(t, run).text); // kanjify first!!
                sendResponse({translation: await window.translateText(input)});
            }
            catch(e) {
                sendResponse({error: String(e)});
            }
        });
        return true;
    }
});