# Bunkai (分解)

Bunkai is a Chrome extension made primarily for beginners that breaks down Japanese sentences that you highlight into word-by-word translations!

You can [try it](https://butteredsaltedtoast.github.io/bunkai/site/) out in your browser here before you decide if you want it.

so...

## what does this thing do?!

Say you're reading something in Japanese, but you're not fluent or even just starting out, and you come across a sentence/word/phrase/anything that you've either never seen before or forgotten. Whatever shall you do?! (hint hint use the extension)

With Bunkai, you can highlight the text and press a button OR Alt+B OR use the Bunkai option when you right click your selection to get the following:
- Each word translated with multiple possible definitions (ordered by frequency of course)
- Reading and part of speech for each word
- What particles do in the sentence
- Number readings
- Hiragana-only text gets converted to kanji so you can see the kanji version of words that are usually written as kanji
- Furigana
- An option to have any word read aloud
- An option to "star" words to save for later review
- Ability to click a word to see all meanings, other spellings, grammar info
- An optional full selection translation off by default (more on that later)
- Example sentences so you can see each word in a different context!

But that's not all! Bunkai's also got some features in that settings menu you get by clicking the extension icon.
What features, you ask?

Well, you can:
- enable/disable the extension
- change between light/dark/system theme
- enable/disable sentence translation, furigana, and example sentences
- manage starred words
- export starred words as a csv! mainly for importing into anki but you can do whatever with it
- review starred words with a little flashcard menu

## so how do i install it?

I'm glad you asked! Here's a somewhat foolproof guide unless you're a really, really foolish fool.
- [Download the LATEST zip from releases](https://github.com/butteredsaltedtoast/bunkai/releases) and unzip it.
- Go to chrome://extensions and turn on developer mode in the top right.
- Click Load Unpacked and select the folder you unzipped Bunkai in.

Then you're done! Configure it however which way you want it in the settings, then you can start using it.

## ok, but how does it do all that though??

Let's go through the whole process that the extension currently uses.

1. You highlight text, obviously. Bunkai checks if it's Japanese so it doesn't waste your precious, precious time.
2. Now Bunkai checks whether there's kanji. If there is, it uses kuromoji to split the sentence into words. Since kuromoji cuts conjugated words into itty bitty pieces, Bunkai has to put them back together. If there isn't, my own segmenter has to split it instead because kuromoji kinda sucks at hiragana. It basically just picks the split made of the most common words, then puts words back in dictionary form to look them up. Unlike kuromoji, it outputs three splits instead of one so the kanji picker can choose the one that's the most "right" later.
3. Now, it guesses the kanji for given hiragana. It uses a trigram model I made. Ahead of time, a script goes through around 249 thousand Japanese sentences (from Tatoeba) and counts every run of three words in a row (that's where the tri comes from).  Then, when the extension runs into a hiragana word with more than one possible kanji, it basically says "i don't know what the HECK this is, so i'm cheating and looking at other sentences" and then makes a guess based on what two words showed up before the given hiragana word. I used beam search so it doesn't have to try every possible combination which would take so long humanity would figure out injecting knowledge into your brain The Matrix-style before your sentence gets outputted. What's beam search? I didn't know until I made this extension. Beam search is just going word by word, left to right, making incomplete sentences as it goes, then keeping the best few of those, then adding the next word to those few.
4. Every word is looked up in JMdict to get the translation. As mentioned earlier, meanings are ranked by frequency.
5. It uses grammar tags on particles to tell what they do. This works even for particles with multiple meanings like が, which is convenient because if I had to write more stuff for that, it wouldn't end well.
6. After all that, we can get to the extra stuff, like the example sentences from Tatoeba and number readings using a parser I wrote.

Now. I DID say I would cover this in the how it works section.
The optional sentence translation DOES use a ~80mb small neural translation model.
I know, I know. But before you throw tomatoes and various vegetables at me, consider this.
It's not like, for example, ChatGPT, which is an LLM. ChatGPT can do your math homework, build you a soulless website, and take your job.
opus-mt. can literally. only do. ONE. THING.
Translate one specific language into another specific language. Nothing else. No chat, no prompt, no nothing. All it does is take Japanese input and translate it into English output. It doesn't even use internet! After you download it, it runs fully, completely, totally on your computer and never sends anything at all to anyone ever!

However... it IS still a neural network... trained on DATA... so it DOES count as AI, traditionally speaking...
That's why I've left it off by default so you don't have to download an 80 megabyte model if you don't want to. The extension still works completely fine for learning without it! You can replace the model with bothering your friend who's fluent or something. If you have issues with this kind of AI, though, just know Google Translate is also an AI by the same definition, and it's much bigger.

## ...any problems with it?

Yes, of course there are. It works, but there are some issues that need to be resolved. For instance:
- The translation model is super tiny. So, it might get some long sentences wrong.
- Words still sometimes show the wrong meaning
- Hiragana-only text really hates being split (no spaces and all that), so it might STILL split wrong
- Kanji guessing for hiragana is still pretty rough. Even the trigram model isn't enough sometimes because context can be pretty much anywhere in the sentence. Looking into ways to make it better though!!

Other than actual issues, just some qualms I have with it:
- It's still Chrome only, but I use Firefox, so I can't even use my own extension?! I'm making a Firefox port at some point.
- Not on the Chrome Web Store yet so the install is a little sketchy. I am working on getting it up there though.
- You have to install an 80 megabyte model to get the translations.

## Credits

- [kuromoji.js](https://github.com/takuyaa/kuromoji.js) (Apache 2.0)
- [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) by the Electronic Dictionary Research and Development Group (CC BY-SA 4.0)
- [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) for the JSON version
- [Tatoeba](https://tatoeba.org) sentences (CC BY 2.0 FR), used to build the n-gram model and for the example sentences
- [transformers.js](https://github.com/huggingface/transformers.js) (Apache 2.0)
- [opus-mt-ja-en](https://huggingface.co/Helsinki-NLP/opus-mt-ja-en) translation model by Helsinki-NLP (CC BY 4.0)
- IPADIC dictionary data (bundled with kuromoji.js), copyright the Nara Institute of Science and Technology and ICOT

Thanks for reading the file that says "read me" in big capital letters. Godspeed.