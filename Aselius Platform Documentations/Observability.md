# Observability

**Aselius Platform · live today**

Observability is the measurement layer of the Rivine runtime. It records what every engine turn actually did (success and failure, tokens, cost, latency, Artificial Experience activity) and serves that record to you without exposing conversation content.

## What you see

- Per-turn and roll-up metrics for **your** operations: success, failure, retry counts, tokens, cost, latency
- Artificial Experience activity (kinds of events, not a black box)
- Tool and service activity where it applies to your workspace

What you do **not** see (by design): raw provider/model ids that belong to Beunec’s operations view, and **never** conversation content: none is stored in the observability tables.

## Why it exists

Governed AI work needs an honest ledger. When a turn succeeds on a retry, burns credits, or spends Artificial Experience, Observability makes that visible so teams can audit cost and reliability without reading private prompts.

## Where it lives

Observability is a first-class app surface on Aselius today, beside Workspace, Automation, and Manage Teams. Open it from the platform rail while signed in at [aselius.beunec.com](https://aselius.beunec.com).

## Related

- [Aselius Workspace](/aselius-platform/docs/workspace)
- [Artificial Experience](/aselius-platform/docs/artificial-experience)
- [Plans & Pricing](/aselius-platform/docs/plans-pricing)
- [Security Disclosure](/aselius-platform/docs/security-disclosure)
