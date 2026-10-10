const status = document.getElementById("status");
const enabledCheckbox = document.getElementById("enabled");

chrome.storage.sync.get(["enabled"], (data) => {
    enabledCheckbox.checked = data.enabled !== false;
});
document.getElementById("enabled").addEventListener("change", () => {
    chrome.storage.sync.set({enabled: enabledCheckbox.checked}, () => {
        status.textContent = "saved!";
        setTimeout(() => status.textContent = "", 1500);
    })
})