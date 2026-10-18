# Iatrogenic Failure Cascade in Agentic Systems

**Research note · Aselius Workspace / Rivine engines · September 2026**

*Iatrogenic* (medicine): harm caused by the treatment rather than the disease.

## Definition

An **Iatrogenic Failure Cascade (IFC)** is a failure mode of long-running, tool-using LLM agents in which the system's own recovery machinery (error surfacing, corrective nudges, retries, provider failover, turn restarts, context compaction, failure-weighted memory) deposits *failure residue* into the model's working context. The model conditions on that residue, which makes the next failure more likely, which triggers more recovery, which deposits more residue. The loop closes **across layers** that were each designed and tested in isolation:

```text
provider layer      a transient 429 or a rejected request
      │ recovery:   failover to another model family / restart mid-turn
      ▼
runtime layer       restart notice, "tool failed" strings, stubbed tool results,
      │             a nudge telling the model it forgot something it was prevented from finishing
      ▼
reasoning layer     the next model call reads all of it as evidence about the task
      │             → hedges, repeats, abandons a working approach, or stops
      ▼
memory layer        the episode is consolidated as "did not work before"
      │             → injected into the NEXT turn's prompt as a lesson
      └────────────► more failure-shaped context, on a different model, next time
```

No single component is broken. Each one does what it was built to do. The failure is the **entanglement**: remedies designed for one layer become inputs to another.

## Why it needed a name

It is adjacent to, but distinct from, several known phenomena:

| Known phenomenon | What it describes | Why IFC is different |
| --- | --- | --- |
| Context rot / long-context degradation | Quality falls as context grows | IFC is about *what* accumulates (the system's own failure text), not how much; it appears in short contexts too |
| Context poisoning | A wrong fact or hallucination enters context and is reused | In IFC the injected text is *true* ("the call failed"); it is harmful because it is about the platform, not the task |
| Self-conditioning on errors | A model's own earlier mistakes raise its later error rate | IFC's residue is mostly written by the *runtime*, not the model, and it crosses model boundaries through failover |
| Context collapse (ACE) | Iterative rewriting of a context erodes its detail | IFC is additive, not erosive: nothing is lost; noise is added |
| Retry storms / cascading failure (distributed systems) | Retries amplify load on a failing dependency | IFC amplifies *semantic* load on the model, not request load on the provider |

The defining properties: (1) the residue is produced by recovery mechanisms; (2) it is factually accurate; (3) it is about infrastructure rather than the task; (4) the feedback path crosses at least two of the provider, runtime, reasoning and memory layers.

## How it presented in production

Rivine engines "stopped" mid-task in ways that looked like model weakness. Tracing production turns found the recovery layers feeding each other:

- A single short rate-limit put the provider into a process-wide cooldown. Every concurrent turn and parallel sub-agent then skipped it: **23 of 31 provider hops in the sampled window were this synthetic "in cooldown" skip**, not a real failure of the turn that hopped.
- Mid-turn, a hop is not cheap: the turn restarted on a different model family, with a different transcript format and a lower reasoning level.
- The restart itself failed on some paths because the restart signal was raised from one import of the LLM module and caught under another (two module objects, two exception classes), so the "recovery" surfaced as a generic error.
- Reasoning loops appended the failure text and corrective nudges to the transcript; a reply cut at the provider's output ceiling was answered with "you forgot to call final_answer", which the model had not forgotten.
- Artificial Experience consolidated the episode as a failed approach and injected it into later turns as "did not work before", although the approach had never been the problem.

## Intervention

The design principle is a separation between the **durable record** and the **working context**:

1. **Classify before recovering.** Transient vs structural provider failures; the task's own errors (a failing test is the task speaking) vs platform failures (transport, sandbox, runtime). One shared taxonomy is used by the runtime and by memory.
2. **Recover low before recovering wide.** Same model first (bounded retry honouring `Retry-After`), then a lenient retry with a structurally repaired request, then failover. Cooldowns are scoped so one turn's transient failure does not become every turn's hop.
3. **Never edit the record; project the view.** The canonical transcript keeps everything. The model receives a deterministic projection on every call: superseded results collapsed, duplicates dropped, platform failures reduced to one line, answered nudges removed, old large observations masked when the context is long.
4. **Keep platform failures out of memory.** Consolidation never stores infrastructure failures as lessons; recall renders at most two relevant task failures.
5. **Remove the pressure that produces residue.** Turns continue across invocations at clean boundaries instead of being cut; truncated outputs get a truncation-specific instruction; unfinished work ends with an honest summary instead of a half-thought.

Implementation: `context_hygiene.py`, `failure_taxonomy.py`, `llm_utils.py` (same-tier retry, lenient retry, scoped cooldowns), `experience_engine.py`, `run_budget.py` / `turn_continuation.py`. See [Long_Horizon_Execution.md](./Long_Horizon_Execution.md).

### A hung model (live, 2026-09-26)

A Fireworks serverless model (Nemotron Lightning 3.5) was listed `READY` but answered nothing for over 30 minutes, while GLM 5.3 Flash on the same account replied in 3 s. The recovery layer turned one silent model into a stalled product:

| Recovery step | What it did to a hung model | Fix |
| --- | --- | --- |
| Same-model retry | Its wait cap counted only the sleeps between attempts, so a hung stream got three full 180 s timeouts: **9 minutes** before failover. | A timeout that already took ≥ 45 s is not retried on the same model; the turn fails over. Quick 429/5xx failures keep their retries. |
| Stream timeout | 180 s of silence before a hang was noticed. | 90 s on Fireworks streams, whose reasoning models stream their thinking as tokens (OpenAI/xAI streams, which can be silent while reasoning, keep 180 s). |
| Cooldown | Keyed by provider, so one hung model sent **every** Fireworks model in the process (GLM for Chat, Research, Code, the mediators) to its fallback. And being "transient", it was ignored mid-turn, so every loop step re-tried the hung model. | Transient cooldowns are keyed by provider and model; a timeout-class failure is a *hung* cooldown (300 s), honoured mid-turn too. Structural failures (suspended account, billing) still cool the whole account. |
| Turn continuation | Each new invocation started again on the role's primary, so the hang was paid again in every invocation. | The hand-off records the model the loop was running on (`reai_model_name`), and the next invocation continues on it. |
| History compaction | Its summariser defaulted to the hung model through a non-streaming call with a 480 s timeout, stalling a healthy agent for 8 minutes mid-research. | 60 s deadline; on timeout the summary model is marked hung so the next summary goes straight to its fallback. The loop keeps its full history either way. |

Each step was a correct recovery for a *busy* model and a harmful one for a *hung* model. The distinction is time already spent: a failure that cost the full timeout has already told you what a retry would.

## Measuring it

For a publication, the following are recorded without content:

- `context_hygiene` experience events: per call, how many messages each projection rule removed or collapsed (superseded, duplicate, infrastructure, nudge, masked).
- Provider attempt rows with reasons `same_model_retry`, `same_model_repair`, `provider_cooldown`: recoveries that did and did not become a hop.
- `turn_continuation` events: slices per turn.
- Turn outcomes: `success` vs `incomplete` (with `stop_reason`) vs `error`.

Suggested study: A/B the projection (on vs off) on a fixed task suite with injected platform faults (transient 429s, a failing connector, a sandbox restart), measuring task completion, steps to completion, and the rate at which a turn abandons a correct approach after a platform fault. The IFC hypothesis predicts the gap widens with the number of injected faults and with turn length, and is near zero with no faults.

## Limits of this note

The production figures above come from one system over one sampling window. Whether residue harms different model families equally, and how much of the effect is residue content versus residue volume, are open questions the measurements above are designed to answer.
