# Personal Web Memory – Chrome Extension

A privacy-first Chrome extension that remembers:
- Pages you spend time on
- Text you intentionally highlight
- What mattered to you

## Features

- ⏱ Passive time tracking
- 🧠 Highlight capture (right-click → Save to Memory)
- 🔍 Search across titles, URLs, and highlights
- 🎯 Click highlight → Scroll to exact text
- 🔒 Local-only storage (nothing leaves the browser)
- 🟢 Tracking toggle with user control

## Why I Built This

I often read something valuable but couldn’t find it later.
Bookmarks weren’t enough.
History wasn’t meaningful.

This extension captures *attention + intention*.

## Tech Stack

- React (Popup UI)
- TypeScript
- Chrome Extensions (Manifest V3)
- chrome.storage.local

## How to Run

1. Clone the repo
2. Run `npm install`
3. Run `npm run build`
4. Go to `chrome://extensions`
5. Enable Developer Mode
6. Load unpacked → select `dist`

## Roadmap

- Smarter highlight anchoring
- Keyboard shortcuts
- Optional local embeddings for semantic recall