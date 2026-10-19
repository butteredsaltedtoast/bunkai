let popupElement = null;
let buttonElement = null;
let currentTheme = "auto";
let currentTranslate = false;
let currentFurigana = true;
let currentExamples = true;

document.addEventListener("mouseup", (e) => {
    if(!chrome.runtime?.id)
        return;
    if(buttonElement && buttonElement.contains(e.target))
        return;
    if(popupElement && popupElement.contains(e.target))
        return;
    const selected = window.getSelection().toString().trim();
    if(popupElement) {
        popupElement.remove();
        popupElement = null;
    }
    if(buttonElement) {
        buttonElement.remove();
        buttonElement = null;
    }
    if(!selected)
        return
    if(!/[\u3000-\u9fff\uff00-\uffef]/.test(selected))
        return;
    chrome.storage.sync.get(["enabled", "theme", "translate", "furigana", "showExamples"], (data) => {
        if(data.enabled === false)
            return;
        currentTheme = data.theme || "auto";
        currentTranslate = data.translate === true;
        currentFurigana = data.furigana !== false;
        currentExamples = data.showExamples !== false;
        showButton(selected, e.clientX, e.clientY);
    });
});

document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") {
        if(popupElement) {
            popupElement.remove();
            popupElement = null;
        }
        if(buttonElement) {
            buttonElement.remove();
            buttonElement = null;
        }
    }
})

chrome.runtime.onMessage.addListener((msg) => {
    if(msg.type !== "SHORTCUT")
        return;
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if(!text || !sel.rangeCount)
        return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    chrome.storage.sync.get(["enabled", "theme", "translate", "furigana", "showExamples"], (data) => {
        if(data.enabled == false)
            return;
        if(!/[\u3000-\u9fff\uff00-\uffef]/.test(text))
            return;
        currentTheme = data.theme || "auto";
        currentTranslate = data.translate === true;
        currentFurigana = data.furigana !== false;
        currentExamples = data.showExamples !== false;
        if(buttonElement) {
            buttonElement.remove();
            buttonElement = null;
        }
        if(popupElement) {
            popupElement.remove();
            popupElement = null;
        }
        analyze(text, rect.left, rect.bottom);
    })
})

function createPopup(x, y) {
    const el = document.createElement("div");
    el.id = "jp-breakdown-popup";
    el.dataset.theme = currentTheme;
    const left = Math.max(8, Math.min(x, window.innerWidth - 340));
    const spaceBelow = window.innerHeight - y;
    const top = spaceBelow < 440 ? y - 440 : y + 16;

    el.style.left = `${left + window.scrollX}px`;
    el.style.top = `${Math.max(8, top) + window.scrollY}px`;
    document.body.appendChild(el);
    popupElement = el;
    return el;
}

function showButton(text, x, y) {
    if(buttonElement) {
        buttonElement.remove();
        buttonElement = null;
    }
    const btn = document.createElement("button");
    btn.id = "jp-breakdown-btn";
    btn.dataset.theme = currentTheme;
    btn.textContent = "分解";
    btn.style.left = `${x + window.scrollX + 8}px`;
    btn.style.top = `${y + window.scrollY + 8}px`;
    btn.addEventListener("mousedown", ev => ev.preventDefault());
    btn.addEventListener("click", () => {
        if(buttonElement) {
            buttonElement.remove();
            buttonElement = null;
        }
        analyze(text, x, y);
    });
    document.body.appendChild(btn);
    buttonElement = btn;
}

function showLoading(x, y) {
    const el = createPopup(x, y);
    el.innerHTML = `<div class="jp-loading">Analyzing...</div>`;
}

function showError(msg, x, y) {
    const el = createPopup(x, y);
    el.innerHTML = `<div class="jp-error">${esc(msg)}</div>`;
}

function showResult(data, x, y) {
    const el = createPopup(x, y);
    
    const words = data.words.map((w, i) => {
        const detailsHtml = (w.details || []).map(d => `
            <div class="jp-entry">
                <div class="jp-spellings">${esc(d.spellings.join("、"))}</div>
                <ol>${d.senses.map(s => `<li><span class="jp-sense-pos">${esc(s.pos)}</span> ${esc(s.gloss)}</li>`).join("")}</ol>
            </div>
        `).join("");

        const exHtml = currentExamples ? (w.examples || []).map(([jp, en]) => `<li><div class="jp-ex-jp">${esc(jp)}</div><div class="jp-ex-en">${esc(en)}</div></li>`).join("") : "";
        
        return `
            <div class="jp-word">
                <div class="jp-word-top">
                    <span class="jp-surface">${esc(w.word)}</span>
                    <span class="jp-reading">${w.reading ? `(${esc(w.reading)})` : ""}</span>
                    <span class="jp-pos">${esc(w.part_of_speech)}</span>
                    <button class="jp-star" data-i="${i}">☆</button>
                    <button class="jp-speak" data-i="${i}">🔊</button>
                </div>
                <div class="jp-meaning">${esc(w.meaning)}</div>
                <div class="jp-role">${esc(w.role)}</div>
                <div class="jp-details">${detailsHtml}${exHtml ? `<div class="jp-ex-title">examples</div><ul class="jp-examples">${exHtml}</ul>` : ""}</div>
            </div>
        `;
    }).join("");

    el.innerHTML = `
        <div class="jp-header">
            <span class="jp-original">${esc(data.original)}</span>
            <button class="jp-close" id="jp-close-btn">✕</button>
        </div>
        <div class="jp-kanji">${(data.kanjiParts || []).map(p => p.ruby && currentFurigana ? `<ruby>${esc(p.base)}<rt>${esc(p.ruby)}</rt></ruby>` : esc(p.base)).join("")}</div>
        <div class="jp-translation">${esc(data.overall_meaning)}</div>
        <div class="jp-divider"></div>
        <div class="jp-words">${words}</div>
    `;

    el.querySelectorAll(".jp-star").forEach(btn => {
        btn.addEventListener("click", () => saveWord(data.words[btn.dataset.i], btn));
    });

    el.querySelectorAll(".jp-speak").forEach(btn => {
        btn.addEventListener("click", () => {
            const w = data.words[btn.dataset.i];
            const say = w.part_of_speech === "助詞" ? ({"は": "わ", "へ": "え"}[w.word] || w.word) : w.word;
            const u = new SpeechSynthesisUtterance(say);
            u.lang = "ja-JP";
            speechSynthesis.cancel();
            speechSynthesis.speak(u);
        });
    });

    el.querySelectorAll(".jp-word-top").forEach(row => {
        row.addEventListener("click", e => {
            if(e.target.closest(".jp-star, .jp-speak"))
                return;
            row.parentElement.classList.toggle("open");
        })
    });

    chrome.storage.local.get(["vocab"], (data2) => {
        const saved = new Set((data2.vocab || []).map(v => v.dictionary_form))
        el.querySelectorAll(".jp-star").forEach(btn => {
            const word = data.words[btn.dataset.i];
            if(saved.has(word.dictionary_form))
                btn.textContent = "★";
        });
    });

    document.getElementById("jp-close-btn").addEventListener("click", () => {
        el.remove();
        popupElement = null;
    });
}

function analyze(text, x, y) {
    showLoading(x, y);

    chrome.runtime.sendMessage(
        { type: "ANALYZE_TEXT", text: text },
        (response) => {
            if (popupElement) {
                popupElement.remove();
                popupElement = null;
            }
            if (response.error) {
                showError(response.error, x, y);
            } else {
                showResult(response.result, x, y);
                if(currentTranslate)
                    requestTranslation(text);
            }
        }
    );
}

function saveWord(word, btn) {
    chrome.storage.local.get(["vocab"], (data) => {
        const vocab = data.vocab || [];
        if(vocab.some(v => v.dictionary_form === word.dictionary_form)) {
            btn.textContent = "★";
            return;
        }
        vocab.push({word: word.word, reading: word.base_reading || word.reading, dictionary_form: word.dictionary_form, meaning: word.meaning});
        chrome.storage.local.set({vocab});
        btn.textContent = "★";
    });
}

function esc(s) {
    return String(s ?? "").replace(/[&<>'"]/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function requestTranslation(text) {
    const box = popupElement?.querySelector(".jp-translation");
    if(!box)
        return;
    box.textContent = "translating...";
    chrome.runtime.sendMessage({type: "TRANSLATE", text}, (res) => {
        if(!box.isConnected)
            return;
        box.textContent = res?.translation || "";
    });
}