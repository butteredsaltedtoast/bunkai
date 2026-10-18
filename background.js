async function ensureOffscreen() {
    const existing = await chrome.runtime.getContexts({contextTypes: ["OFFSCREEN_DOCUMENT"]});
    if(existing.length)
        return;
    await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["WORKERS"],
        justification: "run the japanese tokenizer"
    });
}
ensureOffscreen();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type === "ANALYZE_TEXT") {
        ensureOffscreen().then(() => chrome.runtime.sendMessage({type: "OFFSCREEN_ANALYZE", text: request.text})).then(sendResponse);
        return true;
    }
    if(request.type === "TRANSLATE") {
        ensureOffscreen().then(() => chrome.runtime.sendMessage({type: "OFFSCREEN_TRANSLATE", text: request.text})).then(sendResponse);
        return true;
    }
});

chrome.commands.onCommand.addListener((command, tab) => {
    if(command === "analyze-selection")
        chrome.tabs.sendMessage(tab.id, {type: "SHORTCUT"});
});