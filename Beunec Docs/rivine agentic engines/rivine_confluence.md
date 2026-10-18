# Rivine Confluence

Rivine Confluence is the Aselius engine for forecasting and scenario questions about a specific country. It works by one rule: **models choose the evidence, code computes the numbers**, so every figure you receive can be checked against the data it came from.

## At a glance

- **What it is:** a Rivine engine for country forecasts, scenarios and SDG target checks, in Aselius Workspace.
- **Best for:** ministries, central banks, statistical offices, development agencies and analysts who need an auditable baseline.
- **You get:** two fully sourced scenario reports and an interactive reconciliation dashboard, each with the complete calculation ledger.
- **Sources:** UN System Data Commons, World Bank, WHO, UN Statistics Division, UN World Population Prospects, IMF, UNDP, Our World in Data, Google Data Commons.
- **Where:** choose **Rivine Confluence** in the Taskspace input bar. It is never picked for you.
- **Cost:** $5 minimum prepaid balance to start a turn, the same on every plan.

## What you can ask

Confluence answers questions about one country's indicators, for example population, maternal mortality, life expectancy, growth, inflation or debt.

- "Project Nigeria's population to 2035."
- "Project maternal mortality in Nigeria to 2030. Is the SDG target reachable?"
- "Project life expectancy in the State of Palestine to 2030."

## Why the numbers come from code

A language model can choose the right data and still write down the wrong number. For a projection that a central bank or statistical office may use as a baseline, one wrong digit is a defect. Confluence removes that risk by never letting a model do the arithmetic.

1. Every value the engine retrieves is recorded, exactly as the publisher returned it, in the turn's evidence ledger.
2. Every projection, interval, target gap, scenario path and cross-publisher comparison is computed by deterministic code from those recorded values. A model never re-types a number.
3. The ledger (the data, the fitted equations, the parameters and the results) is attached to all three deliverables by code, not written by a model.
4. Where a narrative and the ledger differ, the ledger is the record, and each deliverable says so.

## The three deliverables

| Deliverable | What it contains |
| --- | --- |
| **UN-grounded scenario report** | The historical baseline from the UN System Data Commons, with the projection, interval and target gap computed from it. |
| **Cross-publisher scenario report** | The same question checked against statistical publishers outside the UN graph, with comparable indicators chosen for each. |
| **Reconciliation dashboard** | An interactive dashboard that brings both reports together, shows where publishers agree or disagree, and audits every source. It reconciles; it does not re-forecast. |

Every deliverable carries the full calculation ledger. The dashboard shows the ledger's numbers exactly: no later formatting or design pass rewrites them.

## How projections are made

| Step | What it means for you |
| --- | --- |
| **History only** | Only observed history is fitted. A publisher's own projections (for example UN World Population Prospects after its last estimate year) are shown beside the result as a comparator, never treated as history. |
| **Model chosen by backtest** | Several standard trend models are fitted. The one that best predicts held-back recent observations wins, not the one that fits history most closely. |
| **95% prediction interval** | Each projection comes with a 95% interval that accounts for year-to-year correlation in the data. |
| **Model uncertainty** | The spread of all trend models for the target year is shown beside the interval. |
| **Structural break check** | If the latest value sits far from the trend (a war, an epidemic, a data revision), the result says the trend assumes a recovery the evidence has not yet shown. |
| **SDG target gap** | Uses the SDG annual rate of change convention: observed pace against required pace, the value at the target year on current pace, an on-track flag and years to target. |
| **Scenarios** | The model states each assumption (a rate and the reason for it). Code computes the path, and the result is labelled assumption-driven. |

## How disagreement is reported

Confluence never hides a disagreement between publishers, and it never picks a winner.

- **Within range or DIVERGENT.** Projections for the same indicator and target year are compared by a fixed rule. They are marked **DIVERGENT** when their 95% intervals do not overlap, or when a figure without an interval falls outside the others' common range. Otherwise they are marked **within range**.
- **Units are aligned first.** When a publisher reports in a different scale (for example population in millions rather than persons), its figures are rescaled before comparing, and the rescale is disclosed. A units difference never reads as a disagreement.
- **Republished numbers are named.** When several portals report identical numbers from one origin, Confluence says so. Three portals are not three confirmations.
- **Verdicts are quoted, never imitated.** Verdicts from the UN data verification service are quoted exactly as returned. A status label a model writes on its own is removed.

## Source audit

Every source gets a status computed by fixed rules, never by a model.

| Status | Meaning |
| --- | --- |
| **PASS** | Enough recent history, on the same unit scale as other publishers, and close to them in the latest common year. A publisher's official projection variant is a PASS used as a comparator. |
| **NEEDS REVIEW** | Too little history, a latest value that is several years old, a different unit scale from other publishers, or a figure materially away from theirs. |
| **FAIL** | The retrieval itself failed. This is never treated as evidence that the figure does not exist. |
| **Not covered** | The source holds nothing for this question. This is not a failure. |

> **Note:** If a source is unavailable or not set up for your workspace, the deliverables say so plainly rather than filling the gap.

## Sources

| Source | What it contributes |
| --- | --- |
| UN System Data Commons | The historical baseline, with verification verdicts and lineage |
| World Bank data portal | Development and economic indicators |
| WHO Global Health Observatory | Health indicators, with WHO's published bounds |
| UN Statistics Division SDG database | SDG indicator series, with published bounds |
| UN World Population Prospects | Population estimates and official projection variants |
| IMF World Economic Outlook | Macroeconomic indicators and forecasts |
| UNDP Human Development Reports | Human development indicators |
| Our World in Data | Republished series, identified as republished |
| Google Data Commons | Additional series, with the original publisher named for each |
| Humanitarian Data Exchange (HDX) | Catalogue of coverage and provenance, not numeric series |

## Reuse and freshness

Confluence remembers series it retrieved recently (up to 12 hours, within your workspace) and reuses them, disclosing the reuse. Say "live", "latest" or "refresh" in your request to fetch everything again. It also recalls earlier turns in the same taskspace through [Artificial Experience](/aselius-platform/docs/artificial-experience).

## Limits

- **One country per question.** Confluence is built for country-level indicators.
- **Trends assume continuation.** A projection extends observed history; structural breaks are flagged, not predicted.
- **Scenarios are assumptions.** Scenario paths are only as good as the stated assumptions, which are shown with each one.
- **Own sources only.** Confluence does not use your connected apps, connectors or user-selected tools.
- **Long turns.** If a turn runs out of time, an unfinished part is reported as unfinished and finished work is kept. If the dashboard cannot be built, the two scenario reports are still delivered.
- **Scheduling.** Confluence can run on a schedule in [Automation](/aselius-platform/docs/automations), reading public sources only.

## Related

- [Rivine Research](/aselius-platform/docs/rivine-research)
- [Automation](/aselius-platform/docs/automations)
- [Artificial Experience](/aselius-platform/docs/artificial-experience)
- [Plans & Pricing](/aselius-platform/docs/plans-pricing)
