# Artificial Experience

Artificial Experience is the workspace memory of work under the Rivine engines in Aselius. It remembers what already worked in your workspace, so TaskForce, Code, Research and Cicero get faster, cheaper and more consistent the longer your team uses them, without ever faking a result.

## At a glance

- **What it is:** A memory of settled facts, past outcomes and reusable lookups, recalled only when they help the current request.
- **You get:** Fewer repeated paid lookups, no repeated dead ends, and consistent results across a team.
- **Never reused:** Live data (prices, weather, the clock) and actions such as writes, deploys, emails or messages.
- **Scope:** Your workspace only. Another customer's work is never recalled into yours.
- **Your control:** Say "live", "latest", "refresh" or "now" and that request skips memory and fetches fresh.
- **Upkeep:** Managed automatically as your conversations grow. Memory you do not want is suppressed at once and deleted after 90 days, and can be brought back within that window.
- **Where to see it:** Artificial Experience activity appears in [Observability](/aselius-platform/docs/observability).

## Why it exists

Most AI products treat every request as the first. You pay again for the same research lookup, the same file read and the same failed approach. Models are capable, but they do not know your last successful build, your grounding sources or your legal constraints unless the product keeps that work on purpose.

Artificial Experience is not a bigger prompt or "a model with a long memory". Its rule is simple: if the work was already done well, review and improve it, and do not buy it a second time.

## What it remembers

| Kind | What it keeps | What it never keeps |
| --- | --- | --- |
| **Settled facts** | Durable truths your team established ("this workspace uses cookie-based auth") | Live prices, weather, the time |
| **Past outcomes** | What a request achieved: successes worth keeping, failures worth not repeating | A replay of a request that wrote files or sent messages |
| **Reusable lookups** | Read-only work: a document already fetched, a digest already written, a file already read | Writes, deploys, emails, or a whole app generated last week |

It keeps what is worth remembering, not everything. Failures and expensive steps matter more than routine success, so memory stays a useful signal rather than a second transcript.

> **Note:** A past request that used tools or produced deliverables is never replayed as a finished answer. Showing yesterday's result without repeating yesterday's work would look complete and be false. Artificial Experience reuses judgment and inputs, not completions.

## How freshness works

| Type of information | How it is treated |
| --- | --- |
| **Live** (markets, weather, "now") | Never reused; always fetched fresh |
| **Stable** (a filing, a spec, a pinned file version) | Reused until it goes stale |
| **Durable** (how this workspace solved a problem) | Reused as a pattern, then applied to the new request |

When you ask for live, latest, real-time or current information, memory steps aside for that request's reads.

## What happens on a request

1. You send a request to the engine you chose.
2. The engine checks your workspace memory for settled facts and relevant past outcomes.
3. If stable, read-only work was already done, it is reused and the paid lookup is skipped.
4. If the information is live or new, the engine fetches it fresh from your grounded sources, connected apps or sandbox.
5. Read-only results worth keeping are stored for next time. Actions are never stored as reusable results.
6. The engine works from a small, relevant set of memory rather than your entire history, and returns the deliverable.

Every part of a multi-step engine run shares the same memory, so work paid for once is not bought again by a later step in the same run.

## How each engine uses it

| Engine | What it reuses | What it never reuses | Everyday example |
| --- | --- | --- | --- |
| **TaskForce** | Briefs already fetched; connector paths that failed | Completed actions (files, tickets, deploys) | "Same weekly ops pack, but this week's numbers must be live." Structure and stable inputs are reused; the numbers are fetched fresh. |
| **Code** | Files already read; workspace patterns; known test failures | Generated code as the answer; writes, installs or sandbox changes | "Add a settings page like the billing page." The billing pattern is recalled; Code still writes this page. |
| **Research** | Stable sources already pulled, with their citations attached | Live questions ("what did the market do in the last hour?") | "Update the memo with the same 10-K plus anything new this quarter." The 10-K is reused; only the new material is paid for. |
| **Cicero** | Settled constraints ("this matter is under seal"); lines of argument that already failed | A legal conclusion from memory; Cicero reasons on the current facts | "Same counterparty, new SOW, same playbook." The playbook and constraints load; Cicero drafts the new document. |

## Simple vs high-stakes requests

| | Simple | High-stakes |
| --- | --- | --- |
| **Example** | "Summarize yesterday's notes." | "Rebuild the dashboard; numbers must be live; keep our chart pattern." |
| **What memory does** | Reuses the digest if the notes did not change | Reuses the chart pattern; refuses stale numbers |
| **What you see** | Faster, cheaper, same quality | Faster on structure, honest on freshness |
| **What you never see** | A remembered answer standing in for an action | A "complete" app that was not actually rebuilt |

## What you can inspect

[Observability](/aselius-platform/docs/observability) shows Artificial Experience activity as kinds of events, not a black box:

- **Recall:** whether memory found anything relevant
- **Archive:** whether older work was kept
- **Reuse:** when a safe, read-only result was reused
- **Consolidate:** when older work was summarized and compressed

An empty section means that kind of event has not happened yet. It fills in as engines run, so your team can check whether memory is earning its keep. Observability reports activity without exposing conversation content.

## Control and privacy

- **Scoped to your workspace.** Memory is isolated per customer and workspace; another customer's work is never recalled.
- **Reads, not actions.** Only side-effect-free work is reused. Actions always run again.
- **You override it.** "Live", "latest", "refresh" or "now" in a request makes that request fetch fresh instead of using memory.
- **Bounded recall.** Only a small, ranked set of relevant memory enters a request, never your whole history.
- **Managed for you.** Artificial Experience storage and its logs are not cleared by hand. A deterministic system maintains them as your conversations grow, so memory stays small and relevant without any housekeeping from you.
- **Unwanted memory is suppressed, then deleted.** When context or memory you do not like is detected, it is suppressed straight away, so it no longer shapes your results, and it is permanently deleted after 90 days.
- **Changed your mind?** Within those 90 days (on day 30 or day 60, for example), suppressed memory can be retrieved easily.
- **Coming if you ask for it.** Per-workspace memory controls and a visual view of what is remembered may follow as more teams request them.
- **Deleting your work.** You can delete assets, taskspaces or a whole workspace from the UI; deleted workspaces are permanently removed within 30 days. See [Security disclosure](/aselius-platform/docs/security-disclosure).

## Artificial Experience vs Context Extender

The two work side by side but solve different problems.

| | Artificial Experience | Context Extender |
| --- | --- | --- |
| **Question it answers** | Have we already done this well? | Does this request fit in a single model call? |
| **When it acts** | Whenever there is something worth remembering or reusing | Only when a request would be too large to send whole |
| **Benefit** | Skips repeated paid work; raises consistency | Works over a very large body of work with a small prompt |

## Related

- [Context Extender](/aselius-platform/docs/context-extender)
- [Observability](/aselius-platform/docs/observability)
- [Workspace](/aselius-platform/docs/workspace)
- [Rivine TaskForce](/aselius-platform/docs/rivine-taskforce)
- [Rivine Research](/aselius-platform/docs/rivine-research)
- [Rivine Code](/aselius-platform/docs/rivine-code)
- [Rivine Cicero](/aselius-platform/docs/rivine-cicero)
