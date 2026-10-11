# Bunkai (分解)

Bunkai is a Chrome extension that breaks Japanese text down word by word. Highlight something, click the 分解 button, and you get each word's reading, part of speech, and meaning.

You can press Esc to close the popup and Alt+B to analyze highlighted text if you'd rather not click the button.

It runs entirely on your computer. No AI, no API key, no internet needed after install.

Bunkai's look will default to your system theme. To change the theme, click on the extension icon and select your desired theme from the dropdown.

## How it works

- **Kanji text** gets split into words by [kuromoji.js](https://github.com/takuyaa/kuromoji.js), then conjugations get glued back on so that something like 食べられなかった can show up as one word.
- **Hiragana-only text** (the kind beginners actually read :O) goes through my own segmenter instead, since kuromoji is bad at it. It's a dynamic programming word-break that prefers common words, plus a deinflector that turns things like ふっています back into ふる.
- Every word gets looked up in [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html), ranked by how common it is. If a word is genuinely ambiguous (like how きのう could be 昨日 or 機能), it shows the top options.
- **Particles** get a short explanation of what they're doing in the sentence (は marks the topic, を marks the object, etc.). For ones with two jobs, like が meaning "subject" or "but", it uses the tokenizer's grammar tags to pick the right one.

## Install

1. Clone this repo
2. Go to `chrome://extensions`
3. Turn on **Developer mode**
4. Click **Load unpacked** and pick the folder

## Known issues

- No whole-sentence translation, only word by word
- Some words will still pick the wrong meaning...

## Repo layout

- Root: the extension itself
- `experiments/`: Node scratch scripts I used to build and test stuff, plus `build-dict.js`, which generates `data/jmdict.json`
- If you want to rebuild the dictionary yourself, here's [jmdict-simplified](https://github.com/scriptin/jmdict-simplified/releases) and `JMdict_e.gz` from [EDRDG](http://ftp.edrdg.org/pub/Nihongo/). Unzip both into `experiments/data/` and run `node build-dict.js` from inside `experiments/`.
- `experiments/regress.js`: regression tests, run `npm install` then `node regress.js` inside `experiments/` to check nothing broke.

## Credits

- [kuromoji.js](https://github.com/takuyaa/kuromoji.js) (Apache 2.0)
- [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) by the Electronic Dictionary Research and Development Group (CC BY-SA 4.0)
- [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) for the JSON version

## License

Code is MIT. Dictionary data follows JMdict's CC BY-SA 4.0 license.