let EX = null;

function setExamples(data) {
    EX = data;
}

async function loadExamples(base = "") {
    const res = await fetch(base + "data/examples.json");
    setExamples(await res.json());
}

function examplesFor(...keys) {
    if(!EX)
        return [];
    for(const k of keys)
        if(k && EX.index[k])
            return EX.index[k].map(i => EX.sentences[i]);
    return [];
}
// for example sentences!