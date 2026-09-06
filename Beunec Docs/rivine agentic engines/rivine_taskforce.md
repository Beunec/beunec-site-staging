# Rivine TaskForce

## What it does (plain language)

Rivine TaskForce is Aselius's **action-oriented** workspace engine, not a generative chatbot, and the default engine you get when you open a new task. You describe the outcome you need; it does the work: pulls real data from connected apps, draws the diagram, builds the interactive page, runs the calculation, and returns something you can open, edit, and use immediately. Reach for it when you want a professional deliverable, not a text reply to read.

```mermaid
flowchart LR
    A[Your request] --> B[Connected apps + native specialties]
    B --> C[Diagram / document / video / computation]
    C --> D[Saved as workspace asset]
    D --> E[Open in Preview]
```

*Figure: TaskForce reaches for the right connected app or specialty, then hands you something to open, not a reply to read.*

## How it works

TaskForce is the general-purpose engine of the Rivine family, and deliberately the least narrowly specialized. What distinguishes it from "a chatbot with tools" is that it has access to the same breadth of connected apps and grounded data sources as the domain engines, and reaches for the right combination rather than defaulting to one generic search path: a specialized, authoritative source when one exists for the question, a general lookup when it doesn't.

```mermaid
flowchart TD
    A[Your request] --> B{Specialized source available?}
    B -->|Yes| C[Authoritative / connected path]
    B -->|No| D[General grounded lookup]
    C --> E{Lookup succeeds?}
    D --> E
    E -->|Yes| F[Deliverable from real data]
    E -->|No| G[Say so, retry or fall back]
    G --> H[Never invent silently]
```

*Figure: TaskForce prefers the right source, and names failure instead of fabricating an answer.*

If a specialized data source isn't available or a lookup fails, it says so and retries or falls back, rather than silently inventing an answer.

## Why this matters for high-stakes work

Because TaskForce acts through governed, auditable connections rather than free-text guesses, every action it takes, an email drafted, a database queried, a diagram generated, traces back to a real, permissioned source. That matters whether you're a founder who needs a board update to be accurate, or an engineering lead who needs an incident diagram to reflect the real system.

## Who uses Rivine TaskForce

- **Software engineering teams**: turn logs, tickets, and connected repos into diagrams, dashboards, and status updates without leaving the workspace.
- **Research organizations**: visualize datasets and cross-lab workflows, and package findings into shareable interactive documents.
- **Consulting firms**: pull live client data through connectors and turn it into client-ready decks, memos, and dashboards.
- **Startup teams**: automate the everyday professional work (emails, board updates, dashboards) that would otherwise eat founder time.
- **University post-graduates**: build teaching aids, thesis diagrams, and interactive explainers grounded in real data.

## Real-world prompt examples

| Persona                   | Example real-world prompt                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startup team              | "Pull last week's Stripe transactions and draft a board-ready revenue summary email to send through Gmail."                                                                                  |
| Software engineering team | "Diagram our current microservice request flow in Mermaid, then build an HTML 3D visualization of the queue backlog for the incident review."                                                |
| Research organization     | "Analyze this quantum dataset using advanced mathematical modeling, and create a scientific report using HTML STEM illustrating the entanglement relationships between experimental groups." |
| Consulting firm           | "Connect to the client's MongoDB read-only credentials, pull last quarter's churn data, and build an interactive HTML dashboard of at-risk accounts."                                        |
| University post-graduate  | "Create an Excalidraw diagram explaining the Krebs cycle for my thesis defense slides."                                                                                                      |
| Startup team              | "Use Code Execution to run a Monte Carlo simulation of our cap-table dilution across three funding rounds and chart the outcomes."                                                           |
| Software engineering team | "Generate an HTML STEM interactive simulation comparing our new caching algorithm's latency curve to the old one, using this benchmark CSV."                                                 |
| Consulting firm           | "Draft a governance-compliant client memo summarizing this quarter's connected Salesforce/HubSpot pipeline data with a Mermaid funnel diagram."                                              |
| Research organization     | "Parse this batch of 40 conference talk videos into a structured learning pack with citations back to timestamps."                                                                           |
| University post-graduate  | "Build an HTML 3D model of this protein's folding structure from the attached PDB file, with a computed energy-minimization summary I can defend in committee."                              |
