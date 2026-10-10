const status = document.getElementById("status");
const enabledCheckbox = document.getElementById("enabled");
const themeSelect = document.getElementById("theme");

chrome.storage.sync.get(["enabled", "theme"], (data) => {
    enabledCheckbox.checked = data.enabled !== false;
    themeSelect.value = data.theme || "auto";
});
document.getElementById("enabled").addEventListener("change", () => {
    chrome.storage.sync.set({enabled: enabledCheckbox.checked}, () => {
        status.textContent = "saved!";
        setTimeout(() => status.textContent = "", 1500);
    });
});
document.getElementById("theme").addEventListener("change", () => {
    chrome.storage.sync.set({theme: themeSelect.value}, () => {
        status.textContent = "saved!";
        setTimeout(() => status.textContent = "", 1500);
    });
});