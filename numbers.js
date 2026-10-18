const DIGITS = {"〇": 0, "零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9};
const SMALL = {"十": 10, "百": 100, "千": 1000};
const BIG = {"万": 1e4, "億": 1e8, "兆": 1e12};

function parseJaNumber(s) { // ja-number! anyway, basically just "14万6千" -> 146000, "三百五十" -> 350, "2020" -> 2020 
    s = s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
    let total = 0, section = 0, num = 0;
    for(const c of s) {
        if(c === "," || c === ", ")
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