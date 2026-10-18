# Context Extender

The Context Extender lets Rivine engines in Aselius work over a very large body of work (on the order of 2 to 5 million tokens of history and files) without sending all of it to the model on every call. The corpus can be vast; each request stays small, fast and affordable.

## At a glance

- **What it is:** Retrieval under a cap. Each request gets the recent thread, a summary of older work and the few older pieces that match.
- **Best for:** Long TaskForce programs, large codebases, research corpora and Cicero matters that outgrow one model call.
- **When it acts:** Only when a request would be too large to send whole. Short chats are untouched.
- **You get:** Consistency on month-long threads without paying to resend the whole history every time.
- **Works with:** TaskForce, Code, Research and Cicero, alongside [Artificial Experience](/aselius-platform/docs/artificial-experience).
- **Limits:** Not unlimited context. Only a bounded working set reaches the model on any request.

## The problem it solves

Models work inside a fixed window. Your real work does not: a TaskForce thread, a codebase, a research corpus or a legal matter grows past what any model can take in one request.

Pasting the whole history into one call is slow, fragile and expensive, and quality drops because the model attends to everything and therefore to nothing. The Context Extender keeps the full corpus addressable and sends only what this request needs.

| What people wish | What actually works |
| --- | --- |
| "Give the model 5 million tokens." | Keep 5 million tokens in the corpus. |
| One giant prompt every time | Send a working set that fits; retrieve the rest on demand. |

## Corpus vs working set

- **Corpus:** everything this thread or workspace can address. It can grow very large.
- **Working set:** what a single model call actually sees. It is capped well below the model window, so your instructions, your message and the engine's own rules always fit.

## When it turns on

1. You send a request.
2. If the request already fits, it goes to the model unchanged. No extra retrieval, no extra summary, no extra cost.
3. If it would be too large, the Context Extender assembles a bounded working set.
4. The engine works from that working set and returns your result.

## What goes into the working set

| Layer | What it is | Why it matters to you |
| --- | --- | --- |
| **Recent thread, word for word** | The latest stretch of the conversation | The engine works from what you just said, not a paraphrase |
| **Summary of older work** | One rolling summary of what fell out of the live window | Continuity without paying again for every old paragraph |
| **Matching older pieces** | A handful of earlier passages that match this request | Reach across the whole corpus without loading it |

Retrieval is scoped to your workspace, thread and task, and stops when the budget is used. The aim is the right few pieces under a hard cap, never a dump of the archive.

## Cost and speed

Model cost grows with the amount of text sent on each call. Sending the whole corpus every time would make cost and wait time grow with the size of your work.

With the Context Extender, each call carries a bounded working set, plus an occasional retrieval or summary step only when a request overflows. You keep capable models for reasoning instead of using them as a filing cabinet.

## How each engine benefits

| Engine | Without the extender | With the extender | Everyday example |
| --- | --- | --- | --- |
| **TaskForce** | Early constraints drop out, or every step is handed the whole history | The summary keeps the mission; each step gets only what its part of the job needs | "Continue last month's launch program; today is only the pricing page." Pricing decisions are retrieved, not the whole archive. |
| **Code** | The model sees a random tail of files and makes confident, wrong edits | Recent edits stay word for word; retrieval brings the modules that match the request | "Fix the billing webhook; don't touch onboarding." Billing code enters the prompt; onboarding stays in the corpus. |
| **Research** | Old sources vanish or are fetched again; updates lose original citations | Stable extracts stay addressable and matching ones return for the new question | "Same topic, new angle, don't lose the primary sources." |
| **Cicero** | Early standing instructions fall out mid-matter | The summary preserves standing instructions; retrieval pulls the clauses relevant to this draft | "Fifth revision of the DPA; keep the posture from revision one." |

Artificial Experience may skip re-fetching a stable source. The Context Extender makes sure that source can still enter the prompt when the thread is already huge.

## Context Extender and Artificial Experience

| | Artificial Experience | Context Extender |
| --- | --- | --- |
| **Job** | Do not redo paid work | Do not overflow the model |
| **Default** | On, when there is something to remember | Off, until a request would overflow |
| **Benefit to you** | Cheaper and more consistent | Still correct on month-long threads |

Both can act on the same request. Memory is recalled first; the extender then keeps the final request within budget.

## Guarantees

- **No change for short chats.** Requests that already fit are sent as they are.
- **Hard budget.** The working set never crowds out the instructions that keep the engine correct.
- **Scoped retrieval.** Retrieval never reaches into another customer's corpus.
- **Your request still runs.** If assembly fails, the request falls back to ordinary trimming of older history instead of failing.
- **Each step gets a slice.** In multi-step work, each step receives what its part needs, not the whole archive.
- **Live data stays live.** The extender never freezes prices or clocks; freshness is handled when data is fetched.

## Limits

- Not unlimited context as a model feature.
- Not 2 to 5 million tokens sent to a model in one call.
- Not a replacement for [Artificial Experience](/aselius-platform/docs/artificial-experience).

> **Note:** Very old details are reached through the summary and retrieval, not word for word. If a specific earlier detail matters, name it in your request so retrieval can find it.

## Related

- [Artificial Experience](/aselius-platform/docs/artificial-experience)
- [Workspace](/aselius-platform/docs/workspace)
- [Rivine TaskForce](/aselius-platform/docs/rivine-taskforce)
- [Rivine Code](/aselius-platform/docs/rivine-code)
- [Rivine Research](/aselius-platform/docs/rivine-research)
- [Rivine Cicero](/aselius-platform/docs/rivine-cicero)
