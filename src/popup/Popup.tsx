// src/popup/Popup.tsx
import React, { useEffect, useState } from "react";
import { PageMemory } from "../shared/types";
import { formatLastVisited } from "../utils/time";
import "./popup.css";

export default function Popup() {
  const [pages, setPages] = useState<PageMemory[]>([]);
  const [query, setQuery] = useState("");
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      { pageMemories: {} as Record<string, PageMemory> },
      (res: { pageMemories: Record<string, PageMemory> }) => {
        const memories: Record<string, PageMemory> = res.pageMemories || {};

        const sorted = Object.values(memories).sort(
          (a, b) => b.totalTimeMs - a.totalTimeMs
        );

        setPages(sorted);
      }
    );
  }, []);

  useEffect(() => {
    let alive = true;

    chrome.storage.local.get(
      { trackingEnabled: true },
      (res: { trackingEnabled: boolean }) => {
        if (!alive) return;
        setTrackingEnabled(res.trackingEnabled);
      }
    );

    return () => {
      alive = false;
    };
  }, []);

  const openHighlight = (pageUrl: string, text: string) => {
    chrome.runtime.sendMessage({
      type: "OPEN_AND_SCROLL",
      payload: {
        url: pageUrl,
        text,
      },
    });
  };

  const matchingHighlights = (page: PageMemory, query: string) => {
    if (!query) return [];

    const q = query.toLowerCase();

    return (
      page.highlights?.filter((h) => h.text.toLowerCase().includes(q)) || []
    );
  };

  const pageMatchesQuery = (page: PageMemory, query: string) => {
    const q = query.toLowerCase();

    if (page.title.toLowerCase().includes(q)) return true;
    if (page.url.toLowerCase().includes(q)) return true;

    return page.highlights?.some((h) => h.text.toLowerCase().includes(q));
  };

  const filtered = pages.filter(
    (p) => pageMatchesQuery(p, query)
    // p.title.toLowerCase().includes(query.toLowerCase())
    //  ||
    //   p.url.toLowerCase().includes(query.toLowerCase())
  );

  const toggleTracking = () => {
    const next = !trackingEnabled;
    setTrackingEnabled(next);
    chrome.storage.local.set({ trackingEnabled: next });
  };

  const Tooltip = () => {
    return (
      <span
        title="When ON, this remembers pages you spend time on and text you save. Nothing leaves your browser."
        style={{
          cursor: "help",
          fontSize: 12,
          opacity: 0.6,
        }}
      >
        ⓘ
      </span>
    );
  };

  return (
    <>
      {modalOpen ? (
        <div className="popup-modal">
          <h2>Do you want to delete all memory?</h2>
          <span className="buttonContainer">
            <button
              className="agreeBtn"
              onClick={() =>
                chrome.storage.local.set({ pageMemories: {} }, () =>
                { setModalOpen(false); setPages([]); }
                )
              }
            >
              Yes
            </button>
            <button style={{marginLeft : "10px"}} className="clearBtn" onClick={() => setModalOpen(false)}>
              No
            </button>
          </span>
        </div>
      ) : (
        <div className="popup">
          <h3>Memory</h3>

          <div className="togglebtn">
            <label style={{ fontSize: 12 }}>Tracking</label>

            <label className="toggle">
              <input
                type="checkbox"
                checked={trackingEnabled}
                onChange={toggleTracking}
              />
              <span className="slider" />
            </label>

            <Tooltip />
          </div>

          <input
            className="searchInput"
            placeholder="Search memory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="clearMemo" onClick={() => setModalOpen(true)}>
            Clear Memory
          </button>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {filtered.map((page) => {
              const matchedHighlights = matchingHighlights(page, query);
              return (
                <li key={page.url} className="pageItem">
                  {/* Page title / URL */}
                  <div
                    className="pageTitle"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = "none";
                    }}
                    onClick={() => window.open(page.url, "_blank")}
                  >
                    {page.title}
                  </div>

                  <div className="meta">
                    {Math.round(page.totalTimeMs / 1000)} sec
                    {formatLastVisited(page.lastVisited)}
                  </div>

                  {/* Highlights */}
                  {matchedHighlights?.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => openHighlight(page.url, h.text)}
                      className="highlight"
                    >
                      “{h.text}”
                    </div>
                  ))}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
