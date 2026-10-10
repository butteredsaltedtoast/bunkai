const data = require('../data/jmdict.json')
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
module.exports = spellingToEntries;