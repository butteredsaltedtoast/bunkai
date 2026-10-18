import {pipeline, env} from "./lib/transformers/transformers.min.js";

env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL("lib/transformers/");
env.backends.onnx.wasm.numThreads = 1;

let translator = null;

window.translateText = async (text) => {
    if(!translator)
        translator = await pipeline("translation", "Xenova/opus-mt-ja-en");
    const out = await translator(text);
    return out[0].translation_text;
};