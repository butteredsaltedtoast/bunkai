const status = document.getElementById("status");
const enabledCheckbox = document.getElementById("enabled");
const themeSelect = document.getElementById("theme");
const translateCheckbox = document.getElementById("translate");

function flash() {
    status.textContent = "saved!";
    setTimeout(() => status.textContent = "", 1500);
}

function renderVocab() {
    chrome.storage.local.get(["vocab"], (data) => {
        const vocab = data.vocab || [];
        document.getElementById("vocab-list").innerHTML = "";
        vocab.forEach((v, i) => {
            const row = document.createElement("div");
            row.className = "vocab-row";
            row.textContent = `${v.dictionary_form} (${v.reading}): ${v.meaning}`;
            const del = document.createElement("button");
            del.textContent = "✕";
            del.addEventListener("click", () => {
                vocab.splice(i, 1);
                chrome.storage.local.set({vocab}, renderVocab);
            });
            row.appendChild(del);
            document.getElementById("vocab-list").appendChild(row);
        });
    })
}

document.getElementById("export").addEventListener("click", () => {
    chrome.storage.local.get(["vocab"], (data) => {
        const q = s => `"${String(s).replace(/"/g, '""')}"`;
        const csv = (data.vocab || []).map(v => `${q(v.dictionary_form)},${q(v.reading + " — " + v.meaning)}`).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], {type: "text/csv"}));
        a.download = "bunkai-vocab.csv";
        a.click();
    });
})

chrome.storage.sync.get(["enabled", "theme", "translate"], (data) => {
    enabledCheckbox.checked = data.enabled !== false;
    themeSelect.value = data.theme || "auto";
    document.body.dataset.theme = themeSelect.value;
    translateCheckbox.checked = data.translate === true;
});

enabledCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({enabled: enabledCheckbox.checked}, flash);
});

themeSelect.addEventListener("change", () => {
    document.body.dataset.theme = themeSelect.value;
    chrome.storage.sync.set({theme: themeSelect.value}, flash);
})

translateCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({translate: translateCheckbox.checked}, flash);
});

renderVocab()