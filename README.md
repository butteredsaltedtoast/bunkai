# Bunkai (分解)

Bunkai is a browser extension that breaks down Japanese sentences into a word-by-word translation, giving you both the overall meaning of the phrase/sentence and the meaning of each word in context using Google Gemini.

## Features

- Highlight any Japanese text on any webpage to instantly analyze it
- See the overall meaning of the sentence in natural English
- Get a breakdown of each word — reading, part of speech, meaning, and its specific role in the sentence
- Clean popup UI that dismisses when you click away

## Installation

1. Clone this repo
2. Go to `chrome://extensions` in Chrome
3. Enable **Developer Mode** (top right)
4. Click **Load unpacked** and select the cloned folder
5. Click the Bunkai extension icon and paste in your [Gemini API key](https://aistudio.google.com)

## Usage

Just highlight any Japanese text on any webpage. A popup will appear with the full breakdown.

## Stack

- JavaScript
- Chrome Extensions API (Manifest V3)
- Google Gemini API

## License

MIT