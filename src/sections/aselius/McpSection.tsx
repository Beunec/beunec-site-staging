import Link from "next/link";
import { ArrowRight, Plug } from "lucide-react";
import { CopyField } from "@/components/media/CopyField";

const MCP_URL = "https://workspace.beunec.com/mcp";
const CLIENTS = ["Claude", "Claude Code", "Cursor", "ChatGPT", "Any MCP-compatible app"];

const STEPS = [
  { title: "Add the server", body: "In your AI app's connector or MCP settings, add a remote server with the address above." },
  { title: "Sign in to Aselius", body: "Approve the connection with your Aselius account. Tasks run on your own account and wallet." },
  { title: "Ask for the work", body: "Start a Rivine engine task, follow its steps, answer its questions, or cancel it, without leaving the app." },
];

/** Aselius MCP: use the Rivine engines from whichever AI app someone already lives in. */
export function McpSection() {
  return (
    <section className="border-t border-border py-20 md:py-24" aria-labelledby="mcp-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div data-reveal className="min-w-0">
            <p className="mb-5 font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">Aselius MCP</p>
            <h2 id="mcp-title" className="text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-4xl">
              Use Aselius from any AI app
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Already working in Claude, Cursor or ChatGPT? Connect it to Aselius MCP and start the same
              Rivine engines from there. Results come back as one-tap preview links and plain files, billed to
              the same wallet, on every plan.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Works with">
              {CLIENTS.map((c) => (
                <li key={c} className="rounded-full border border-border bg-container px-3.5 py-1.5 text-sm text-muted-foreground">
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Your app discovers the available engines and specialties from Aselius itself, for example Rivine
              Research · PDF or Rivine Cicero · Contract Review. Rivine Code, Rivine Browse and Rivine Assist need a
              live sandbox, your browser or an open document, so they stay in the web app.
            </p>
          </div>

          <div data-reveal style={{ ["--rv-i" as string]: 1 }} className="min-w-0 rounded-2xl border border-border bg-container p-5 sm:p-7">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Plug className="h-4 w-4 text-accent-sage" aria-hidden />
              Server address
            </p>
            <CopyField value={MCP_URL} label="Aselius MCP server address" />
            <ol className="mt-7 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-sage text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">{s.title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/aselius-platform/docs/aselius-mcp"
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-accent-sage transition-colors hover:text-foreground"
            >
              Read the Aselius MCP guide <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
