let dict = null;
async function loadDict() {
    const res = await fetch("data/jmdict.json");
    const data = await res.json();
    const spellingToEntries = new Map()
    for(const entry of data) {
        for(const s of [...entry.k, ...entry.r]) {
            const k = s.t;
            if(!spellingToEntries.has(k)) {
                spellingToEntries.set(k, [])
            }
            spellingToEntries.get(k).push(entry)
        }
    }
    dict = spellingToEntries;
}