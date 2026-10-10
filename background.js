async function ensureOffscreen() {
    const existing = await chrome.runtime.getContexts({contextTypes: ["OFFSCREEN_DOCUMENT"]});
    if(existing.length)
        return;
    await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["WORKERS"],
        justification: "run japanese tokenizer"
    });
}
ensureOffscreen();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ANALYZE_TEXT") {
        analyzeText(request.text).then(sendResponse);
        return true;
    }
});

async function analyzeText(text) {
    await ensureOffscreen();
    return chrome.runtime.sendMessage({type: "OFFSCREEN_ANALYZE", text});
}