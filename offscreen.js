kuromoji.builder({dicPath: "lib/dict"}).build(async (err, t) => {
    if(err)
    {
        console.error(err);
        return;
    }
    console.log("ready!");
    console.log(merge(t.tokenize("食べられなかった")));
    await loadDict();
    for(const c of merge(t.tokenize("食べられなかった"))) {
        console.log(c);
        console.log(lookup(c.base_form, c.pos, c.stemReading));
    }
})