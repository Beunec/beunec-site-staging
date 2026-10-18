# Aselius MCP

Aselius MCP lets you use Aselius from any MCP-compatible AI app, such as Claude, Cursor or ChatGPT. You start and follow real Rivine engine tasks on your own Aselius account without leaving the app you already work in.

## At a glance

- **What it is:** a remote [Model Context Protocol](https://modelcontextprotocol.io) server for Aselius.
- **Endpoint:** `https://workspace.beunec.com/mcp`
- **Works with:** any MCP-compatible AI app, including Claude Desktop, Claude Code, Cursor and ChatGPT.
- **You can:** start, follow, answer and cancel Rivine engine tasks.
- **Not included:** Rivine Code, Rivine Browse and Rivine Assist.
- **Cost:** available on every plan, spending the same prepaid wallet as the web app.

## Connecting

1. In your AI app, add a remote MCP server pointed at `https://workspace.beunec.com/mcp`.
2. The app opens an Aselius sign-in page. Sign in with your Aselius account and approve the connection. This is a standard OAuth sign-in, so your password is never shared with the app.
3. The app then lists what Aselius offers: the four tools below and the engines and specialties you can choose. Everything comes from Aselius itself, so there is nothing else to install or configure.

## What it can do

| Tool | What it does |
| --- | --- |
| `start_task` | Starts a task on the Rivine engine and specialty you name, for example Rivine Research · PDF or Rivine Cicero · Contract Review. |
| `get_task` | Shows a task's status, the steps it has taken so far, and any question it is waiting on. |
| `answer_task` | Answers a question the engine asked. The task continues from exactly where it stopped. |
| `cancel_task` | Stops a running task. |

When a task finishes, results arrive as one-tap preview links to `preview.aselius.beunec.com` alongside the plain file downloads, so any app can show them.

> **Note:** Your app can attach an optional idempotency key when it starts a task. If the same request is sent twice, for example after a dropped connection, Aselius recognises it and never starts or bills the task a second time.

## What it does not offer

Aselius MCP runs engine tasks; it is not a copy of the Workspace interface. It does not expose Rivine Code, Rivine Browse or Rivine Assist, because they need a live code sandbox, your own browser session, or a document already open on screen. Use the [Aselius web app](https://aselius.beunec.com) for those.

## Billing

A task started over MCP spends from the same prepaid wallet as every other surface, at the same [engine start floor](/aselius-platform/docs/plans-pricing) as the web app. It is available on every plan.

## Related

- [Aselius Workspace](/aselius-platform/docs/workspace)
- [Messaging channels](/aselius-platform/docs/messaging-channels)
- [Preview app](/aselius-platform/docs/preview-app)
- [Plans & Pricing](/aselius-platform/docs/plans-pricing)
