import {AutoTokenizer, AutoModelForCausalLM} from "@huggingface/transformers"

const id = "onnx-community/Qwen2.5-0.5B-Instruct";
const tok = await AutoTokenizer.from_pretrained(id);
const model = await AutoModelForCausalLM.from_pretrained(id, {dtype:"q8"});

export async function score(text) {
    const {input_ids, attention_mask} = tok("日本語:" + text);
    const {logits} = await model({input_ids, attention_mask});
    const [, n, V] = logits.dims;
    if(n < 2)
        return 0;
    const data = logits.data;
    const ids = input_ids.data;

    let total = 0;
    for(let k = 0; k < n - 1; k++) {
        const off = k * V;
        let max = -Infinity;
        for(let j = 0; j < V; j++)
            max = Math.max(max, data[off + j]);
        let sum = 0;
        for(let j = 0; j < V; j++)
            sum += Math.exp(data[off + j] - max);
        const next = Number(ids[k + 1]);
        total += data[off + next] - max - Math.log(sum);
    }
    return total;
}

if(import.meta.url === `file://${process.argv[1]}`)
{
    const tests = [
        "今日は朝から雨が降っています",
        "今日は麻から雨が降っています",
        "今日は朝から雨が振っています",
        "友達と公園へ行きました",
        "友達と公園へ生きました",
    ];
    for(const t of tests)
        console.log((await score(t)).toFixed(3), t);
}