const GODAN = {
    う: ["い", "わ", "っ"], く: ["き", "か", "い"], ぐ: ["ぎ", "が", "い"],
    す: ["し", "さ", "し"], つ: ["ち", "た", "っ"], ぬ: ["に", "な", "ん"],
    ぶ: ["び", "ば", "ん"], む: ["み", "ま", "ん"], る: ["り", "ら", "っ"],
    する: ["し", "し", "し"], くる: ["き", "こ", "き"]
};
const ENDINGS = [
    ["ます", 0], ["ました", 0], ["ません", 0], ["ませんでした", 0], ["たい", 0], ["ましょう", 0],
    ["ない", 1], ["なければ", 1], ["なかった", 1],
    ["て", 2], ["で", 2], ["た", 2], ["だ", 2],
    ["ても", 2], ["でも", 2],
    ["ている", 2],
    ["ています", 2], ["でいます", 2],
    ["ていました", 2],
];
const ADJ_ENDINGS = ["かった", "くない", "くなかった", "くて", "ければ", "く"];

function deinflect(word) {
    const results = [];
    for(const [ending, type] of ENDINGS) {
        if(!word.endsWith(ending))
            continue;
        const stem = word.slice(0, -ending.length);
        if(!ending.startsWith("で") && !ending.startsWith("だ"))
            results.push({c: stem + "る", kind: "v1"});
        const last = stem.slice(-1);
        const rest = stem.slice(0, -1);
        for(const [dictEnding, stems] of Object.entries(GODAN)) {
            if(stems[type] !== last)
                continue;
            const kind = dictEnding === "する" ? "vs" : dictEnding === "くる" ? "vk" : "v5";
            results.push({c: rest + dictEnding, kind});
        }
    }
    for(const ending of ADJ_ENDINGS) {
        if(!word.endsWith(ending))
            continue;
        results.push({c: word.slice(0, -ending.length) + "い", kind: "adj"});
    }

    const matches = (c, kind) => dict.get(c)?.some(e => e.s.some(s => s.p.some(p =>kind === "adj" ? p.startsWith("adj-i") : p.startsWith(kind))));
    return [...new Set(results.filter(r => matches(r.c, r.kind)).map(r => r.c))];
}