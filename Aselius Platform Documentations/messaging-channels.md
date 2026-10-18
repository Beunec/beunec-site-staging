# Messaging Channels

Telegram, Discord and WhatsApp can each start and follow a real Rivine engine task on your own
Aselius account: the same engines, the same credits, from inside the chat app you already have
open.

## Linking a channel

1. Open **Settings → Chat apps** in the Aselius web app and choose Telegram, Discord or
   WhatsApp.
2. The app gives you a one-time link or code, good for ten minutes, that you send from your own
   account in that chat app, never the other way around, so nobody can link a chat they do not
   control.
3. Once linked, that chat is yours: a request sent there runs on your Aselius wallet, and results
   come back to you there.

## Starting and following a task

Send a plain-language request in the linked chat, or use the channel's own command
(`/task` on Telegram and Discord). The bot replies with a menu: pick the Rivine engine, then its
specialty, then confirm. An older menu you tap again after a newer one was sent is refused rather
than silently acted on, so a slow network connection can never start the wrong task.

While the task runs you can check its status, stop it, or answer a question the engine asks.
Each message carries a version check, so you can never answer the wrong turn. When it finishes,
the result arrives with a one-tap preview link to `preview.aselius.beunec.com` and the plain file,
so it opens on any device without an Aselius sign-in.

## Per-channel notes

- **Telegram and WhatsApp** reply in the same private chat you linked.
- **Discord** results are sent as a direct message to you specifically, never posted to a shared
  server channel, even if you linked from one.
- A task started by messaging shows in your Workspace Taskspace list like any other, with the
  full step trail an engine took.

## Billing

A task started from a messaging channel spends from the same prepaid wallet as the web app, at
the same [engine start floor](/aselius-platform/docs/plans-pricing). It is available on every
plan, alongside Rivine Browse, Aselius MCP and the Rivine Code CLI.
