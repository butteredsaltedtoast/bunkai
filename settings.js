// settings stuff
const status = document.getElementById("status");
const enabledCheckbox = document.getElementById("enabled");
const themeSelect = document.getElementById("theme");
const translateCheckbox = document.getElementById("translate");

// review stuff
const card = document.getElementById("card");
const front = document.getElementById("card-front");
const back = document.getElementById("card-back");
const showBtn = document.getElementById("show");
const againBtn = document.getElementById("again");
const goodBtn = document.getElementById("good");
const startBtn = document.getElementById("start-review");
const reviewStatus = document.getElementById("review-status");
const progress = document.getElementById("review-progress");
const mastery = document.getElementById("mastery");
const resetBtn = document.getElementById("reset-review");

// settings

function flash() {
    status.textContent = "saved!";
    setTimeout(() => status.textContent = "", 1500);
}

function renderVocab() {
    chrome.storage.local.get(["vocab"], (data) => {
        const vocab = data.vocab || [];
        const mastered = vocab.filter(v => (v.box || 0) >= 3).length;
        mastery.textContent = vocab.length ? `${mastered} / ${vocab.length} mastered` : "";
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

// review

let queue = [];
let current = null;
function startReview() {
    chrome.storage.local.get(["vocab"], (data) => {
        const vocab = data.vocab || [];
        if(!vocab.length) {
            reviewStatus.textContent = "save some words first!";
            return;
        }
        // mini leitner
        queue = [...vocab].sort((a, b) => (a.box || 0) - (b.box || 0) || Math.random() - 0.5).slice(0, 10);
        reviewStatus.textContent = "";
        showNext();
    })
}

function showNext() {
    current = queue.shift();
    if(!current) {
        card.hidden = true;
        startBtn.hidden = false;
        reviewStatus.textContent = "finished!!!";
        return;
    }
    card.hidden = false;
    startBtn.hidden = true;
    progress.textContent = `${queue.length + 1} left`;
    front.textContent = current.dictionary_form;
    back.textContent = `${current.reading}: ${current.meaning}`;
    back.hidden = true;
    showBtn.hidden = false;
    againBtn.hidden = true;
    goodBtn.hidden = true;
}

function answer(correct) {
    chrome.storage.local.get(["vocab"], (data) => {
        const vocab = data.vocab || [];
        const v = vocab.find(x => x.dictionary_form === current.dictionary_form);
        if(v)
            v.box = correct ? (v.box || 0) + 1 : 0;
        if(!correct)
            queue.push(current);
        chrome.storage.local.set({vocab}, () => {
            renderVocab();
            showNext();
        });
    });
}

startBtn.addEventListener("click", startReview);
showBtn.addEventListener("click", () => {
    back.hidden = false;
    showBtn.hidden = true;
    againBtn.hidden = false;
    goodBtn.hidden = false;
});
againBtn.addEventListener("click", () => answer(false));
goodBtn.addEventListener("click", () => answer(true));
resetBtn.addEventListener("click", () => {
    chrome.storage.local.get(["vocab"], (data) => {
        const vocab = (data.vocab || []).map(v => ({...v, box: 0}));
        chrome.storage.local.set({vocab}, () => {
            renderVocab();
            reviewStatus.textContent = "progress reset";
        });
    });
});