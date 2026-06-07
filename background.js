chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ANALYZE_TEXT") {
        analyzeText(request.text).then(sendResponse);
        return true;
    }
});

async function analyzeText(text) {
    const { geminiKey } = await chrome.storage.sync.get("geminiKey");

    if (!geminiKey) {
        return { error: "Gemini API key not found. Please set it in the extension options." };
    }

    const prompt = `Analyze this Japanese text: "${text}"
    Return ONLY a JSON object in this exact format, no markdown, no explanation:
    {
    "original": "the original text",
    "overall_meaning": "natural English translation",
    "words": [
        {
        "word": "word as it appears",
        "reading": "hiragana reading",
        "dictionary_form": "dictionary form if conjugated",
        "part_of_speech": "noun/verb/particle/adjective/etc",
        "meaning": "meaning in English",
        "role": "what this word is doing in this specific sentence"
        }
    ]
    }`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );
        const data = await response.json();
        const raw = data.candidates[0].content.parts[0].text;
        const clean = raw.replace(/```json|```/g, "").trim();
        return { result: JSON.parse(clean) };
    } catch (error) {
        return { error: "Failed to analyze text. Please check your API key and try again." };
    }
}