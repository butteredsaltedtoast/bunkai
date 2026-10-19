# Bunkai (分解)

Bunkai is a Chrome extension that breaks Japanese text down word by word. Highlight something, click the 分解 button, and you get each word's reading, part of speech, and meaning (perhaps more).

For the most part, Bunkai runs entirely on your computer! The default configuration does not use any form of AI, and runs fully locally.

If you would like a rough translation along with the word-by-word breakdown, there is an option to enable a local small translation model to translate the sentence, but there is a required one-time download from Hugging Face the first time you turn it on.

## Features

- [Try it in your browser, no installation needed!](https://butteredsaltedtoast.github.io/bunkai/site/)
- Highlight Japanese, click 分解 (or press **Alt+B**), get a word-by-word breakdown
- **Right click** any highlighted text and choose Bunkai from the context menu if you prefer
- Click any word to expand every meaning, other spellings, and grammar info (godan verb, い-adjective, others)
- **Example sentences** appear when expanding a word. It shows real sentences that use it from Tatoeba.
- Hiragana-only sentences show their kanji version, with **furigana** above each kanji
- Optional offline sentence translation (off by default, downloads ~80mb first time ONLY)
- Speaker icon reads a word out loud
- Star icon saves a word to your vocab list (click the extension icon to use it)
- Explains what particles do in the sentence
- **Flashcards** let you review your starred words as flashcards right in the extension menu!
- **Export CSV** gives you a file to import into something like Anki
- Numbers like 14万6千 show up as 146,000 with pronunciation
- Light/Dark/Auto theme
- Esc to close

## How it works

- **Kanji text** gets split into words by [kuromoji.js](https://github.com/takuyaa/kuromoji.js), then conjugations get re-attached.
- **Hiragana-only text** (the kind beginners actually read :O) goes through my own segmenter instead, since kuromoji isn't really good at it. It's a dynamic programming word-break that prefers common words combined with a deinflector.
- Every word gets looked up in [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html), ranked by how common it is. If a word is *really* ambiguous, it just shows the top options.
- **Particles** get a short explanation of what they're doing in the sentence (like は marking the topic, を marking the object, etc.). For ones that can do two different things like が, it uses grammar tags to pick the right one.
- **Picking kanji** for hiragana: the segmenter gives its 3 best ways to split the sentence, every word's possible kanji spellings get scored with a trigram model (word-triple counts from ~249k sentences in [Tatoeba](https://tatoeba.org)), and beam search keeps the 3 most natural versions as it builds each one. Whichever finished sentence sounds the realest wins.
- **Example sentences** come from the same Tatoeba data, paired with their English translations.

## Install

1. Clone this repo
2. Go to `chrome://extensions`
3. Turn on **Developer mode**
4. Click **Load unpacked** and pick the folder

## Known issues

- The small translation model gives a rough translation (it's small) and it works best on short, simple sentences
- Words will sometimes show the wrong meaning
- Hiragana-only text can still split wrong sometimes, even WITH three tries.
## Repo layout

- Root: the extension
- `/site/`: the browser demo
- `experiments/`: Node scratch scripts I used to build and test stuff along with `build-dict.js` which generates `data/jmdict.json`
- If you want to rebuild the dictionary yourself, here's [jmdict-simplified](https://github.com/scriptin/jmdict-simplified/releases) and `JMdict_e.gz` from [EDRDG](http://ftp.edrdg.org/pub/Nihongo/). Unzip both into `experiments/data/` then run `node build-dict.js` from inside `experiments/`.
- `experiments/regress.js`: regression tests, run `npm install` then `node regress.js` inside `experiments/` to check nothing broke.
- `experiments/build-ngram.js` builds `data/ngram.json` from Tatoeba
- `experiments/build-examples.js` builds `data/examples.json` from Tatoeba's Japanese indices and English sentences
- `experiments/sets.js` has kanji-conversion test sets, including "fresh" ones that aren't in the training data.
- `experiments/beam.mjs` scores the real extension code on those sets
- `experiments/lm.mjs`, `pipeline.mjs` were earlier experiments with a 500mb language model and the first translation tests, they're kept for history

## Credits

- [kuromoji.js](https://github.com/takuyaa/kuromoji.js) (Apache 2.0)
- [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) by the Electronic Dictionary Research and Development Group (CC BY-SA 4.0)
- [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) for the JSON version
- [Tatoeba](https://tatoeba.org) sentences (CC BY 2.0 FR), used to build the n-gram model and for the example sentences
- [transformers.js](https://github.com/huggingface/transformers.js) (Apache 2.0)
- [opus-mt-ja-en](https://huggingface.co/Helsinki-NLP/opus-mt-ja-en) translation model by Helsinki-NLP (CC BY 4.0)

## License

Code is MIT. Dictionary data follows JMdict's CC BY-SA 4.0 license.