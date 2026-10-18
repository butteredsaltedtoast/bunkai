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
});