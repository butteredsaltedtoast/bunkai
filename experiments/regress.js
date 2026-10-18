const fs = require("fs");
const vm = require("vm");
const kuromoji = require("kuromoji");

const ctx = {dict: require("./dict"), console};
vm.createContext(ctx);
for (const f of ["deinflect.js", "segment.js", "merge.js", "lookup.js", "roles.js", "posnames.js", "ngram.js", "kanjify.js", "analyze.js", "numbers.js"])
    vm.runInContext(fs.readFileSync("../" + f, "utf8"), ctx);

let pass = 0, fail = 0;
function check(name, got, want) {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    ok ? pass++ : fail++;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
    if(!ok)
        console.log(`       want:   ${JSON.stringify(want)}\n     got:  ${JSON.stringify(got)}`);
}

function has(name, got, sub) {
    const ok = String(got).includes(sub);
    ok ? pass++ : fail ++;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
    if(!ok)
        console.log(`       want to include: ${sub}\n       got: ${got}`);
}

kuromoji.builder({dicPath: "node_modules/kuromoji/dict"}).build((err, t) => {
    if(err)
        throw err;
    ctx.setNgram(JSON.parse(fs.readFileSync("../data/ngram.json", "utf8")));
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
    check("nihongo-suki-h", kana("にほんごがすきです"), ["にほんご", "が", "すき", "です"]);
    check("gakusei-h", kana("わたしはがくせいです"), ["わたし", "は", "がくせい", "です"]);
    check("kouen-h", kana("ともだちとこうえんへいきました"), ["ともだち", "と", "こうえん", "へ", "いきました"]);
    check("mizu-h", kana("まいにちみずをのみます"), ["まいにち", "みず", "を", "のみます"]);
    check("yasumi-h", kana("あしたはやすみです"), ["あした", "は", "やすみ", "です"]);
    check("omoshiroi-h", kana("このほんはおもしろかった"), ["この", "ほん", "は", "おもしろかった"]);
    check("inu-h", kana("いぬがすきです"), ["いぬ", "が", "すき", "です"]);
    check("tabemono-h", kana("たべものがおいしくない"), ["たべもの", "が", "おいしくない"]);
    check("haha-h", kana("ははとはなします"), ["はは", "と", "はなします"]);
    check("shitade-h", kana("ねこがいすのしたでねています"), ["ねこ", "が", "いす", "の", "した", "で", "ねています"]);
    check("hiite-h", kana("かぜをひいてがっこうをやすみました"), ["かぜ", "を", "ひいて", "がっこう", "を", "やすみました"]);
    
    check("yesterday-k", kanji("昨日食べられなかった"), ["昨日", "食べられなかった"]);
    check("study-k", kanji("勉強しなければならない"), ["勉強しなければならない"]);
    check("expensive-k", kanji("高くなかった"), ["高くなかった"]);
    check("eating-k", kanji("食べること"), ["食べる", "こと"]);
    check("raining-k", kanji("雨が降っているのに出かけた"), ["雨", "が", "降っている", "の", "に", "出かけた"]);
    check("hon-k", kanji("本を読んでいます"), ["本", "を", "読んでいます"]);
    check("gakkou-k", kanji("学校に行きました"), ["学校", "に", "行きました"]);
    check("eiga-k", kanji("友達と映画を見た"), ["友達", "と", "映画", "を", "見た"]);
    check("hanasu-k", kanji("日本語が話せます"), ["日本語", "が", "話せます"]);

    check("iku/ikiru-d", ctx.deinflect("いきます").sort(), ["いきる", "いく"].sort());
    check("furu-d", ctx.deinflect("ふっています"), ["ふる"]);
    check("taberu-d", ctx.deinflect("たべました"), ["たべる"]);
    check("tanoshii-d", ctx.deinflect("たのしかった"), ["たのしい"]);
    check("no-shiru-d", ctx.deinflect("します").includes("しる"), false);

    has("nomu-d", ctx.deinflect("のみます"), "のむ");
    has("oishii-d", ctx.deinflect("おいしくない"), "おいしい");

    check("yobu-d", ctx.deinflect("よんでいます").sort(), ["よぶ", "よむ"].sort());

    check("unknown", ctx.lookup("ぬぬぬぬぬぬ", "", "ぬぬぬぬぬぬ"), "???");
    check("no-zither", ctx.lookup("こと", "名詞", "コト").includes("zither"), false);

    has("kyou", ctx.lookup("きょう", "", "きょう"), "today");
    has("ame", ctx.lookup("あめ", "", "あめ"), "rain");
    has("kinou", ctx.lookup("きのう", "", "きのう"), "yesterday");
    has("neko", ctx.lookup("ねこ", "", "ねこ"), "cat");
    has("toshokan", ctx.lookup("としょかん", "", "としょかん"), "library");

    has("ga-subj", ctx.lookup("が", "助詞", "ガ", "格助詞"), "subject");
    has("ga-but", ctx.lookup("が", "助詞", "ガ", "接続助詞"), "but");
    has("to-with", ctx.lookup("と", "助詞", "ト", "格助詞"), "with");

    has("role-ga-but", ctx.roleFor({pos: "助詞", surface: "が", pos_detail_1: "接続助詞"}), "but");
    has("role-ga-subj", ctx.roleFor({pos: "助詞", surface: "が", pos_detail_1: "格助詞"}), "subject");
    check("role-noun", ctx.roleFor({pos: "名詞", surface: "猫"}), "");

    has("wa", ctx.lookup("は", "助詞", "ハ", "係助詞"), "topic");
    has("wo", ctx.lookup("を", "助詞", "ヲ", "格助詞"), "object");
    has("no", ctx.lookup("の", "助詞", "ノ", "連体化"), "possessive");

    has("koto", ctx.lookup("こと", "名詞", "コト"), "thing");
    has("furu", ctx.lookup("降る", "動詞", "フッ"), "fall");
    has("taberu", ctx.lookup("食べる", "動詞", "タベ"), "eat");
    has("benkyou", ctx.lookup("勉強する", "動詞", "ベンキョウ"), "study");
    
    has("takai", ctx.lookup("高い", "形容詞", "タカク"), "expensive");

    has("iku", ctx.lookup("いく", "動詞", "いく"), "go");
    has("ikiru", ctx.lookup("いきる", "動詞", "いきる"), "live");

    has("miru", ctx.lookup("みる", "動詞", "みる"), "see");

    check("beam-rain", ctx.beam(t, "きょうはあさからあめがふっています").text, "今日は朝から雨が降っています");
    check("beam-cats", ctx.beam(t, "わたしはねこがすきです").text, "私は猫が好きです");
    check("beam-park", ctx.beam(t, "ともだちとこうえんへいきました").text, "友達と公園へ行きました");
    check("beam-mom", ctx.beam(t, "ははとはなします").text, "母と話します");
    check("beam-dad", ctx.beam(t, "ちちとやきゅうをします").text, "父と野球をします");
    check("beam-study", ctx.beam(t, "わたしはにほんごをべんきょうしています").text, "私は日本語を勉強しています");

    has("options-asa", JSON.stringify(ctx.options("あさ")), "朝");
    check("options-particle", ctx.options("は")[0].map(c => c.text), ["は"]);

    const rain = ctx.analyzeWith(t, "きょうはあさからあめがふっています");
    has("analyze-kanji", rain.kanji, "今日は朝から雨が降っています");
    has("analyze-asa-morning", rain.words[2].meaning, "morning");
    check("analyze-no-cannabis", rain.words[2].meaning.includes("cannabis"), false);
    has("analyze-furu-fall", rain.words[6].meaning, "fall");
    check("analyze-dict-form", rain.words[2].dictionary_form, "朝");
    check("analyze-no-kanji-view", ctx.analyzeWith(t, "犬が好きです").kanji, "");
    has("analyze-role", ctx.analyzeWith(t, "いぬがすきです").words[1].role, "subject");

    has("furigana-kyou", JSON.stringify(rain.kanjiParts), '"base":"今日","ruby":"きょう"');
    has("furigana-furu", JSON.stringify(rain.kanjiParts), '"base":"降","ruby":"ふ"');
    check("furigana-kanji-string", rain.kanji, "今日は朝から雨が降っています");

    check("num-mixed", ctx.parseJaNumber("14万6千"), 146000);
    check("num-kanji", ctx.parseJaNumber("三百五十"), 350);
    check("num-plain", ctx.parseJaNumber("2020"), 2020);
    check("num-fullwidth", ctx.parseJaNumber("１２"), 12);
    check("num-kanji-digits", ctx.parseJaNumber("二〇二〇"), 2020);
    check("num-junk", Number.isNaN(ctx.parseJaNumber("猫")), true);
    has("num-glued", kanji("14万6千台"), "14万6千");
    has("analyze-number", ctx.analyzeWith(t, "14万6千台").words[0].meaning, "146,000");

    console.log(`\n${pass} passed, ${fail} failed`);
})