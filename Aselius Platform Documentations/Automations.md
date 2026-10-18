# Automation

Automation is the Aselius app for scheduled engine runs. A run happens in the cloud on your schedule, whether or not your computer is on, and every result is checked independently before it is marked as succeeded.

## At a glance

- **What it is:** scheduled, unattended runs of a Rivine engine, part of Aselius.
- **Engines:** Rivine Research, TaskForce, Cicero and Confluence. Browse, Code and Assist cannot be scheduled.
- **Safety:** reads public sources only, never acts on your accounts, and starts only after a test run passes.
- **You get:** a fresh taskspace per run, marked **Succeeded** or **Needs review**, with a notification.
- **Cost:** billed to your credits at each engine's usual start floor.
- **Where:** open **Automation** from the platform rail at [aselius.beunec.com](https://aselius.beunec.com).

## Which engines can be scheduled

| Engine | Can be scheduled | What an unattended run does |
| --- | --- | --- |
| Rivine Research | Yes | Observes, researches and saves cited briefs |
| Rivine TaskForce | Yes | Briefings and structured deliverables |
| Rivine Cicero | Yes | Regulatory watch and drafts for your review. It never files or signs anything. |
| Rivine Confluence | Yes | Refreshes forecasts and scenarios |
| Rivine Browse | No | Needs your own browser and signed-in sessions on your device |
| Rivine Code | No | Useful scheduled work would need write access to your repository |
| Rivine Assist | No | Edits the document on your screen, so it is interactive by nature |

## Setting up an automation

Each automation has an engine, a goal, a budget and a schedule. You can start from a template or write your own.

1. **Create it as a draft.** Choose the engine, describe the goal, set a budget and a schedule (recurring or one time).
2. **Run a test.** The test run uses exactly the engine, goal and budget you set.
3. **Activate it.** An automation becomes active only after a test of this exact setup passes, or after you review and approve a test result that was held for review.
4. **Let it run.** Scheduled runs start at each time you set.

> **Note:** Changing the engine, goal or budget returns the automation to draft, and it needs a new passing test. Changing only the schedule does not.

## How a run happens

1. **Checks before starting.** The automation must be active and unchanged since its passing test, and your balance must meet the engine's [start floor](/aselius-platform/docs/plans-pricing).
2. **A fresh taskspace.** Each run starts a new engine turn in its own taskspace, with a short summary of the previous result for continuity.
3. **No connectors.** A run can read public sources and create work in your workspace. It never connects to or acts on your accounts or connected apps.
4. **Independent check.** Automatic checks run first, then an independent review that sees the goal and the result but not the engine's reasoning.
5. **Result and notification.** A run that passes is marked **Succeeded**; otherwise it is marked **Needs review**. You are notified either way, and the run's status, timing, cost and taskspace are kept in the automation's history.

## Retries and pausing

| Situation | What happens |
| --- | --- |
| Temporary error | Retried twice, a few minutes apart |
| Out of credits | The run stops and the automation pauses |
| Refused by policy | The run stops and the automation pauses |
| Three consecutive failures | The automation pauses |

You can pause an automation yourself at any time, and edit or delete it.

## Lifecycle

| State | Meaning |
| --- | --- |
| **Draft** | Being set up or edited. Does not run on its schedule. |
| **Active** | Passed a test of its current setup. Runs on schedule. |
| **Paused** | Stopped by you, by a credit or policy stop, or after three consecutive failures. |
| **Completed** | A one-time automation that has run. |

## Billing

Each run is billed to your prepaid credits like any other engine turn, at the same per-engine start floor as the web app. See [Plans & Pricing](/aselius-platform/docs/plans-pricing).

## Related

- [Aselius Workspace](/aselius-platform/docs/workspace)
- [Rivine Research](/aselius-platform/docs/rivine-research)
- [Rivine Confluence](/aselius-platform/docs/rivine-confluence)
- [Observability](/aselius-platform/docs/observability)
- [Plans & Pricing](/aselius-platform/docs/plans-pricing)
