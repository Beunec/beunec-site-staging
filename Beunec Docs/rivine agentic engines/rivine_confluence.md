# Rivine Confluence

**Aselius Workspace · engine key `rivine_confluence`**

Confluence answers forecasting and scenario questions about a specific country — population, maternal mortality against an SDG target, life expectancy, growth, inflation, debt — with three agents and one rule: **models choose the evidence; code computes the numbers.**

- **Lumo** grounds the historical baseline through the SAGE-Commons UN Data Commons engine.
- **Goto** cross-checks it against eight statistical publishers outside that graph.
- **Uno** waits for both and reconciles them into an interactive dashboard, without re-forecasting.

Every projected figure, interval, target gap and cross-publisher comparison is produced by a deterministic projection engine from the exact values a retrieval returned, and recorded in a computation ledger that code attaches to all three deliverables.

---

## Why the numbers come from code

The first live runs used the design of the original JavaScript reference, in which the model derives the projection itself. It was mostly right, and wrong where it matters: DeepSeek at `xhigh` wrote 237,527,782 × 1.026⁵ = **270.7M** (correct: 270.06M) and published a "low" case above its own central case. For output that a central bank or statistical office may use as a baseline, one wrong digit is a defect. So:

1. Every retrieval tool **registers** what it fetched in the turn's evidence ledger and returns a `series_id`.
2. The computation tools (`project_series`, `target_gap`, `apply_scenarios`, `compare_series`) read the series back **by id** — the model never re-types a number.
3. The ledger — inputs, fitted equations, results — is appended to Lumo's and Goto's markdown and to Uno's dashboard **by code**. Where a narrative and the ledger differ, the ledger is the record, and each deliverable says so.

## The projection engine (`rivine_confluence/projection.py`)

Pure Python, no numerical dependencies, identical on every host. Validated against numpy and closed forms to ~1e-13.

| Step | What it does |
| --- | --- |
| History only | Fits only historical values. Values after a publisher's last estimate year are its own projections (UN WPP 2024: after 2023) and are kept as a **comparator**, never fitted. Values dated after the latest complete year are excluded. |
| Three models | Linear OLS; log-linear OLS (constant proportional growth); constant compound rate between the window's endpoints. Default window: the last 20 years. |
| Selection by backtest | The last 2–5 observations are held out; each model is refit on the rest; the lowest out-of-sample MAPE wins. Not in-sample R². |
| 95% prediction interval | ŷ(x₀) ± t(0.975, df) · s · √(1 + 1/n + (x₀ − x̄)²/Sxx), widened by √((1+ρ)/(1−ρ)) for lag-1 residual autocorrelation ρ, with df from the effective sample n(1−ρ)/(1+ρ). Log-linear intervals are computed in log space (asymmetric). |
| Model uncertainty | `method_range`: where all three models land for the target year, shown beside the interval. |
| Structural break | How far the latest observation sits from the fitted trend, in residual standard deviations. Beyond ±3σ (a war, an epidemic, a revision) the result says the trend assumes a reversion the evidence has not shown. |
| Target gap | SDG convention: annual rate of change ARR = ln(y₁/y₀)/(t₁−t₀). Observed vs required pace, value at the target year on current pace, on-track flag, years to target. |
| Scenarios | The model states each assumption (a rate and why); code computes the path. Labelled ASSUMPTION_DRIVEN. |
| Comparison | Cross-publisher agreement on overlapping years. |

### Reconciliation — by rule

Projections are grouped by (metric, target year). Before comparing, rows reported in a different unit scale are rescaled onto the scale most of the group shares, and the rescale is disclosed (IMF WEO reports population in **millions**, everyone else in persons — without this, a units difference reads as a 100% disagreement). The group is **DIVERGENT** when two or more 95% intervals share no common overlap, when a projection without an interval falls outside the common interval of those that have one, or — if none has an interval — when central values spread more than 5%. Otherwise it is **within range**.

### Publisher audit — by rule

Each source gets a status computed by fixed rules, never by a model:

| Status | Rule |
| --- | --- |
| **FAIL** | The retrieval failed (host down, 4xx/5xx). Never evidence that the figure does not exist. |
| **NEEDS_REVIEW** | Fewer than 5 historical values; latest historical value more than 5 years old; a different unit scale from the other publishers of the metric; or more than 5% away from them in the latest common year. |
| **PASS** | None of the above. A publisher's official projection variant (e.g. WPP Low-fertility, 95% bounds) has no history by design and is a PASS used as a comparator. |

Also reported: sources whose numbers are **identical** to another publisher's (one origin behind several portals — not independent confirmation; live, World Bank, UN WPP and the UN graph report the same Nigeria population to 2e-9), and re-publishers (OWID, Data Commons). A source that simply holds nothing for the question is `NOT_COVERED`, not a failure.

## Two vocabularies

SAGE-Commons' verdicts — CORROBORATED, CONTESTED, SINGLE_SOURCE, INCOMPARABLE, NO_EVIDENCE, NEEDS_REVIEW, PASS, FAIL — come from a hash-pinned, model-free comparator. A model writing one as its own conclusion would counterfeit it. The guard (`reserved_vocabulary.py`) is precise, not blunt:

- a verdict the engine actually returned this turn is a quotation — kept;
- FAIL/FAILED beside retrieval wording is a retrieval status — kept;
- PASS / NEEDS_REVIEW / FAIL that the code audit produced this turn — kept in Uno's dashboard;
- anything else — redacted.

The JavaScript reference used a blunt regex that also rewrote genuine engine quotes and "retrieval FAILED"; that was found live and replaced.

## Agents, models, reasoning

| Agent | Model (Fireworks) | Effort | Tools |
| --- | --- | --- | --- |
| Lumo | DeepSeek V4.1 Flash | high | SAGE-Commons engine (`resolve_indicator`, `ground_claim`, `analyze_trend`, `check_coverage`), `un_data_commons_supplement`, computation tools |
| Goto | DeepSeek V4.1 Flash | high | World Bank, WHO GHO, UNSD SDG, OWID, UNDP HDR, IMF WEO, UN WPP 2024, Google Data Commons, HDX, UN location lookup, computation tools |
| Uno | GLM 5.3 Flash | medium | none — its evidence is the two scenarios and the ledger |

Each falls back to Grok 4.7 → GPT-5.6 Terra → Muse Spark 1.3. Pricing: DeepSeek V4.1 Flash $0.22 / $0.007 cached / $0.66 per 1M tokens; GLM 5.3 Flash $0.15 / $0.03 / $0.50. Each agent bills under its own role (`sub_agent_scope`), and all three fold into the `rivine_confluence` group in Observability.

**Why these efforts.** Lumo was `xhigh` to get the projection equation right; code does that now, and `xhigh` cost ~48% more latency per call (59 s vs 40 s in a live probe). Goto stays `high`: choosing comparable indicators across eight publishers is the most judgment-heavy step. Uno went to `medium`: it renders a pre-computed, pre-reconciled ledger, and depth there bought latency, not accuracy. `xhigh` is a real, distinct Fireworks tier on this model (verified live), but no role uses it now.

### Lumo and Data Commons

Google Data Commons does not serve the UN Data Commons `undata/…` namespace, but it does hold UN SDG-portal series (`sdg/…`, provenance `unstats.un.org`) that parallel SAGE's `undata/sdg/…` ids. Lumo's `un_data_commons_supplement` keeps **only facets whose provenance is a UN-system domain** (un.org, who.int, unicef.org, unfpa.org, …); World Bank and IMF facets are excluded — those are Goto's. It is required when `analyze_trend` returns no series or the engine reports a single independent origin, and optional otherwise; it is often an older vintage than the engine (the audit flags that). Goto's `google_data_commons` keeps every facet and names the original publisher behind each. The API key travels in the `X-API-Key` header, never the URL, so it can never appear in provenance, model context or a deliverable.

## Sources, as implemented

| Source | Access | Notes |
| --- | --- | --- |
| SAGE-Commons MCP | public JSON-RPC | engine verdicts, lineage, receipts, full historical series |
| World Bank | public | every page |
| WHO GHO | public | split by dimension; WHO's own published bounds as separate series |
| UNSD SDG | public | `Indicator/List` → series code → `Series/Data` by M49 area code, all pages, with published bounds |
| OWID | public CSV | every row, every value column, ISO3 **column** match (a substring match for "NGA" also hits "HUNGARY") |
| UNDP HDR | public CSV | every indicator of the country's row as its own series |
| IMF WEO | public | units from IMF's own indicator metadata |
| UN WPP 2024 | bearer token (`UN_POP_DIV_TOKEN`) | every page, one series per projection variant (Median, 80%/95% bounds, fertility variants) |
| Google Data Commons | API key (`DATACOMMONS_API_KEY`) | header auth |
| HDX | public | catalogue (coverage and provenance), not a numeric series |

What the JavaScript port got wrong and live testing caught: IMF 403s were caused by a spoofed desktop-browser User-Agent (an honest UA gets 200 everywhere); the UNSD route was a 404; OWID kept the *first* 90 rows (1800–1889 for a population series); UN WPP kept page 1 of 684 rows and mixed 17 variants; WHO kept 120 rows. Nothing is truncated now.

## Artificial Experience and the context extender

- **Cross-turn recall and the bounded working set** arrive in `conversation_context`, the same builder every engine uses.
- **Within-turn compaction and context hygiene** run inside the REAI loop.
- **Reuse of retrieved series.** The platform's dispatcher-level tool cache skips executing a tool on a hit, which would leave the series unregistered in the turn's ledger. Confluence instead stores the parsed, country-filtered series as an Artificial Experience fragment (12 h, tenant-scoped, schema-versioned) and **re-registers** them on a hit, with the reuse disclosed. Saying "live", "latest" or "refresh" bypasses it.

## Long-horizon execution

Confluence is a two-stage pipeline and continues at the stage boundary, like Research ([Long_Horizon_Execution.md](./Long_Horizon_Execution.md)).

- **Continuation on:** with less than `RIVINE_CONFLUENCE_SYNTHESIS_RESERVE_SECONDS` (300) left after the scenarios, both finished scenarios and the whole ledger are handed off (`engine_resume`, stage `synthesis`) and Uno runs in the next invocation. The scenario loops run concurrently and are not individually yieldable.
- **Continuation off (production today):** the scenario stage is bounded to leave Uno its reserve, and Uno is bounded by the time actually left. An agent stopped at its bound is reported as unfinished and its partner's work is kept; if Uno cannot run, the two scenarios are delivered.
- **Lambda.** The function timeout is 900 s. Live turns run in roughly 5–7 minutes (see below), and the bounds make a turn end cleanly before the limit even on a slow-provider day.

## Other decisions

- **No E2B sandbox.** Uno's output is a self-contained HTML fragment rendered by the frontend's `HtmlEditorPreview`: an opaque-origin shell, content delivered by `postMessage`, `sandbox` without `allow-same-origin`. Nothing needs executing server-side. The TaskForce-only UI enhancement pass never rewrites a Confluence dashboard, so the ledger's numbers are the ones shown.
- **Pin-selectable only.** Confluence is in the engine dropdown; you choose it directly rather than it being inferred from an ordinary research question, since it is a specialised, higher-cost engine.
- **Own tools only.** Never merged with the general grounded-data catalog, user-selected tools or app connectors.
- **Credits:** $5 minimum (backend `credits_billing.py`, frontend `creditConfig.ts`).
- **Entity gate.** The platform's "unresolved product name" gate paused a live turn for 12 minutes asking for a product page for "Annualised rate 2.56". Confluence's agents are exempt, like Cicero's; every figure they cite is verified through their own tools.

## Live verification (2026-09-27)

Real Fireworks models, the live SAGE-Commons engine and every live publisher API; `benchmarks/confluence_live_harness.py --task all`.

| Question | Total | Scenarios / Uno | Result |
| --- | --- | --- | --- |
| Project Nigeria's population to 2035 | 370 s | 119 s / 251 s | 5 projections, **within range** (0.41% spread). IMF's `LP` (millions) rescaled ×1e6 and disclosed. Central ≈ 283.4–284.3M; UN WPP's own 2035 projection 287.7M shown as the comparator. |
| Project maternal mortality in Nigeria to 2030; is the SDG target reachable? | 267 s | 77 s / 190 s | 4 projections, **within range** (4.5%). Latest 992.8 per 100,000 (2023). Observed pace −1.6%/yr against the −37.9%/yr required for 70 by 2030: **off track**. Lumo used the UN-only Data Commons supplement (single-origin engine result). |
| Project life expectancy in the State of Palestine to 2030 | 353 s | 123 s / 230 s | 9 projections, **DIVERGENT**: UNICEF's constant-rate path (73.44) falls outside the common 95% interval. The 2023 value sits −3.7σ from trend and is flagged as a possible structural break on every projection built on it. |

Every run: all three deliverables produced; every projected central value appears, formatted identically, in the dashboard; no computation failed; no retrieval failed (IMF included); zero counterfeit verdicts to redact. Provider cost ≈ $0.07–0.08 per turn before the platform markup.

Earlier runs, and what they fixed: 765 s ending in a false 12-minute "unresolved entity" pause (entity gate exemption); 352 s with model-typed arithmetic errors (deterministic engine); a false 100% divergence from mixed units (scale-aware reconciliation); model-invented PASS/FAIL badges (deterministic audit).

Unit tests: `tests/test_rivine_confluence.py` (29) — math against closed forms and the textbook interval formula, t-quantiles, history/projection separation, structural breaks, reconciliation and audit rules, unit rescaling, the vocabulary guard, the ISO3 column match, experience reuse re-registering series, the stage hand-off and resume, the time bound, and orchestration. Full backend suite: 1605 passed, 0 failed.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `DATACOMMONS_API_KEY` | — | Google Data Commons (Goto; Lumo's UN-only supplement). Absent → `NOT_CONFIGURED`, reported plainly. |
| `UN_POP_DIV_TOKEN` | — | UN WPP data endpoint (bearer). Absent → `NOT_CONFIGURED`. |
| `RIVINE_CONFLUENCE_SYNTHESIS_RESERVE_SECONDS` | `300` | Uno's time reserve (see Long-horizon). |
| `RIVINE_CONFLUENCE_REUSE_TTL_HOURS` | `12` | Artificial Experience reuse window for retrieved series. |
| `RIVINE_CONFLUENCE_MCP_URL` | `https://sagecommon.soculink.com/mcp` | SAGE-Commons engine. |

## Code map

`Aselius-Workspace/aselius_workspace/aselius_agentic_engines/rivine_confluence/`: `agent.py` (orchestration, stage hand-off, time bounds), `tools.py` (retrieval + computation tools, Data Commons, reuse), `projection.py` (the mathematics), `ledger.py` (reconciliation, audit, rendering), `run_context.py` (the evidence ledger), `reserved_vocabulary.py`, `llm_system_instructions/` (the three agents' instructions). Tests: `tests/test_rivine_confluence.py`. Live harness: `benchmarks/confluence_live_harness.py`.

---

## Publication-ready summary

_Copy/paste section for public communication._

### Rivine Confluence: forecasts you can audit

Most AI forecasting has one weakness, and it's not the model. It's the arithmetic. A language model can reason well about which data to use and still write down the wrong number. For a ministry, a central bank or a development agency, a projection with one wrong digit can't be used.

Rivine Confluence is built on a simple rule: **AI chooses the evidence, and deterministic code computes the numbers.**

**How it works**

- **Three specialist agents.** *Lumo* grounds the historical record through the UN System Data Commons, via the SAGE-Commons verification engine. *Goto* cross-checks it against the major publishers outside that graph: the World Bank, WHO, the UN Statistics Division, UN World Population Prospects, the IMF, UNDP, Our World in Data and Google Data Commons. *Uno* reconciles both views into an interactive dashboard.
- **Numbers from code, not from the model.** Every figure the agents retrieve goes into an evidence ledger, and every projection is computed from those exact values: trend models chosen by out-of-sample backtesting, 95% prediction intervals that account for autocorrelation, tests for structural breaks, and SDG target-gap arithmetic. The AI never re-types a number.
- **Disagreement is shown, not hidden.** When publishers disagree, Confluence says so by a fixed rule, with intervals. When several "sources" are the same numbers republished, Confluence says so too. Three portals are not three confirmations.
- **Every source is audited.** Each dataset is marked PASS, NEEDS REVIEW or FAIL by published, deterministic criteria, and the UN verification engine's own verdicts are quoted, never imitated.
- **History and projection are kept apart.** A publisher's own forecast is never treated as observed history. It's shown next to Confluence's projection as a comparator.

**What you get:** two fully sourced scenario reports and a reconciliation dashboard. Each carries the complete computation ledger: the data, the equations, the fitted parameters and the results, so any analyst can check any number.

Rivine Confluence is part of the Rivine engine family in the Aselius Workspace by Beunec Technologies.
