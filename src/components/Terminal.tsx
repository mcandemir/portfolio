import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { navigate } from "astro:transitions/client";

type OutputLine =
  | string
  | { text: string; href?: string; command?: string }
  | { command: string; description: string }; // help format: command in green, description muted

interface CommandResult {
  command: string;
  output: OutputLine[];
}

const COMMANDS: Record<string, OutputLine[]> = {
  help: [
    "",
    { command: "about", description: "Who am I?" },
    { command: "skills", description: "Technical skill set" },
    { command: "experience", description: "Work history" },
    { command: "volunteer", description: "Voluntary work & community" },
    { command: "projects", description: "Featured projects" },
    { command: "lab", description: "The Lab (early experiments)" },
    { command: "contact", description: "How to reach me" },
    { command: "achievements", description: "Talks, articles, milestones" },
    { command: "events", description: "Talks, meetups, conferences" },
    "",
    { command: "cd", description: "Navigate: cd projects, cd experience, cd volunteer, cd lab, ..." },
    { command: "clear", description: "Clear terminal" },
    { command: "help", description: "Show this message" },
    "",
    "  Click a command or type and press Enter.",
  ],
  about: [
    "",
    "  Can Demir · Software Engineer @ Yolda.com · Turkey",
    "",
    "  Systems · Backend · Full-Stack",
    "  Python · Go · TypeScript · ML",
    "",
    "  Building high-performance distributed systems & tooling.",
    "  Also, I love cats.",
    "",
    { text: "  → mehmetcandemir.com", href: "https://mehmetcandemir.com" },
    { text: "  → experience", href: "/experience" },
    { text: "  → projects", href: "/projects" },
    { text: "  → GitHub", href: "https://github.com/mcandemir" },
    { text: "  → LinkedIn", href: "https://linkedin.com/in/mcandemir9" },
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
    { text: "→ /experience for full details", href: "/experience" },
    "",
    "  Software Engineer     @ Yolda Technology      2024–present",
    "  Backend Dev & Instructor @ Cosmios Academy  2024",
    "  Data Science Intern   @ Dogus Teknoloji      2023–2024",
    "  Data Science Intern   @ Jotform              2023",
    "  Backend Developer     @ StartupXYZ           2021–2022",
  ],
  projects: [
    { text: "→ /projects for full details", href: "/projects" },
    "",
    { text: "  01  distributed-cache    Go · Redis cluster implementation", href: "/projects/distributed-cache" },
    { text: "  02  portfolio-site       Astro · This very site", href: "/projects/portfolio-site" },
    { text: "  03  cli-toolkit          Rust · Developer productivity tools", href: "/projects/cli-toolkit" },
  ],
  contact: [
    "Email     → (add your email)",
    { text: "GitHub    → github.com/mcandemir", href: "https://github.com/mcandemir" },
    { text: "LinkedIn  → linkedin.com/in/mcandemir9", href: "https://linkedin.com/in/mcandemir9" },
    { text: "Website   → mehmetcandemir.com", href: "https://mehmetcandemir.com" },
  ],
  lab: [
    { text: "→ /lab for The Lab", href: "/lab" },
    "",
    "  Early experiments, CLI tools, and projects",
    "  that shaped the path. 20+ repos.",
  ],
  volunteer: [
    { text: "→ /volunteer for full details", href: "/volunteer" },
    "",
    "  Software Engineer Intern  @ Technology Dev Group  2023",
    "  ML Engineer Contributor  @ UnifyAI               2022",
    "  ML Engineer Freelancer   @ Nutzentech            2021–2022",
    "  AI Engineer Intern       @ Apziva                2020–2021",
    "  R&D ML Engineer          @ CENGA · Cukurova      2020–2021",
    "  Computer Vision Engineer @ Cukurova Hydromobile  2019–2020",
  ],
  voluntary: [
    { text: "→ /volunteer for full details", href: "/volunteer" },
    "",
    "  Software Engineer Intern  @ Technology Dev Group  2023",
    "  ML Engineer Contributor  @ UnifyAI               2022",
    "  ML Engineer Freelancer   @ Nutzentech            2021–2022",
    "  AI Engineer Intern       @ Apziva                2020–2021",
    "  R&D ML Engineer          @ CENGA · Cukurova      2020–2021",
    "  Computer Vision Engineer @ Cukurova Hydromobile  2019–2020",
  ],
  events: [
    { text: "→ /events for talks, meetups, conferences", href: "/events" },
  ],
  achievements: [
    { text: "→ /achievements for all", href: "/achievements" },
    "",
    { text: "  2022  3rd Place · Smart City Adana Hackathon", href: "/achievements/smart-city-adana-hackathon-2022" },
    { text: "  2020  2nd Place · TÜBİTAK Autonomous Car Efficiency Challenge", href: "/achievements/tubitak-efficiency-challenge-2020" },
  ],
};

const CD_PATHS: Record<string, string> = {
  home: "/",
  "~": "/",
  projects: "/projects",
  experience: "/experience",
  volunteer: "/volunteer",
  voluntary: "/volunteer",
  lab: "/lab",
  achievements: "/achievements",
  events: "/events",
};

const WELCOME = [
  "Hello, I'm Can — software engineer.",
  "I build distributed systems, backend infrastructure, and developer tooling.",
  "",
  'Type "help" to explore. Use "cd projects" to navigate.',
  "",
];

const STORAGE_KEY = "portfolio-terminal-state";
const FOCUS_KEY = "portfolio-terminal-focus";

const storage = typeof window !== "undefined" ? localStorage : null;

function loadTerminalState(): { history: CommandResult[]; commandHistory: string[] } | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { history: CommandResult[]; commandHistory: string[] };
    if (Array.isArray(parsed.history) && Array.isArray(parsed.commandHistory)) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveTerminalState(history: CommandResult[], commandHistory: string[]) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ history, commandHistory }));
  } catch {
    /* ignore */
  }
}

interface TerminalProps {
  /** When true, omit the title bar (used inside PersistentTerminal) */
  embedded?: boolean;
}

export default function Terminal({ embedded = false }: TerminalProps) {
  const [history, setHistory] = useState<CommandResult[]>(() => {
    const saved = loadTerminalState();
    return saved?.history ?? [];
  });
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    const saved = loadTerminalState();
    return saved?.commandHistory ?? [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef(history);
  const commandHistoryRef = useRef(commandHistory);
  historyRef.current = history;
  commandHistoryRef.current = commandHistory;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  // Auto-focus on mount (first load + after cd/open navigation)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(FOCUS_KEY)) {
        sessionStorage.removeItem(FOCUS_KEY);
      }
      inputRef.current?.focus();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (history.length > 0 || commandHistory.length > 0) {
      saveTerminalState(history, commandHistory);
    }
  }, [history, commandHistory]);

  const executeCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      const parts = trimmed.split(/\s+/);
      const command = parts[0]?.toLowerCase() ?? "";
      const arg = parts[1]?.toLowerCase() ?? "";

      if (command === "clear") {
        setHistory([]);
        return;
      }

      // cd / open — navigate to path (cd alone = home)
      if (command === "cd" || command === "open") {
        const path = arg ? CD_PATHS[arg] : CD_PATHS["home"];
        if (path !== undefined) {
          const newHistory: CommandResult[] = [
            ...historyRef.current,
            { command: cmd.trim(), output: [] },
          ];
          const newCommandHistory = [...commandHistoryRef.current, cmd.trim()];
          saveTerminalState(newHistory, newCommandHistory);
          setHistory(newHistory);
          setCommandHistory(newCommandHistory);
          try {
            sessionStorage.setItem(FOCUS_KEY, "1");
          } catch {
            /* ignore */
          }
          navigate(path);
          return;
        }
        const output: OutputLine[] = path === undefined && arg
          ? [`cd: no such path "${arg}"`, "Try: home, projects, experience, lab, achievements, events"]
          : ["Usage: cd <path>", "Paths: home, projects, experience, lab, achievements, events"];
        setHistory((prev) => [...prev, { command: cmd.trim(), output }]);
        setCommandHistory((prev) => [...prev, cmd.trim()]);
        setHistoryIndex(-1);
        return;
      }

      const resolvedCommand = (command === "ll" || command === "ls") ? "help" : command;
      const output = COMMANDS[resolvedCommand];
      const result: CommandResult = {
        command: cmd.trim(),
        output: output ?? [`command not found: ${command}`, 'Type "help" for available commands.'],
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
      const trimmed = input.trim().toLowerCase();
      if (!trimmed) return;
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0] ?? "";
      const pathPartial = parts[1] ?? "";

      // cd / open: complete path argument
      if ((cmd === "cd" || cmd === "open") && parts.length >= 1) {
        const pathKeys = Object.keys(CD_PATHS);
        const matches = pathKeys.filter((p) => p.startsWith(pathPartial));
        if (matches.length >= 1) {
          // Single match: complete fully. Multiple: complete to first (alphabetically)
          setInput(`${cmd} ${matches[0]}`);
        }
        return;
      }

      // Command completion
      const allCommands = [...Object.keys(COMMANDS), "cd", "open", "ll", "ls"];
      const match = allCommands.find((c) => c.startsWith(trimmed));
      if (match) setInput(match);
    }
  };

  const body = (
    <div
      ref={scrollRef}
      className={`p-4 overflow-y-auto space-y-2 ${embedded ? "flex-1 min-h-0" : "h-[28rem]"}`}
    >
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
              {entry.command.toLowerCase().split(/\s+/)[0] === "about" ? (
                <div className="font-mono text-terminal-text/80 text-sm leading-relaxed space-y-0.5">
                  {entry.output.map((line, j) =>
                    typeof line === "string" ? (
                      <div key={j} className="whitespace-pre">{line || "\u00A0"}</div>
                    ) : "href" in line && line.href ? (
                      <a
                        key={j}
                        href={line.href}
                        target={line.href.startsWith("http") ? "_blank" : undefined}
                        rel={line.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-terminal-green hover:underline cursor-pointer whitespace-pre block"
                      >
                        {line.text}
                      </a>
                    ) : (
                      <div key={j} className="whitespace-pre">{"text" in line ? line.text || "\u00A0" : "\u00A0"}</div>
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {entry.output.map((line, j) => {
                    if (typeof line === "string") {
                      return (
                        <div key={j} className="text-terminal-text/80 leading-relaxed">
                          {line || "\u00A0"}
                        </div>
                      );
                    }
                    // help format: command (green) + description (muted)
                    if ("description" in line && line.description !== undefined) {
                      const cmd = ("  " + line.command).padEnd(13);
                      return (
                        <button
                          key={j}
                          type="button"
                          onClick={() => executeCommand(line.command)}
                          className="block w-full text-left leading-relaxed hover:opacity-90 cursor-pointer transition-opacity whitespace-nowrap font-mono group"
                        >
                          <span className="text-terminal-green group-hover:underline">{cmd}</span>
                          <span className="text-terminal-muted">{line.description}</span>
                        </button>
                      );
                    }
                    if ("href" in line && line.href) {
                      const isExternal = line.href.startsWith("http");
                      return (
                        <div key={j} className="text-terminal-text/80 leading-relaxed">
                          <a
                            href={line.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="text-terminal-green hover:underline cursor-pointer"
                          >
                            {line.text}
                          </a>
                        </div>
                      );
                    }
                    if ("text" in line && line.command) {
                      return (
                        <button
                          key={j}
                          type="button"
                          onClick={() => executeCommand(line.command!)}
                          className="block w-full text-left text-terminal-text/80 leading-relaxed hover:text-terminal-green hover:underline cursor-pointer transition-colors whitespace-nowrap font-mono"
                        >
                          {line.text}
                        </button>
                      );
                    }
                    return (
                      <div key={j} className="text-terminal-text/80 leading-relaxed">
                        {"text" in line ? line.text || "\u00A0" : "\u00A0"}
                      </div>
                    );
                  })}
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
  );

  if (embedded) {
    return (
      <div className="h-full min-h-0 flex flex-col" onClick={() => inputRef.current?.focus()}>
        {body}
      </div>
    );
  }

  return (
    <div
      className="border border-terminal-border rounded-lg bg-terminal-surface overflow-hidden font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-terminal-bg border-b border-terminal-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-terminal-muted text-xs ml-2">can@portfolio ~ %</span>
      </div>
      {body}
    </div>
  );
}
