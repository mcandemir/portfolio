import { useState, useEffect, useRef, useCallback } from "react";
import Terminal from "./Terminal";

const STORAGE_KEY = "portfolio-terminal-expanded";
const HEIGHT_KEY = "portfolio-terminal-height";

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 560;
const DEFAULT_HEIGHT = 448; // 28rem
const TERMINAL_MIN_WIDTH = 768; // md breakpoint — start minimized on smaller screens

function loadExpanded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

function loadHeight(): number {
  if (typeof window === "undefined") return DEFAULT_HEIGHT;
  try {
    const v = localStorage.getItem(HEIGHT_KEY);
    if (!v) return DEFAULT_HEIGHT;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, n)) : DEFAULT_HEIGHT;
  } catch {
    return DEFAULT_HEIGHT;
  }
}

function saveExpanded(expanded: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, String(expanded));
  } catch {
    /* ignore */
  }
}

function saveHeight(height: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HEIGHT_KEY, String(height));
  } catch {
    /* ignore */
  }
}

export default function PersistentTerminal() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [expanded, setExpanded] = useState(false); // start minimized; desktop restores from localStorage

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${TERMINAL_MIN_WIDTH}px)`);
    const large = mq.matches;
    setIsLargeScreen(large);
    if (large) setExpanded(loadExpanded());
    const handler = (e: MediaQueryListEvent) => {
      setIsLargeScreen(e.matches);
      if (e.matches) setExpanded(loadExpanded());
      else setExpanded(false); // minimize when going to small screen
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [height, setHeight] = useState(loadHeight);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ y: 0, height: 0 });

  useEffect(() => {
    saveExpanded(expanded);
  }, [expanded]);

  useEffect(() => {
    saveHeight(height);
  }, [height]);

  const resizeHandlersRef = useRef<{ move: (e: MouseEvent) => void; end: () => void } | null>(null);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    const delta = e.clientY - resizeStartRef.current.y;
    // Inverted so drag up = grow, drag down = shrink (user expectation)
    const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, resizeStartRef.current.height - delta));
    setHeight(newHeight);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    const h = resizeHandlersRef.current;
    if (h) {
      window.removeEventListener("mousemove", h.move);
      window.removeEventListener("mouseup", h.end);
      resizeHandlersRef.current = null;
    }
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartRef.current = { y: e.clientY, height };
    setIsResizing(true);
    resizeHandlersRef.current = { move: handleResizeMove, end: handleResizeEnd };
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
  };

  if (expanded) {
    return (
      <div className="fixed bottom-0 right-0 left-0 md:left-auto md:w-[min(36rem,100%)] md:bottom-4 md:right-4 z-50 p-2 md:p-0 animate-slide-up">
        <div
          className="border border-terminal-border rounded-lg bg-terminal-surface shadow-2xl overflow-hidden font-mono text-sm flex flex-col max-h-[50vh] md:max-h-none transition-shadow duration-200"
          style={{ height: `${height}px` }}
        >
          {/* Resize handle */}
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-valuenow={height}
            aria-valuemin={MIN_HEIGHT}
            aria-valuemax={MAX_HEIGHT}
            onMouseDown={handleResizeStart}
            className="h-2 flex-shrink-0 cursor-n-resize hover:bg-terminal-border/50 transition-colors flex items-center justify-center group"
            aria-label="Resize terminal"
          >
            <span
              className={`w-12 h-0.5 rounded-full bg-terminal-muted/50 group-hover:bg-terminal-muted transition-colors ${isResizing ? "bg-terminal-muted" : ""}`}
            />
          </div>
          {/* Title bar with minimize */}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-terminal-bg border-b border-terminal-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-terminal-muted text-xs">mcandemir@portfolio ~ %</span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-terminal-muted hover:text-terminal-text p-2 -m-1 rounded transition-colors min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-terminal-green/50 focus:ring-offset-2 focus:ring-offset-terminal-surface"
              aria-label="Minimize terminal"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Terminal embedded onExit={() => setExpanded(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 font-mono text-xs bg-terminal-surface border border-terminal-border rounded-lg text-terminal-muted hover:text-terminal-green hover:border-terminal-green/50 transition-colors shadow-lg min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terminal-green/50 focus:ring-offset-2 focus:ring-offset-terminal-bg"
      aria-label="Open terminal"
    >
      <span className="text-terminal-green">~</span>
      <span>terminal</span>
    </button>
  );
}
