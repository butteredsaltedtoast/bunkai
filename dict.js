let dict = null;

async function loadDict(base = "") {
    const res = await fetch(base + "data/jmdict.json");
    const data = await res.json();
    const spellingToEntries = new Map();
    for(const entry of data) {
        for(const s of [...entry.k, ...entry.r]) {
            if(!spellingToEntries.has(s.t))
                spellingToEntries.set(s.t, []);
            spellingToEntries.get(s.t).push(entry);
        }
    }
    dict = spellingToEntries;
}