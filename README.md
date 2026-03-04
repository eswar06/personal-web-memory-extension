# Chrome Personal Memory Extension

A Chrome Extension (Manifest V3) built with React + TypeScript that tracks browsing time and captures user highlights using the Chrome Extensions API.

## Overview

This project demonstrates:

- Manifest V3 architecture
- Background service workers
- Content scripts
- chrome.storage.local usage
- React-based popup UI
- Type-safe state management

## Features

- Track time spent per page
- Save selected text via context menu
- Persistent local storage (no backend)
- Search through saved entries
- Toggle tracking on/off
- Clear stored memory

## Tech Stack

- React
- TypeScript
- Vite
- Chrome Extensions API (Manifest V3)
- chrome.storage.local

## Architecture

- background.ts → Handles tab events + time tracking
- content.ts → Captures selected text
- popup/ → React UI
- storage.ts → Storage abstraction layer

## Installation (Development)

1. Clone repository
2. Install dependencies:
   npm install
3. Build:
   npm run build
4. Open Chrome → chrome://extensions
5. Enable Developer Mode
6. Load unpacked → select dist/

## Key Learnings

- Managing state between popup, background, and content scripts
- Handling Chrome lifecycle events
- Preventing popup resize collapse
- Structuring scalable extension architecture

## Future Improvements

- IndexedDB for larger data
- Smarter highlight anchoring
- Unit tests for storage layer
