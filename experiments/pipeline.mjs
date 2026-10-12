import {createRequire} from "module";
import {pipeline} from "@huggingface/transformers";
const require = createRequire(import.meta.url);
const {kanjify} = require("./kanjify.js");

const sentences = [
    "わたしはにほんごをべんきょうしています",
    "わたしはねこがすきです",
    "わたしのかさはどこですか",
    "まいにちあさごはんをたべます",
    "このしろいぼうしがほしいです",
    "いぬがすきです",
    "ともだちとえいがをみます",
    "あのくつがほしいです",
    "ははとはなします",
    "ちちとやきゅうをします"
];

const translate = await pipeline("translation", "Xenova/opus-mt-ja-en");
for(const s of sentences) {
    const k = kanjify(s);
    const raw = (await translate(s))[0].translation_text;
    const fixed = (await translate(k))[0].translation_text;
    console.log(s);
    console.log("   kanjified:  ", k);
    console.log("   raw:        ", raw);
    console.log("   pipeline:   ", fixed);
}