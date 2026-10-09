const data = require('./data/jmdict-eng-3.6.2.json')
const spellingToEntries = new Map()
for(const entry of data.words) {
    for(const s of [...entry.kanji, ...entry.kana]) {
        const k = s.text;
        if(!spellingToEntries.has(k)) {
            spellingToEntries.set(k, [])
        }
        spellingToEntries.get(k).push(entry)
    }
}
module.exports = spellingToEntries;