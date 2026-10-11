let popupElement = null;
let buttonElement = null;
let currentTheme = "auto";

document.addEventListener("mouseup", (e) => {
    if(buttonElement && buttonElement.contains(e.target))
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
    chrome.storage.sync.get(["enabled", "theme"], (data) => {
        if(data.enabled === false)
            return;
        currentTheme = data.theme || "auto";
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
    chrome.storage.sync.get(["enabled", "theme"], (data) => {
        if(data.enabled == false)
            return;
        if(!/[\u3000-\u9fff\uff00-\uffef]/.test(text))
            return;
        currentTheme = data.theme || "auto";
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

    const words = data.words.map(w => `
        <div class="jp-word">
            <div class="jp-word-top">
                <span class="jp-surface">${esc(w.word)}</span>
                <span class="jp-reading">(${esc(w.reading)})</span>
                <span class = "jp-pos">${esc(w.part_of_speech)}</span>
            </div>
            <div class="jp-meaning">${esc(w.meaning)}</div>
            <div class="jp-role">${esc(w.role)}</div>
        </div>
    `).join("");
    
    el.innerHTML = `
        <div class="jp-header">
            <span class="jp-original">${esc(data.original)}</span>
            <button class="jp-close" id="jp-close-btn">✕</button>
        </div>
        <div class="jp-translation">${esc(data.overall_meaning)}</div>
        <div class="jp-divider"></div>
        <div class="jp-words">${words}</div>
    `;

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
            }
        }
    );
}

function esc(s) {
    return String(s ?? "").replace(/[&<>'"]/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}