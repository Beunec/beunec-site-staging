# Selius

Selius is the speech-to-speech voice of Aselius and Rivine Browse. Talk to it to navigate, start and steer tasks, and answer an engine's questions hands-free, while its ivory-and-jade dragon shows what Rivine is doing.

## At a glance

- **What it is:** A voice assistant for Aselius and Rivine Browse, with an animated dragon companion.
- **Where:** The Rivine Browse extension, the Rivine Browse desktop app and every signed-in page of the Aselius web app.
- **Best for:** Starting, steering and answering tasks without typing.
- **Safety:** Asks before acting, and never approves a sign-in, payment or send on its own.
- **Cost:** Needs a balance above $1 to start. Usage is billed to your credits.
- **Wake word:** "Hey Selius", off by default and opt-in on each surface.

## Where it is available

| Where | How it starts | What it can do |
|---|---|---|
| Rivine Browse extension (side panel) | Tap the dragon in the companion row, the **Selius** button, or say "Hey Selius" (opt-in) | Start, pause, resume and stop Browse tasks; answer Browse's questions and approvals with your words; save workflows; report when a task it started ends |
| Rivine Browse desktop app | The same companion row and button, with "Hey Selius" through the computer's own speech service (opt-in) | The same |
| Aselius web app (every signed-in page) | Tap the dragon at the bottom right, or say "Hey Selius" (opt-in, on the Selius page) | Navigate; open taskspaces; choose an engine and specialty; send a task after you say yes; answer an engine's question; create and delete workspaces and taskspaces (deletes need the name said aloud); create automations |

In Browse, the companion row sits under the header, above Task / Workflows / History: the dragon on the left and a short "Selius · Tap to talk…" line beside it.

## Rules it keeps

- **It listens to you fully, then asks before acting.** It sends a task only after you clearly say yes.
- **It never approves anything on its own judgement.** A sign-in, payment, send or restricted permission gets an answer from you, passed on in your words. That answer works exactly like pressing the button: it is shown, saved to the taskspace thread and remembered for the rest of the task.
- **It does not make things up.** It reads the real Browse and workspace status instead of guessing what Rivine is doing.
- **It does not chatter.** It speaks up on its own only:
  - when Browse needs you;
  - when a task it sent finishes;
  - in the web app, for any engine, if you turn that on.
- **It matches your language.** It replies in the language you speak. In Browse, choose a speaking style (Everyday, Professional or Consultant) under **Selius voice** in the menu. In the web app it keeps one register: quiet and professional.

## How a conversation works

1. **Call Selius.** Tap the dragon, press the **Selius** button, or say "Hey Selius" if you turned the wake word on.
2. **Speak.** Selius listens until you finish, then confirms what it understood.
3. **Approve.** It acts only after you clearly say yes. Deleting a workspace or taskspace also needs its name said aloud.
4. **Follow along.** The dragon shows whether Selius is listening, thinking or speaking. It speaks up again only when a task needs you or a task it sent finishes.
5. **Finish.** The conversation closes when you are done or after a quiet spell.

- **Conversation length.** One conversation lasts at most 15 minutes.
- **Cost.** A conversation opens only when you call Selius and is billed to your credits. A short live exchange costs a few tenths of a cent.

> **Note:** Selius needs a balance above $1.00 to start. When it hands a task to an engine, that engine then needs its own start balance (for example $5 for Research or $10 for Code). See [Plans and pricing](/aselius-platform/docs/plans-pricing).

## The dragon

The dragon is a soft, ivory-and-jade companion that mirrors what Selius is doing.

| State | What it means |
|---|---|
| **Idle** | Ready; nothing in progress |
| **Listening** | Hearing you (fins perk, head tilts) |
| **Thinking** | Working out a reply (halo, glancing eyes) |
| **Speaking** | Talking; its mouth, nods and wings follow the voice |
| **Attention** | Needs you (waves, amber) |
| **Happy** | A task just finished |
| **Paused** | Paused, along with the task it is following |
| **Error** | Something went wrong |
| **Sleeping** | After 3 quiet minutes |

- Blinks, glances and small head movements are natural and varied.
- Your system's reduced-motion setting is honoured.
- In Browse, **Selius voice** in the menu has a toggle to hide the dragon.

## Wake word: "Hey Selius"

The wake word is **off by default**. Turn it on per surface; until then, Selius starts only when you tap or press the button.

| Surface | How it listens | Privacy |
|---|---|---|
| Chrome extension, web app | The browser's built-in speech recognition (Chrome or Edge) | Listens only for the name, and only while no conversation is open |
| Desktop, macOS | macOS speech recognition | On-device where supported (Apple silicon, US English): audio stays on the Mac. macOS asks once for Speech Recognition permission |
| Desktop, Windows | Windows speech recognition | Offline, on your computer. Windows support is new |
| Desktop, Linux | Not available | Use the button |

- Speech recognizers often hear the name as "Celsius", so "Hey Celsius" also counts. "Celsius" on its own does not.
- In the web app, "Beunec Voice" and "Hello Beunec" also work.

## Related

- [Aselius Workspace](/aselius-platform/docs/workspace): taskspaces, engines and specialties
- [Rivine Browse](https://browse.aselius.beunec.com/paper): the browsing engine Selius steers
- [Automations](/aselius-platform/docs/automations): scheduled runs you can create by voice
- [Plans and pricing](/aselius-platform/docs/plans-pricing): credits and start balances
