/**
 * Beunec and Aselius releases, newest first. The home page shows the first six;
 * the Aselius page shows all of them. Dates are only as precise as what has
 * been announced: a bare year means no exact date was published.
 */
export type Update = {
  title: string;
  body: string;
  date: string;
  category: "Release" | "Platform" | "Research" | "Announcements";
  href: string;
  cta: string;
  external?: boolean;
};

const BROWSE_URL = "https://browse.aselius.beunec.com";
const DOCS = "/aselius-platform/docs";

export const UPDATES: Update[] = [
  {
    title: "Rivine Code CLI",
    body: "Rivine Code, in your terminal. The engine still runs on Beunec's infrastructure, but the files it reads and writes are the ones already on your disk, in the directory you started it in, open in your editor, tracked by your git. Nothing is uploaded.",
    date: "August 2026",
    category: "Release",
    href: `${DOCS}/rivine-code-cli`,
    cta: "Read the CLI docs",
  },
  {
    title: "Rivine Experimental Project",
    body: "Rivine is Beunec's answer to that gap: an orchestration and reasoning architecture built specifically for agentic work that has to survive contact with reality, flaky APIs, ambiguous instructions, multi-hour tasks, and stakes high enough that a wrong answer costs more than a slow one.",
    date: "2026",
    category: "Research",
    href: "/rivine-experimental-project",
    cta: "Read publication",
  },
  {
    title: "Introducing Aselius Platform",
    body: "The Workspace application on the Aselius platform is the first place this architecture is available for direct use today. Beunec's roadmap, ahead of July 2027, is to expose each Rivine agentic engine through dedicated API infrastructure for enterprise, government, and developer use.",
    date: "August 10, 2026",
    category: "Platform",
    href: "/aselius-platform",
    cta: "View Aselius",
  },
  {
    title: "Announcing Rivine Agentic Engines",
    body: "Awareness and artificial experience are not an engine unto themselves. They sit under TaskForce, Research, Cicero, Code, and Creative the way the orchestration runtime already does: shared, always on, and not a substitute for the internal design of any one product.",
    date: "2026",
    category: "Announcements",
    href: `${DOCS}/rivine-taskforce`,
    cta: "Explore engines",
  },
  {
    title: "Rivine Browse",
    body: "Rivine Browse completes tasks in your own browser, in your real tabs and signed-in sessions, from a side panel. It plans, acts, pauses for approvals, and can run for hours because every step is a short HTTPS call, not a held server process.",
    date: "2026",
    category: "Release",
    href: BROWSE_URL,
    cta: "Open Rivine Browse",
    external: true,
  },
  {
    title: "Selius",
    body: "Selius is the voice of Aselius and Rivine Browse: speech-to-speech on Gemini Live, and the ivory-and-jade dragon that shows what Rivine is doing. Tap to talk, or opt in to Hey Selius. It asks before it acts, and never approves risk on its own.",
    date: "2026",
    category: "Release",
    href: `${DOCS}/selius`,
    cta: "Meet Selius",
  },
  {
    title: "Aselius Preview App",
    body: "Publish any deliverable to preview.aselius.beunec.com and hand the link to anyone: Word and PowerPoint as pages, Excel as a real grid, Rivine Code projects as a read-only file tree, with code access by default.",
    date: "2026",
    category: "Release",
    href: `${DOCS}/preview-app`,
    cta: "Read the guide",
  },
  {
    title: "Aselius MCP",
    body: "Start and follow a Rivine engine task from Claude, Cursor, ChatGPT or any MCP client at workspace.beunec.com/mcp, on your own account and wallet.",
    date: "2026",
    category: "Release",
    href: `${DOCS}/aselius-mcp`,
    cta: "Connect a client",
  },
  {
    title: "Messaging Channels",
    body: "Telegram, Discord and WhatsApp can start and follow a real Rivine engine task: pick the engine and specialty in the chat, and the result comes back with a one-tap preview link.",
    date: "2026",
    category: "Release",
    href: `${DOCS}/messaging-channels`,
    cta: "Link a channel",
  },
  {
    title: "Aselius Automation",
    body: "Scheduled Rivine Research, TaskForce, Cicero and Confluence runs that happen whether or not your computer is on, each one gated by a passing test run and billed to your credits.",
    date: "2026",
    category: "Platform",
    href: `${DOCS}/automations`,
    cta: "Read the guide",
  },
];
