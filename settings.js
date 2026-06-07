const input = document.getElementById("apiKey");
const status = document.getElementById("status");
const enabledCheckbox = document.getElementById("enabled");
const shiftKeyCheckbox = document.getElementById("shiftKey");

chrome.storage.sync.get(["geminiKey", "enabled", "shiftKey"], (data) => {
    if (data.geminiKey) input.value = data.geminiKey;
    enabledCheckbox.checked = data.enabled !== false;
    shiftKeyCheckbox.checked = data.shiftKey !== true;
});

document.getElementById("saveBtn").addEventListener("click", () => {
    const key = input.value.trim();
    if (!key) {
        status.style.color = "#f38ba8";
        status.textContent = "Please enter a key.";
        return;
    }
    chrome.storage.sync.set({
        geminiKey: key,
        enabled: enabledCheckbox.checked,
        shiftKey: shiftKeyCheckbox.checked
    }, () => {
        status.style.color = "#a6e3a1";
        status.textContent = "Saved!";
        setTimeout(() => status.textContent = "", 2000);
    });
});