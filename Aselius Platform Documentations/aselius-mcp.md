# Aselius MCP

Aselius MCP is a remote [Model Context Protocol](https://modelcontextprotocol.io) server. It lets
an MCP client you already use: Claude Desktop, Claude Code, Cursor, ChatGPT, or any other
MCP-compliant client. Start and follow a real Rivine engine task on your own Aselius account,
without leaving that client.

**Endpoint:** `https://workspace.beunec.com/mcp`

## Connecting

1. In your MCP client, add a remote server pointed at `https://workspace.beunec.com/mcp`.
2. The client is redirected through Aselius MCP's own OAuth broker in front of Auth0
   (authorization code with PKCE; the server holds no client secret). Sign in with your Aselius
   account and approve the connection.
3. The client discovers the available tools (`start_task`, `get_task`, `answer_task`,
   `cancel_task`) and the engine/specialty catalog from the server itself. No prompts or routing
   logic live on the client side.

## What it can do

- **Start a task** on a named Rivine engine and specialty (for example Rivine Research · PDF, or
  Rivine Cicero · Contract Review), with an optional `idempotency_key` so a retried call never
  starts, or bills, the same task twice.
- **Poll a task** for its status, the public steps it has taken so far, and any question it is
  waiting on.
- **Answer a question** a paused engine asked, and the turn continues from exactly where it
  stopped.
- **Deliver results** as one-tap preview links (to `preview.aselius.beunec.com`) alongside the
  plain file downloads, so any client can show them.

## What it does not offer

Aselius MCP is a dispatcher to the shared engine runner, not a copy of the Workspace UI. It does
not currently expose Rivine Code, Rivine Browse, or Rivine Assist. Those need a live sandbox, a
browser session, or an already-open document, none of which an MCP call carries. Use the Aselius
web app for those.

## Billing

A task started over MCP spends from the same prepaid wallet as every other surface, at the same
[engine start floor](/aselius-platform/docs/plans-pricing) as the web app. It is available on
every plan.
