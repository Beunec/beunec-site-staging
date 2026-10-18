/**
 * Real Aselius screenshots, in one place. Every caption describes only what is
 * visible in the frame. Files live in /public/media/aselius as WebP; frames at
 * least 1000px wide also ship a half-size `-sm` variant for srcset.
 *
 * `light` / `dark` hold the same view in each theme so the site shows the one
 * that matches the visitor's theme; `src` is a frame that exists in one theme.
 */

export type ShotArea =
  | "Workspace"
  | "Engines"
  | "Human in the loop"
  | "Preview app"
  | "Code"
  | "Creative"
  | "Automation"
  | "Credits"
  | "Teams"
  | "Voice"
  | "Governance";

export type Shot = {
  id: string;
  title: string;
  caption: string;
  area: ShotArea;
  light?: string;
  dark?: string;
  src?: string;
  w: number;
  h: number;
  /** Docs pages (slugs) that show this frame. */
  docs?: string[];
};

const BASE = "/media/aselius";

export const SHOTS: Shot[] = [
  {
    id: "workspace-thread",
    title: "A full launch kit from one turn",
    caption:
      "Taskspace: one Rivine TaskForce turn returns documents, data, media and an app as twelve deliverable cards.",
    area: "Workspace",
    light: "workspace-thread-light",
    dark: "workspace-thread-dark",
    w: 1440,
    h: 900,
    docs: ["workspace", "rivine-taskforce"],
  },
  {
    id: "workspace-xlsx",
    title: "Excel, as a real grid",
    caption:
      "The Preview Panel beside the conversation shows FY2027 Forecast.xlsx as a working grid, with Publish and Download.",
    area: "Workspace",
    light: "workspace-xlsx-light",
    dark: "workspace-xlsx-dark",
    w: 1440,
    h: 900,
    docs: ["workspace"],
  },
  {
    id: "workspace-docx",
    title: "Word, rendered as pages",
    caption: "A Word report open in the Preview Panel, drawn as pages with its tables and chart.",
    area: "Workspace",
    light: "workspace-docx-light",
    dark: "workspace-docx-dark",
    w: 1440,
    h: 900,
    docs: ["workspace", "rivine-research"],
  },
  {
    id: "workspace-pptx",
    title: "PowerPoint, slide by slide",
    caption: "Platform Review.pptx in the Preview Panel, each slide as the deck draws it.",
    area: "Workspace",
    src: "workspace-pptx-light",
    w: 1440,
    h: 900,
    docs: ["workspace"],
  },
  {
    id: "workspace-csv",
    title: "CSV, as a grid",
    caption: "customer_ids.csv in the Preview Panel as rows and columns, not prose.",
    area: "Workspace",
    src: "workspace-csv-light",
    w: 1440,
    h: 900,
  },
  {
    id: "workspace-xlsx-mobile",
    title: "The Preview Panel on a phone",
    caption: "On a phone the Preview Panel takes the whole screen, with Publish and Download still one tap away.",
    area: "Workspace",
    src: "workspace-xlsx-mobile",
    w: 390,
    h: 844,
  },
  {
    id: "assets",
    title: "Assets",
    caption: "Assets lists every file the engines produced in this taskspace, filterable by type.",
    area: "Workspace",
    src: "assets-dark",
    w: 1440,
    h: 900,
    docs: ["workspace"],
  },
  {
    id: "preview-panel",
    title: "Open, edit, publish, export",
    caption:
      "A launch brief open in Preview with Save, Publish and Export, and Rivine Assist ready below it for follow-up edits.",
    area: "Workspace",
    src: "preview-panel-dark",
    w: 1440,
    h: 900,
    docs: ["workspace", "rivine-assist"],
  },
  {
    id: "engine-running",
    title: "A turn you can watch",
    caption: "A Rivine TaskForce turn while it runs: each step it takes appears in the thread as it happens.",
    area: "Engines",
    src: "engine-running-light",
    w: 1440,
    h: 900,
    docs: ["rivine-taskforce", "workspace"],
  },
  {
    id: "engine-trail",
    title: "The trail stays",
    caption: "After the turn, its full step trail stays with the thread above the result it produced.",
    area: "Engines",
    src: "engine-trail-light",
    w: 1440,
    h: 900,
    docs: ["rivine-taskforce"],
  },
  {
    id: "engine-stopped",
    title: "Stopped by you",
    caption: "Stop a turn and the trail records what ran and what was cancelled.",
    area: "Engines",
    src: "engine-stopped-light",
    w: 1440,
    h: 900,
    docs: ["rivine-taskforce"],
  },
  {
    id: "turn-stopped",
    title: "Honest about unfinished work",
    caption:
      "When a turn stops before it finishes, the thread says so and asks you to send the request again; nothing is passed off as done.",
    area: "Engines",
    src: "turn-stopped-light",
    w: 1440,
    h: 900,
    docs: ["workspace"],
  },
  {
    id: "hitl-question",
    title: "A quick question",
    caption: "When an engine needs your input it asks one question and waits for your answer.",
    area: "Human in the loop",
    light: "hitl-question-light",
    dark: "hitl-question-dark",
    w: 768,
    h: 372,
    docs: ["workspace"],
  },
  {
    id: "hitl-app-action",
    title: "Approve the exact action",
    caption:
      "Before TaskForce acts in a connected app, here creating a Linear issue, you see the action and choose Deny or Approve & run.",
    area: "Human in the loop",
    light: "hitl-app-action-light",
    dark: "hitl-app-action-dark",
    w: 768,
    h: 431,
    docs: ["rivine-taskforce", "workspace"],
  },
  {
    id: "connectors",
    title: "Connector",
    caption: "App Connector: connect only the apps a task needs, such as Outlook, GitHub, Gmail or Stripe.",
    area: "Workspace",
    src: "connectors-dark",
    w: 1440,
    h: 900,
    docs: ["workspace", "rivine-taskforce"],
  },
  {
    id: "governance",
    title: "Governance",
    caption: "Workspace Governance: the system instructions every engine follows in this workspace.",
    area: "Governance",
    light: "governance-light",
    dark: "governance-dark",
    w: 1440,
    h: 900,
    docs: ["workspace"],
  },
  {
    id: "publish-dialog",
    title: "Publish with an access code",
    caption:
      "Publish defaults to code access: the link opens in one tap, and Open or Members are one click away.",
    area: "Preview app",
    src: "publish-dialog-light",
    w: 1440,
    h: 900,
    docs: ["preview-app", "workspace"],
  },
  {
    id: "preview-docx",
    title: "Word, exactly as generated",
    caption: "preview.aselius.beunec.com shows the published Word report as pages, with a Download button.",
    area: "Preview app",
    src: "preview-docx-desktop",
    w: 1280,
    h: 800,
    docs: ["preview-app"],
  },
  {
    id: "preview-xlsx",
    title: "The same workbook, in public",
    caption: "The published FY2027 Forecast keeps its formatting and its chart on the Preview app.",
    area: "Preview app",
    src: "preview-xlsx-desktop",
    w: 1280,
    h: 800,
    docs: ["preview-app"],
  },
  {
    id: "preview-pptx",
    title: "A deck anyone can open",
    caption: "A published PowerPoint deck on the Preview app, no Aselius sign-in needed.",
    area: "Preview app",
    src: "preview-pptx-desktop",
    w: 1280,
    h: 800,
    docs: ["preview-app"],
  },
  {
    id: "preview-docx-mobile",
    title: "On any phone",
    caption: "The same published report on a phone.",
    area: "Preview app",
    src: "preview-docx-mobile",
    w: 390,
    h: 844,
    docs: ["preview-app"],
  },
  {
    id: "preview-access-code",
    title: "A bare link asks for the code",
    caption: "Opened without its code, a protected page asks for the access code that came with the link.",
    area: "Preview app",
    src: "preview-access-code-mobile",
    w: 390,
    h: 844,
    docs: ["preview-app", "security-disclosure"],
  },
  {
    id: "preview-private",
    title: "Members only",
    caption: "A members-only page tells everyone else it opens only from inside Aselius.",
    area: "Preview app",
    src: "preview-private",
    w: 1280,
    h: 720,
    docs: ["preview-app", "security-disclosure"],
  },
  {
    id: "code-project",
    title: "A Rivine Code project, published",
    caption: "A saved Rivine Code project on the Preview app: file tree on the left, read-only code on the right.",
    area: "Code",
    light: "code-project-light",
    dark: "code-project-dark",
    w: 1280,
    h: 760,
    docs: ["rivine-code", "preview-app"],
  },
  {
    id: "code-viewer-mobile",
    title: "Code on a phone",
    caption: "The published project's README in the code viewer on a phone.",
    area: "Code",
    src: "code-viewer-mobile",
    w: 390,
    h: 844,
  },
  {
    id: "code-review",
    title: "Accept or reject each change",
    caption: "Inline review of a code change: every edited hunk has its own Accept and Reject.",
    area: "Code",
    light: "code-review-light",
    dark: "code-review-dark",
    w: 900,
    h: 520,
    docs: ["rivine-code"],
  },
  {
    id: "creative-specialties",
    title: "Rivine Creative specialties",
    caption:
      "Rivine Creative's specialties: generate an image, surgically edit an image, animate a GIF or motion, generate or edit video.",
    area: "Creative",
    src: "creative-specialties-dark",
    w: 1440,
    h: 900,
    docs: ["rivine-creative"],
  },
  {
    id: "creative-chosen",
    title: "Specialty chosen",
    caption: "With Generate Video chosen, the composer is set to Rivine Creative and ready to send.",
    area: "Creative",
    src: "creative-chosen-dark",
    w: 1440,
    h: 900,
    docs: ["rivine-creative"],
  },
  {
    id: "automations",
    title: "Automation",
    caption:
      "Automations: a Rivine Research brief every day at 08:00 UTC, with Test run, Pause and its run history.",
    area: "Automation",
    light: "automations-light",
    dark: "automations-dark",
    w: 1440,
    h: 900,
    docs: ["automations"],
  },
  {
    id: "credits",
    title: "Credits",
    caption: "Credits: prepaid balance, promo codes, each engine's start floor and usage alerts on one page.",
    area: "Credits",
    light: "credits-light",
    dark: "credits-dark",
    w: 1440,
    h: 900,
    docs: ["plans-pricing"],
  },
  {
    id: "credits-floors",
    title: "Engine start floors",
    caption: "The minimum prepaid balance to start each Rivine engine, the same on every plan.",
    area: "Credits",
    light: "credits-floors-light",
    dark: "credits-floors-dark",
    w: 944,
    h: 233,
    docs: ["plans-pricing"],
  },
  {
    id: "shared-with-me",
    title: "Shared with me",
    caption: "Accept an invitation or open a workspace someone shared with you, with your role on each.",
    area: "Teams",
    light: "shared-with-me-light",
    dark: "shared-with-me-dark",
    w: 1440,
    h: 900,
    docs: ["manage-teams", "workspace"],
  },
  {
    id: "share-workspace",
    title: "Share a workspace",
    caption: "Share Workspace: add people by role and see who already has access.",
    area: "Teams",
    src: "share-workspace-dark",
    w: 1440,
    h: 900,
    docs: ["manage-teams"],
  },
  {
    id: "qr-connect",
    title: "Scan a connect code",
    caption: "Point the camera at someone's connect code to send them a connection.",
    area: "Teams",
    src: "qr-connect-live-dark",
    w: 1440,
    h: 900,
    docs: ["manage-teams"],
  },
  {
    id: "selius",
    title: "Selius",
    caption: "Selius: tap the dragon to talk, and opt in to the Hey Selius wake word if you want it.",
    area: "Voice",
    light: "selius-light",
    dark: "selius-dark",
    w: 1440,
    h: 900,
    docs: ["selius"],
  },
];

export function getShot(id: string): Shot {
  const shot = SHOTS.find((s) => s.id === id);
  if (!shot) throw new Error(`Unknown Aselius shot "${id}"`);
  return shot;
}

export function shotsForDoc(slug: string): Shot[] {
  return SHOTS.filter((s) => s.docs?.includes(slug));
}

/** File stem for a theme; single-theme shots return the same frame for both. */
export function shotStem(shot: Shot, theme: "light" | "dark"): string {
  return (theme === "dark" ? shot.dark ?? shot.light : shot.light ?? shot.dark) ?? shot.src!;
}

export function shotUrl(stem: string, size: "full" | "sm" = "full"): string {
  return `${BASE}/${stem}${size === "sm" ? "-sm" : ""}.webp`;
}

export function shotSrcSet(shot: Shot, stem: string): string | undefined {
  if (shot.w < 1000) return undefined;
  return `${shotUrl(stem, "sm")} ${Math.round(shot.w / 2)}w, ${shotUrl(stem)} ${shot.w}w`;
}

export function hasThemes(shot: Shot): boolean {
  return Boolean(shot.light && shot.dark);
}

/**
 * How a frame should sit in a 16:10 box: desktop screenshots fill it from the
 * top; phones, dialogs and strips are shown whole instead of being cropped.
 */
export function fitClass(shot: Shot): string {
  const ratio = shot.w / shot.h;
  return Math.abs(ratio - 1.6) > 0.15 ? "object-contain" : "object-cover object-top";
}
