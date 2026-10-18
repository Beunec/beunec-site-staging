# Aselius cloud automations

Scheduled engine runs that happen whether or not the person's computer is on. Built as a platform capability: agents do not own a scheduler; they are woken by one, inside a fixed envelope.

## Which engines

| Engine | Schedulable | Unattended scope |
| --- | --- | --- |
| Rivine Research | Yes | Observe, research, save cited briefs |
| Rivine TaskForce (`rivine_chat`) | Yes | Briefings and structured deliverables |
| Rivine Cicero | Yes | Regulatory watch, drafts for review (never files or signs) |
| Rivine Confluence | Yes | Forecast and scenario refreshes |
| Rivine Browse | No (runs on the device) | Needs the person's own browser and sessions |
| Rivine Code | No | Scheduled value needs repository write access |
| Rivine Assist | No | Edits the document on screen; interactive |

Contracts live in `aselius_workspace/automations/contracts.py`.

## How a run happens

1. **Tick.** The Lambda's EventBridge rule (every minute) posts to `/events`; `runner.tick()` claims due automations (`FOR UPDATE SKIP LOCKED`), inserts one run per slot (unique `logical_key` = automation + scheduled time) and advances `next_run_at`. Locally, the same tick runs every 60 s (`AUTOMATIONS_LOCAL_TICK=0` turns it off).
2. **Dispatch.** Each run is sent to its own async self-invocation (a `rivine_automation` event, HMAC-signed with the continuation secret, valid for an hour).
3. **Preflight.** The automation must be active and its spec (engine, goal, budget) must equal the one that passed a test run. Credits are checked with the engine's own floor.
4. **Run.** A fresh engine turn in a new taskspace, through the platform's normal turn runner, with **no connectors bound** (the per-run capability token: observe and create in the workspace, nothing external), the unattended-run contract, and a short summary of the previous result. Long turns continue across invocations as usual.
5. **Verify.** Mechanical checks, then an independent check that sees the contract and the result but not the executor's reasoning. Pass: `succeeded`. Otherwise: `needs_review`.
6. **Record and notify.** The run ledger (`automation_runs`) keeps status, timing, cost, verdict and the taskspace; the automation's working state keeps the last result's digest and excerpt. A realtime event goes to the person.

Failures: transient errors retry twice (2 and 4 minutes later); out of credits and policy refusals stop and pause the automation; three consecutive failures pause it.

## Lifecycle

`draft` → test run → `active` (only after a passing test of this exact spec, or the person's approval of a held result) → scheduled runs → `paused` / `completed` (one-time). Editing engine, goal or budget returns it to `draft`; changing only the schedule does not.

## API

Web app (`/api/automations`, workspace members): `GET /contracts`, `GET /templates`, `GET/POST /`, `GET/PUT/DELETE /{id}`, `POST /{id}/test`, `POST /{id}/activate[?approve_review=true]`, `POST /{id}/pause`.

Rivine Browse panel (`/api/browse/...`, Browse token, runs in the Browse workspace): `GET /templates`, `GET/POST /automations`, `PUT/DELETE /automations/{id}`, `POST /automations/{id}/{test|activate|approve|pause}`.

## Tests

`tests/test_automations.py` (schedules, contracts, the store with Postgres, retries, review approval). The live path (a real engine turn, a real tick) was exercised against the local stack; see the paper's §3.2.
