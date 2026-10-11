const ROLES = {
    // case particles: what role the word before it plays
    "は": "topic: what the sentence is about (contrast too)",
    "が": "subject: who/what does it, or the thing being liked/wanted",
    "を": "object: what the action is done to, or the path moved through",
    "に": "target: time, destination, location of existence, or who receives",
    "へ": "direction: toward somewhere",
    "で": "where the action happens, or the means/tool/reason",
    "と": "and (complete list) / with someone / quoting",
    "の": "connects nouns like 's, or turns a phrase into a noun",
    "から": "from (start point) / because",
    "まで": "until / up to / as far as",
    "より": "than (comparison) / from (formal)",
    "や": "and (incomplete list, \"things like\")",
    // focus particles: adjust emphasis
    "も": "also / too / even",
    "だけ": "only / just",
    "しか": "nothing but (always followed by a negative)",
    "ばかり": "nothing but / just did",
    "ほど": "to the extent of / about",
    "くらい": "about / approximately / at least",
    "ぐらい": "about / approximately / at least",
    "ずつ": "each / at a time",
    "でも": "even / or something",
    "など": "and so on / things like",
    "とか": "things like (casual list)",
    "って": "casual quote / topic (\"speaking of\")",
    // conjunctive particles: connect clauses
    "けど": "but / although (casual)",
    "けれど": "but / although",
    "けれども": "but / although (polite)",
    "のに": "even though (with surprise or frustration)",
    "ので": "because / so (softer, more objective)",
    "し": "and also (listing reasons)",
    "ながら": "while doing",
    // sentence-ending particles: tone
    "か": "question marker",
    "ね": "seeking agreement, \"right?\"",
    "よ": "emphasis / telling them something new",
    "よね": "\"right?\" with confidence",
    "な": "don't (after a verb), or a casual \"huh\" to yourself",
    "わ": "soft emphasis",
    "ぞ": "strong emphasis (rough)",
    "ぜ": "strong emphasis (rough)",
    "さ": "casual emphasis",
};

function roleFor(tok) {
    if(tok.pos !== "助詞")
        return "";
    if(tok.surface === "が" && tok.pos_detail_1 === "接続助詞")
        return "but (joining two clauses)";
    if(tok.surface === "の" && tok.pos_detail_1 === "終助詞")
        return "softened question or explanation (end of sentence)";
    return ROLES[tok.surface] || "";
}