const fs = require("fs");
const vm = require("vm");
const ctx = {dict: require("./dict"), console};
vm.createContext(ctx);
for(const f of ["deinflect.js", "segment.js", "merge.js", "lookup.js", "roles.js"]) {
    vm.runInContext(fs.readFileSync("../" + f, "utf-8"), ctx);
}

const CHEAP = vm.runInContext("CHEAP", ctx);
const KEEP_KANA = ["か", "この", "その", "あの", "どの", "これ", "それ", "あれ", "どれ", "ここ", "そこ", "あそこ", "どこ"];
let GAP = 3;

function kanjify(s) {
    const words = ctx.segment(s);
    let out = "";
    for(const w of words) {
        if(CHEAP.includes(w.surface)) {
            out += w.surface;
            continue;
        }
        if(KEEP_KANA.includes(w.surface)) {
            out += w.surface;
            continue;
        }
        if(w.bases[0] === w.surface && ctx.dict.has(w.surface)) {
            const entries = ctx.findEntries(w.surface, "", w.surface);
            if(!entries.length || entries[0].s[0].m?.includes("uk")) {
                out += w.surface;
                continue;
            }
            if(entries[1] && entries[1].f - entries[0].f < GAP) {
                out += w.surface;
                continue;
            }
            const kanji = entries[0]?.k[0]?.t
            out += kanji || w.surface
        }
        else if (w.bases[0] !== w.surface) {
            if(w.bases.length > 1) {
                out += w.surface;
                continue;
            }
            if(w.bases.includes("する")) {
                out += w.surface;
                continue;
            }
            const base = w.bases[0];
            const entries = ctx.findEntries(base, "動詞", base);
            if(entries.length > 1 && entries[1].f - entries[0].f < GAP) {
                out += w.surface;
                continue;
            }
            const kanjiBase = entries[0]?.k[0]?.t;
            if(!kanjiBase || entries[0].s[0].m?.includes("uk")) {
                out += w.surface;
                continue;
            }
            const n = commonSuffix(kanjiBase, base);
            const kanjiStem = kanjiBase.slice(0, kanjiBase.length - n);
            const kanaStem = base.slice(0, base.length - n);
            if(w.surface.startsWith(kanaStem))
                out += kanjiStem + w.surface.slice(kanaStem.length);
            else
                out += w.surface;
        }
        else
            out += w.surface;
    }
    return out;
}

function commonSuffix(a, b) {
    let n=  0;
    while(n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n])
        n++;
    return n;
}

const isVerbish = e => e.s.some(s => s.p.some(p => p.startsWith("v") || p.startsWith("adj-i")));
const common = list => list.filter(e => e.f < 99).sort((a, b) => a.f - b.f).slice(0, 4);
function options(s) {
    return ctx.segment(s).map(w => {
        if(CHEAP.includes(w.surface) || KEEP_KANA.includes(w.surface))
            return [w.surface];
        // the stuff needed for verbs
        if(w.bases[0] !== w.surface) {
            const outs = [w.surface];
            for(const base of w.bases) {
                if(base.endsWith("する")) {
                    const noun = base.slice(0, -2);
                    for(const e of common(ctx.dict.get(noun) || [])) {
                        const kn = e.k[0]?.t;
                        if(kn && w.surface.startsWith(noun))
                            outs.push(kn + w.surface.slice(noun.length));
                    }
                    continue;
                }
                for(const e of common((ctx.dict.get(base) || []).filter(isVerbish))) {
                    if(e.s[0].m?.includes("uk"))
                        continue;
                    const kb = e.k[0]?.t;
                    if(!kb)
                        continue;
                    const n = commonSuffix(kb, base);
                    const ks = base.slice(0, base.length - n);
                    if(w.surface.startsWith(ks))
                        outs.push(kb.slice(0, kb.length - n) + w.surface.slice(ks.length));
                }
            }
            return outs.length > 1 ? [...new Set(outs.slice(1))] : outs;
        }
        // the stuff needed for nouns
        const entries = common(ctx.dict.get(w.surface) || []);
        const kanji = entries.filter(e => !e.s[0].m?.includes("uk")).map(e => e.k[0]?.t).filter(Boolean);
        return kanji.length ? [...new Set(kanji)] : [w.surface];
    });
}

const cases = [
    ["わたしはにほんごをべんきょうしています", "私は日本語を勉強しています"],
    ["わたしはねこがすきです", "私は猫が好きです"],
    ["わたしのかさはどこですか", "私の傘はどこですか"],
    ["まいにちあさごはんをたべます", "毎日朝ごはんを食べます"],
    ["このしろいぼうしがほしいです", "この白い帽子が欲しいです"],
    ["いぬがすきです", "犬が好きです"],
    ["ともだちとえいがをみます", "友達と映画を見ます"],
    ["あのくつがほしいです", "あの靴が欲しいです"],
    ["ははとはなします", "母と話します"],
    ["ちちとやきゅうをします", "父と野球をします"],
    ["きょうはあさからあめがふっています", "今日は朝から雨が降っています"],
    ["ともだちとこうえんへいきました", "友達と公園へ行きました"],
    ["まいにちみずをのみます", "毎日水を飲みます"],
    ["このほんはおもしろかった", "この本は面白かった"],
    ["がっこうでせんせいとはなしました", "学校で先生と話しました"],
    ["でんしゃでかいしゃにいきます", "電車で会社に行きます"],
    ["あしたはやすみです", "明日は休みです"],
    ["へやがひろいです", "部屋が広いです"],
    ["みせでくだものをかいました", "店で果物を買いました"],
    ["よるはテレビをみます", "夜はテレビを見ます"],
];

const fresh = [
    ["あにはぎんこうではたらいています", "兄は銀行で働いています"],
    ["きのうはともだちのいえにとまりました", "昨日は友達の家に泊まりました"],
    ["きょねんのふゆはとてもさむかった", "去年の冬はとても寒かった"],
    ["えきのまえでいもうとをまちました", "駅の前で妹を待ちました"],
    ["あたらしいくるまをかいたいです", "新しい車を買いたいです"],
    ["せんせいにてがみをかきました", "先生に手紙を書きました"],
    ["たなのうえにはこがあります", "棚の上に箱があります"],
    ["こどもたちがこうえんであそんでいます", "子供たちが公園で遊んでいます"],
    ["ドアをしめてもいいですか", "ドアを閉めてもいいですか"],
    ["あねはびょういんではたらいています", "姉は病院で働いています"],
    ["あめがやんだらそとであそびましょう", "雨が止んだら外で遊びましょう"],
    ["ちちはまいあささんぽをします", "父は毎朝散歩をします"],
    ["このみせのラーメンはやすくておいしい", "この店のラーメンは安くておいしい"],
    ["らいしゅうしけんがあります", "来週試験があります"],
    ["おとうとといっしょにうみでおよぎました", "弟と一緒に海で泳ぎました"],
];

if(require.main === module) {
    function score() {
        let pass = 0;
        for(const [input, want] of cases)
            if(kanjify(input) === want)
                pass++;
        return pass;
    }

    GAP = 3;
    console.log(`${score()}/${cases.length}`);
}

module.exports = {kanjify, options, cases, fresh};