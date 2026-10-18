# Rivine Assist

**Aselius Workspace · engine key `rivine_assist`**

Rivine Assist is the small tool built using our aselius precise snippet transformation framework for surgical editing and a small ask on a document that is already open in Preview. Add a paragraph, fix a colour, tighten a section — without spending a full Rivine engine turn (orchestration, sub-agents, sandbox, full graph).

## What it does

- Edits **one asset on screen**: Markdown, HTML, or code that you already have in the Preview Panel.
- Returns a list of **exact-match spans and replacements**, not a rewritten document. Each span is checked byte-for-byte against the current content before it is applied (`verify_snippet_in_source`). A drift into rewriting fails the edit instead of half-applying it.
- Optional **one round of grounding** when facts are needed: Assist may ask for research queries; the server runs them through grounded data sources and asks once more with findings attached. Two model calls at most.

## What it is not

- Not a scheduler (see [Automations](/aselius-platform/docs/automations)).
- Not a full research, code, or legal turn — those belong to TaskForce, Research, Code, Cicero, Confluence, Creative, or Browse.
- Not unattended: it is interactive and scoped to the document you are looking at.

## When to use it

| Use Assist | Use a full engine |
| --- | --- |
| One more section in a finished brief | A new research report from sources |
| A colour or copy tweak in generated HTML | A greenfield app or multi-file build |
| A surgical fix after you reviewed the deliverable | A multi-hour build with verification and critic |

## Related

- [Aselius Workspace](/aselius-platform/docs/workspace) — Preview Panel and assets
- [Artificial Experience](/aselius-platform/docs/artificial-experience) — workspace memory under the engines
- [Automations](/aselius-platform/docs/automations) — scheduled engine runs (Assist is not schedulable)
