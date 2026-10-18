# Bunkai (分解)

Bunkai is a Chrome extension that breaks Japanese text down word by word. Highlight something, click the 分解 button, and you get each word's reading, part of speech, and meaning.

For the most part, Bunkai runs entirely on your computer! The default configuration does not use any form of AI, and runs fully locally.

If you would like a rough translation along with the word-by-word breakdown, there is an option to enable a local small language model to translate the sentence, but there is a required one-time download from Hugging Face the first time you turn it on.

## Features

- Highlight Japanese, click 分解 (or press **Alt+B**), get a word-by-word breakdown
- Click any word to expand every meaning, other spellings, and grammar info (godan verb, い-adjective, etc.)
- Hiragana-only sentences show their kanji version
- Optional offline sentence translation (off by default, downloads ~80mb first time)
- [Try it in your browser, no installation needed!](https://butteredsaltedtoast.github.io/bunkai/site/)
- Speaker icon reads a word out loud
- Star icon saves a word to your vocab list (click the extension icon to see it) and **Export CSV** gives you a file Anki can import
- Explains what particles do in the sentence
- Light/Dark/Auto theme
- Esc to close

## How it works

- **Kanji text** gets split into words by [kuromoji.js](https://github.com/takuyaa/kuromoji.js), then conjugations get glued back on so that something like 食べられなかった can show up as one word.
- **Hiragana-only text** (the kind beginners actually read :O) goes through my own segmenter instead, since kuromoji is bad at it. It's a dynamic programming word-break that prefers common words, plus a deinflector that turns things like ふっています back into ふる.
- Every word gets looked up in [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html), ranked by how common it is. If a word is genuinely ambiguous (like how きのう could be 昨日 or 機能), it shows the top options.
- **Particles** get a short explanation of what they're doing in the sentence (は marks the topic, を marks the object, etc.). For ones with two jobs, like が meaning "subject" or "but", it uses the tokenizer's grammar tags to pick the right one.
- **Picking kanji** for hiragana scores every word's possible spelling with an n-gram model (word-pair counts from around 249k sentences in [Tatoeba](https://tatoeba.org)), and beam search keeps the 3 most natural versions as it builds the sentence.

## Install

1. Clone this repo
2. Go to `chrome://extensions`
3. Turn on **Developer mode**
4. Click **Load unpacked** and pick the folder

## Known issues

- Small translaton model translation gives a rough translation (it's small), and it works best on short, simple sentences
- Words will sometimes the wrong meaning.

## Repo layout

- Root: the extension itself
- `experiments/`: Node scratch scripts I used to build and test stuff, plus `build-dict.js`, which generates `data/jmdict.json`
- If you want to rebuild the dictionary yourself, here's [jmdict-simplified](https://github.com/scriptin/jmdict-simplified/releases) and `JMdict_e.gz` from [EDRDG](http://ftp.edrdg.org/pub/Nihongo/). Unzip both into `experiments/data/` and run `node build-dict.js` from inside `experiments/`.
- `experiments/regress.js`: regression tests, run `npm install` then `node regress.js` inside `experiments/` to check nothing broke.
- `experiments/build-ngram.js`: builds `data/ngram.json` from Tatoeba
- `experiments/beam.mjs`: scores kanji conversion on test sets, including ones the model has never seen
- `experiments/lm.mjs`, `pipeline.mjs`: earlier experiments with a 500mb language model and the first translation tests, kept for history

## Credits

- [kuromoji.js](https://github.com/takuyaa/kuromoji.js) (Apache 2.0)
- [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) by the Electronic Dictionary Research and Development Group (CC BY-SA 4.0)
- [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) for the JSON version
- [Tatoeba](https://tatoeba.org) sentences (CC BY 2.0 FR), used to build the n-gram model
- [transformers.js](https://github.com/huggingface/transformers.js) (Apache 2.0)
- [opus-mt-ja-en](https://huggingface.co/Helsinki-NLP/opus-mt-ja-en) translation model by Helsinki-NLP (CC BY 4.0)

## License

Code is MIT. Dictionary data follows JMdict's CC BY-SA 4.0 license.