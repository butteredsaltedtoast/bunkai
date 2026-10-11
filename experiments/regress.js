const fs = require("fs");
const vm = require("vm");
const kuromoji = require("kuromoji");

const ctx = {dict: require("./dict"), console};
vm.createContext(ctx);
for(const f of ["deinflect.js", "segment.js", "merge.js", "lookup.js", "roles.js"]) {
    vm.runInContext(fs.readFileSync("../" + f, "utf8"), ctx);
}

let pass = 0, fail = 0;
function check(name, got, want) {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    ok ? pass++ : fail++;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
    if(!ok)
        console.log(`       want:   ${JSON.stringify(want)}\n     got:  ${JSON.stringify(got)}`);
}

kuromoji.builder({dicPath: "node_modules/kuromoji/dict"}).build((err, t) => {
    if(err)
        throw err;
    const kana = s => ctx.segment(s).map(w => w.surface);
    const kanji = s => ctx.merge(t.tokenize(s)).map(c => c.surface);

    check("nihongo-h", kana("わたしはにほんごをべんきょうしています"), ["わたし", "は", "にほんご", "を", "べんきょうしています"]);
    check("raining-h", kana("きょうはあさからあめがふっています"), ["きょう", "は", "あさ", "から", "あめ", "が", "ふっています"]);
    check("movie-h", kana("わたしはえいがをみます"), ["わたし", "は", "えいが", "を", "みます"]);
    check("flowers-h", kana("わたしははなをみます"), ["わたし", "は", "はな", "を", "みます"]);
    check("fine-h", kana("わたしはげんきです"), ["わたし", "は", "げんき", "です"]);
    check("library-h", kana("としょかんへいきます"), ["としょかん", "へ", "いきます"]);
    check("yesterday-h", kana("きのうはたのしかったです"), ["きのう", "は", "たのしかった", "です"]);
    check("apple-h", kana("このりんごはおいしくない"), ["この", "りんご", "は", "おいしくない"]);
    check("cats-h", kana("わたしはねこがすきです"), ["わたし", "は", "ねこ", "が", "すき", "です"]);

    check("yesterday-k", kanji("昨日食べられなかった"), ["昨日", "食べられなかった"]);
    check("study-k", kanji("勉強しなければならない"), ["勉強しなければならない"]);
    check("expensive-k", kanji("高くなかった"), ["高くなかった"]);
    check("eating-k", kanji("食べること"), ["食べる", "こと"]);
    check("raining-k", kanji("雨が降っているのに出かけた"), ["雨", "が", "降っている", "の", "に", "出かけた"]);

    check("iku/ikiru-d", ctx.deinflect("いきます").sort(), ["いきる", "いく"].sort());
    check("furu-d", ctx.deinflect("ふっています"), ["ふる"]);
    console.log(`\n${pass} passed, ${fail} failed`);
})