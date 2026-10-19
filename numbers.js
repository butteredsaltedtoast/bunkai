const DIGITS = {"〇": 0, "零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9};
const SMALL = {"十": 10, "百": 100, "千": 1000};
const BIG = {"万": 1e4, "億": 1e8, "兆": 1e12};

function parseJaNumber(s) { // ja-number! anyway, basically just "14万6千" -> 146000, "三百五十" -> 350, "2020" -> 2020 
    s = s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
    let total = 0, section = 0, num = 0;
    for(const c of s) {
        if(c === "," || c === "，")
            continue;
        if(/[0-9]/.test(c))
            num = num * 10 + Number(c);
        else if(c in DIGITS)
            num = num * 10 + DIGITS[c];
        else if(c in SMALL) {
            section += (num || 1) * SMALL[c];
            num = 0;
        }
        else if(c in BIG) {
            total += ((section + num) || 1) * BIG[c];
            section = 0;
            num = 0;
        }
        else
            return NaN;
    }
    return total + section + num;
}

const KANA_DIGITS  = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
function readSection(n) {
    const th = Math.floor(n / 1000) % 10, h = Math.floor(n / 100) % 10, te = Math.floor(n / 10) % 10, o = n % 10;
    let s = "";
    if(th)
        s += th === 1 ? "せん" : th === 3 ? "さんぜん" : th === 8 ? "はっせん" : KANA_DIGITS[th] + "せん";
    if(h)
        s += h === 1 ? "ひゃく" : h === 3 ? "さんびゃく" : h === 6 ? "ろっぴゃく" : h === 8 ? "はっぴゃく" : KANA_DIGITS[h] + "ひゃく";
    if(te)
        s += te === 1 ? "じゅう" : KANA_DIGITS[te] + "じゅう";
    if(o)
        s += KANA_DIGITS[o];
    return s;
}

function numberReading(n) {
    if(!Number.isInteger(n) || n < 0 || n >= 1e16)
        return "";
    if(n === 0)
        return "ぜろ";
    let s = "", rem = n;
    for(const [unit, kana] of [[1e12, "ちょう"], [1e8, "おく"], [1e4, "まん"]]) {
        const q = Math.floor(rem / unit);
        rem %= unit;
        if(q)
            s += q === 1 && unit === 1e12 ? "いっちょう" : readSection(q) + kana;
    }
    return s + readSection(rem);
}