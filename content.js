let popupElement = null;
let buttonElement = null;

function showButton(text, x, y) {
    if(buttonElement) {
        buttonElement.remove();
        buttonElement = null;
    }
    const btn = document.createElement("button");
    btn.id = "jp-breakdown-btn";
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
    chrome.storage.sync.get(["enabled"], (data) => {
        if(data.enabled === false)
            return;
        showButton(selected, e.clientX, e.clientY);
    })
});

function createPopup(x, y) {
    const el = document.createElement("div");
    el.id = "jp-breakdown-popup";
    el.style.left = `${Math.min(x, window.innerWidth - 340)}px`;
    el.style.top = `${y + window.scrollY + 16}px`;
    document.body.appendChild(el);
    popupElement = el;
    return el;
}

function showLoading(x, y) {
    const el = createPopup(x, y);
    el.innerHTML = `<div class="jp-loading">Analyzing...</div>`;
}

function showError(msg, x, y) {
    const el = createPopup(x, y);
    el.innerHTML = `<div class="jp-error">${msg}</div>`;
}

function showResult(data, x, y) {
    const el = createPopup(x, y);

    const words = data.words.map(w => `
        <div class="jp-word">
            <div class="jp-word-top">
                <span class="jp-surface">${w.word}</span>
                <span class="jp-reading">(${w.reading})</span>
                <span class = "jp-pos">${w.part_of_speech}</span>
            </div>
            <div class="jp-meaning">${w.meaning}</div>
            <div class="jp-role">${w.role}</div>
        </div>
    `).join("");
    
    el.innerHTML = `
        <div class="jp-header">
            <span class="jp-original">${data.original}</span>
            <button class="jp-close" id="jp-close-btn">✕</button>
        </div>
        <div class="jp-translation">${data.overall_meaning}</div>
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