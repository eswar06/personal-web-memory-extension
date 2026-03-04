import { PageMemory } from "../shared/types";

let activeTabId: number | null = null;
let activeUrl: string | null = null;
let activeTitle: string | null = null;
let startTime: number | null = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["trackingEnabled"], (res) => {
    if (typeof res.trackingEnabled === "undefined") {
      chrome.storage.local.set({ trackingEnabled: true });                   // initialize trackingEnabled on install
    }
  });
});


chrome.tabs.onActivated.addListener(({ tabId }) => {
  stopTimer();
  activeTabId = tabId;                                               // update activeTabId on tab switch                            
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "PAGE_VISIBILITY") {
    if (msg.state === "visible" && sender.tab?.id === activeTabId) {
      chrome.storage.local.get(["trackingEnabled"], (res) => {                // event listener for page visibility messages
        if (!res.trackingEnabled) return;
          startTimer(msg.url, msg.title);
        });
    } else {
      stopTimer();
    }
  }
});

function startTimer(url: string, title: string) {
  if (startTime) return; // already running

  activeUrl = url;
  activeTitle = title;
  startTime = Date.now();
}

function stopTimer() {
  if (!startTime || !activeUrl) return;

  const elapsed = Date.now() - startTime;
  saveTime(activeUrl, activeTitle!, elapsed);

  startTime = null;
  activeUrl = null;
  activeTitle = null;
}

function saveTime(url: string, title: string, elapsedMs: number) {
  if (elapsedMs <= 0) return;

  chrome.storage.local.get(
    { pageMemories: {} as Record<string, PageMemory> },
    (res: { pageMemories: Record<string, PageMemory> }) => {
      const memories = res.pageMemories;
      const now = Date.now();

      const existing = memories[url] ?? {
        url,
        title,
        totalTimeMs: 0,
        lastVisited: now,
        highlights: [],
      };

      memories[url] = {
        url,
        title: title || existing.title,
        totalTimeMs: existing.totalTimeMs + elapsedMs,
        lastVisited: now,
        highlights: existing.highlights || [],
      };

      chrome.storage.local.set({ pageMemories: memories });
    }
  );
}

// Context menu for saving highlights

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-highlight",
    title: "Save highlight to Personal Web Memory",
    contexts: ["selection"],
    
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "save-highlight") return;
  if (!info.selectionText || !tab?.id || !tab.url) return;

  chrome.tabs.sendMessage(tab.id, {
    type: "CAPTURE_HIGHLIGHT",
    text: info.selectionText,
    url: tab.url,
  });
});


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "SAVE_HIGHLIGHT") return;

  const { text, url, title } = msg.payload;

  chrome.storage.local.get(["trackingEnabled"], (res) => {
    if (!res.trackingEnabled) return;
  });

  chrome.storage.local.get(
    { pageMemories: {} as Record<string, PageMemory> },
    (res: { pageMemories: Record<string, PageMemory> }) => {
      const memories = res.pageMemories || {};

      const page = memories[url] || {
        url,
        title,
        totalTimeMs: 0,
        lastVisited: Date.now(),
        highlights: [],
      };

      page.highlights = page.highlights || [];
      page.highlights.push({
        text,
        createdAt: Date.now(),
      });

      memories[url] = page;

      chrome.storage.local.set({ pageMemories: memories });
    }
  );
});

//scroll to highlighted text

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "OPEN_AND_SCROLL") return;

  const { url, text } = msg.payload;

  chrome.tabs.create({ url }, (tab) => {
    if (!tab?.id) return;

    // Wait a bit for page to load
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);

        chrome.tabs.sendMessage(tabId, {
          type: "SCROLL_TO_HIGHLIGHT",
          text,
        });
      }
    });
  });
});


self.addEventListener("beforeunload", () => {
  stopTimer();
});
