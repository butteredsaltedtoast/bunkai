const status = document.getElementById("status");
const enabledCheckbox = document.getElementById("enabled");
const themeSelect = document.getElementById("theme");

function flash() {
    status.textContent = "saved!";
    setTimeout(() => status.textContent = "", 1500);
}

chrome.storage.sync.get(["enabled", "theme"], (data) => {
    enabledCheckbox.checked = data.enabled !== false;
    themeSelect.value = data.theme || "auto";
    document.body.dataset.theme = themeSelect.value;
});

enabledCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({enabled: enabledCheckbox.checked}, flash);
});

themeSelect.addEventListener("change", () => {
    document.body.dataset.theme = themeSelect.value;
    chrome.storage.sync.set({theme: themeSelect.value}, flash);
})