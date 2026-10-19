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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // for translator
    if(request.type === "ANALYZE_TEXT") {
        ensureOffscreen().then(() => chrome.runtime.sendMessage({type: "OFFSCREEN_ANALYZE", text: request.text})).then(sendResponse);
        return true;
    }
    if(request.type === "TRANSLATE") {
        ensureOffscreen().then(() => chrome.runtime.sendMessage({type: "OFFSCREEN_TRANSLATE", text: request.text})).then(sendResponse);
        return true;
    }
});

chrome.commands.onCommand.addListener((command, tab) => { // for shortcut
    if(command === "analyze-selection")
        chrome.tabs.sendMessage(tab.id, {type: "SHORTCUT"});
});

chrome.runtime.onInstalled.addListener(() => { // show right click stuff
    chrome.contextMenus.create({
        id: "bunkai",
        title: "break down with bunkai (分解)",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => { // for right click option to work!
    if(info.menuItemId === "bunkai")
        chrome.tabs.sendMessage(tab.id, {type: "SHORTCUT"});
});