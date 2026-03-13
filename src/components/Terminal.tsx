import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";

interface CommandResult {
  command: string;
  output: string[];
}

const COMMANDS: Record<string, string[]> = {
  help: [
    "Available commands:",
    "",
    "  about       — Who am I?",
    "  skills      — Technical skill set",
    "  experience  — Work history",
    "  projects    — Featured projects",
  "  lab         — The Lab (early experiments)",
    "  contact     — How to reach me",
    "  blog        — Recent blog posts",
    "  linkedin    — Embedded LinkedIn posts",
    "  clear       — Clear terminal",
    "  help        — Show this message",
    "",
    'Type a command and press Enter. Try "about" to start.',
  ],
  about: [
    "",
    "       ┌─────────────────────────────────────┐",
    "       │     Can · Software Engineer         │",
    "       │     Yolda.com · Turkey              │",
    "       ├─────────────────────────────────────┤",
    "       │  Systems · Backend · Full-Stack     │",
    "       │  Python · Go · TypeScript · ML      │",
    "       ├─────────────────────────────────────┤",
    "       │  Building high-performance          │",
    "       │  distributed systems & tooling.     │",
    "       │                                     │",
    "       │  I love cats.                       │",
    "       └─────────────────────────────────────┘",
    "",
    "       → mehmetcandemir.com",
    "",
  ],
  skills: [
    "Languages    → Go · Rust · TypeScript · Python · SQL",
    "Backend      → Gin · gRPC · REST · GraphQL · PostgreSQL · Redis",
    "Frontend     → React · Astro · Tailwind · Next.js",
    "Infra        → Docker · Kubernetes · Terraform · AWS · GCP",
    "Tools        → Git · CI/CD · Prometheus · Grafana · Vim",
  ],
  experience: [
    "→ Navigate to /experience for full details",
    "",
    "  Senior Engineer    @ TechCorp       2023–present",
    "  Backend Developer  @ StartupXYZ     2021–2023",
    "  Software Intern    @ BigCo          2020–2021",
  ],
  projects: [
    "→ Navigate to /projects for full details",
    "",
    "  01  distributed-cache    Go · Redis cluster implementation",
    "  02  portfolio-site       Astro · This very site",
    "  03  cli-toolkit          Rust · Developer productivity tools",
  ],
  contact: [
    "Email     → (add your email)",
    "GitHub    → github.com/mcandemir",
    "LinkedIn  → linkedin.com/in/mcandemir9",
    "Website   → mehmetcandemir.com",
  ],
  lab: [
    "→ Navigate to /lab for The Lab",
    "",
    "  Early experiments, CLI tools, and projects",
    "  that shaped the path. 20+ repos.",
  ],
  linkedin: [
    "→ Navigate to /linkedin for embedded posts",
    "",
    "  Follow @mcandemir9 on LinkedIn",
    "  for updates and thoughts.",
  ],
  blog: [
    "→ Navigate to /blog for all posts",
    "",
    "  2024-10  Building a Terminal UI in React",
    "  2024-09  Why I Moved from Node to Go",
    "  2024-08  Content Collections in Astro 5",
  ],
};

const WELCOME = [
  "Welcome to the interactive portfolio terminal.",
  'Type "help" for available commands.',
  "",
];

export default function Terminal() {
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const executeCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase();

      if (trimmed === "clear") {
        setHistory([]);
        return;
      }

      const output = COMMANDS[trimmed];
      const result: CommandResult = {
        command: cmd.trim(),
        output: output ?? [`command not found: ${trimmed}`, 'Type "help" for available commands.'],
      };

      setHistory((prev) => [...prev, result]);
      setCommandHistory((prev) => [...prev, cmd.trim()]);
      setHistoryIndex(-1);
    },
    [],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const partial = input.trim().toLowerCase();
      if (!partial) return;
      const match = Object.keys(COMMANDS).find((c) => c.startsWith(partial));
      if (match) setInput(match);
    }
  };

  return (
    <div
      className="border border-terminal-border rounded-lg bg-terminal-surface overflow-hidden font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-terminal-bg border-b border-terminal-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-terminal-muted text-xs ml-2">can@portfolio ~ %</span>
      </div>

      {/* Terminal body */}
      <div ref={scrollRef} className="p-4 h-80 overflow-y-auto space-y-2">
        {/* Welcome message */}
        {WELCOME.map((line, i) => (
          <div key={`w-${i}`} className="text-terminal-muted leading-relaxed">
            {line || "\u00A0"}
          </div>
        ))}

        {/* Command history */}
        {history.map((entry, i) => (
          <div key={i} className="animate-slide-up">
            <div className="flex items-center gap-2 text-terminal-text">
              <span className="text-terminal-green">$</span>
              <span>{entry.command}</span>
            </div>
            <div className="mt-1 pl-4">
              {entry.command.toLowerCase() === "about" ? (
                <pre className="font-mono text-terminal-text/80 text-sm leading-relaxed whitespace-pre">
                  {entry.output.join("\n")}
                </pre>
              ) : (
                <div className="space-y-0.5">
                  {entry.output.map((line, j) => (
                    <div key={j} className="text-terminal-text/80 leading-relaxed">
                      {line || "\u00A0"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-2">
          <span className="text-terminal-green shrink-0">$</span>
          <div className="flex items-center min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ width: `${Math.max(1, input.length + 1)}ch` }}
              className="bg-transparent outline-none text-terminal-text caret-transparent p-0"
              autoComplete="off"
              spellCheck={false}
              aria-label="Terminal input"
            />
            <span className="w-2 h-4 bg-terminal-green animate-blink shrink-0 -ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
