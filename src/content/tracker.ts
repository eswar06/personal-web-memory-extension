import { safeSend } from "../utils";

function sendVisibility(state: "visible" | "hidden") {
 
  safeSend({
    type: "PAGE_VISIBILITY",
    state,                                                      //functionality to track page visibility
    url: window.location.href,
    title: document.title,
  })
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    sendVisibility("visible");
  } else {                                                      // evemt listener for visibility change
    sendVisibility("hidden");
  }
});

// initial state
if (document.visibilityState === "visible") {
  sendVisibility("visible");                                    // trigger initial visibility state
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "CAPTURE_HIGHLIGHT") return;

    safeSend({
    type: "SAVE_HIGHLIGHT",
    payload: {
      text: msg.text,
      url: window.location.href,
      title: document.title,
    },
  });
  
});

// scroll to highlight text

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "SCROLL_TO_HIGHLIGHT") return;

  const text = msg.text.trim();
  if (!text) return;

  const bodyText = document.body.innerText;
  const index = bodyText.indexOf(text);

  if (index === -1) {
    console.warn("Highlight text not found");
    return;
  }

  // Walk DOM to find the text node
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  let currentNode: Text | null = null;

  while ((currentNode = walker.nextNode() as Text | null)) {
    const nodeText = currentNode.nodeValue;
    if (!nodeText) continue;

    const matchIndex = nodeText.indexOf(text);
    if (matchIndex !== -1) {
      const range = document.createRange();
      range.setStart(currentNode, matchIndex);
      range.setEnd(currentNode, matchIndex + text.length);

      const rect = range.getBoundingClientRect();
      window.scrollTo({
        top: rect.top + window.scrollY - 100,
        behavior: "smooth",
      });

      // Temporary highlight
      const mark = document.createElement("mark");
      range.surroundContents(mark);

      setTimeout(() => {
        mark.replaceWith(...mark.childNodes);
      }, 3000);

      break;
    }
  }
});


