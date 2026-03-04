export function safeSend(msg:{}) {
  try {
    chrome.runtime.sendMessage(msg, () => {
      if (chrome.runtime.lastError) {
        // extension context invalidated — ignore
      }
    });
  } catch {
    // extension gone — ignore
  }
}