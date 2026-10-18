# Selius

Selius is the voice of Aselius and Rivine Browse: a speech-to-speech assistant on Gemini Live
(`gemini-3.8-live`, Vertex AI). It is also the ivory-and-jade dragon that shows what Rivine is
doing. It lives in three places:

| Where | How it starts | What it can do |
|---|---|---|
| Rivine Browse extension (side panel) | Tap the dragon in the companion row, the **Selius** button, or say "Hey Selius" (opt-in) | Start, pause, resume and stop Browse tasks; answer Browse's questions and approvals with your words; save workflows; report when a task it started ends |
| Rivine Browse desktop app | The same companion row and button, with "Hey Selius" on the computer's own speech service (opt-in) | The same |
| Aselius web app (every signed-in page) | Tap the dragon at the bottom right, or say "Hey Selius" (opt-in, on the Selius page) | Navigate; open taskspaces; choose an engine and specialty; send a task after you say yes; answer an engine's question; create and delete workspaces and taskspaces (deletes need the name said aloud); create automations |

In Browse the companion row sits under the header, above Task / Workflows / History: soft dragon on the left, a short
"Selius · Tap to talk…" line beside it. The dragon can be hidden under **Selius voice** in the menu.

## Rules it keeps

- **It listens to you fully, then asks before acting.** It sends a task only after you clearly say yes.
- **It never approves anything on its own judgement.** A sign-in, payment, send or restricted permission gets an answer from you, passed in your words. The answer takes the same path as the buttons, so it is shown, saved to the taskspace thread, and remembered for the rest of the task.
- **It doesn't make things up.** It reads the real Browse and workspace status tools instead of guessing what Rivine is doing.
- **It doesn't chatter.** It speaks up on its own only:
  - when Browse needs you;
  - when a task it sent finishes;
  - in the web app, for any engine, if you turn that on.
- **Language and register.** It replies in the language you speak. In Browse, the speaking style (Everyday, Professional or Consultant) is under **Selius voice** in the menu. In the web app it keeps one register: quiet and professional.

## How a conversation works

```
panel / web app ──POST /api/browse/selius/session (Browse)──► workspace backend
                 └─POST /api/selius/session (web app)───────►   mints a short-lived ticket
                                                                 (signed; Google credential sealed
                                                                  server-side, never sent to the browser)
panel ──WebSocket wss://selius-relay…/live?ticket=…──► relay (Cloudflare Worker)
relay ──service credential──► Vertex AI Live (gemini-3.8-live)
relay ──signed usage report──► POST /api/browse/selius/usage ──► credits
```

- **Why a relay.** The Live API does not issue browser-safe ephemeral tokens, so a client cannot hold a Google credential. The relay:
  - pins the model;
  - pipes the audio;
  - counts tokens from the provider's own messages, so the client cannot under-report;
  - ends a conversation at 15 minutes.
- **No AI Studio key.** Selius uses the platform's Vertex service account, the same credential the engines use.
- **Cost.** A session opens only when called and closes after quiet or when you're done. One conversation is capped; a short live exchange billed a few tenths of a cent.
- **Balance.** Selius needs a balance above $1.00.

## The dragon

- **Art** (`rivine-browse/src/sidepanel/mascot/dragon.ts`, copied to `Aselius_V1.0.0_Frontend/src/components/selius/mascot/`):
  - soft gradient shading, no outlines or drawn lines;
  - smooth scalloped wings;
  - gradient ids unique per instance.
- **States:** idle, listening (fins perk, head tilts), thinking (halo, glancing eyes), speaking, attention (waves, amber), happy (after a task finishes), paused, error, sleeping (after 3 quiet minutes).
- **Voice sync:**
  - The playback worklet measures the loudness of the audio as it is played, every 40 ms. The mouth follows that, opening fast and closing slowly like a jaw.
  - Head nods follow the speech envelope; stressed syllables lift the wings.
  - Blinks, glances and the head's drift are randomised.
  - A frame loop runs only while there is voice. Idle motion is CSS, and reduced-motion is honoured.
- **Settings.** In Browse, **Selius voice** has a toggle to hide the dragon.

## Wake word

| Surface | Engine | Notes |
|---|---|---|
| Chrome extension, web app | Chrome / Edge `webkitSpeechRecognition` | Listens only for the name, and only while no conversation is open. Off by default. |
| Desktop, macOS | `native/selius-wake` (Swift, `SFSpeechRecognizer`) | On-device where supported (Apple silicon, en-US checked): audio stays on the Mac. macOS asks once for Speech Recognition. |
| Desktop, Windows | `native/selius-wake.ps1` (`System.Speech`) | Offline. Name grammar plus dictation, confidence ≥ 0.80. Not yet tested on a Windows machine. |
| Desktop, Linux | none | Button only. |

Recognizers often hear the name as "Celsius", so "Hey Celsius" counts as a call. "Celsius" on its own does not. In the web app, "Beunec Voice" and "Hello Beunec" also work.

## Running it locally

```sh
# 1. The relay (secret generated into selius-relay/.dev.vars, never printed)
cd selius-relay && npx wrangler dev --port 8787 --ip 127.0.0.1
# 2. The backend (real sign-in, test identity, test database, local relay)
RIVINE_BROWSE_LOCAL=1 Aselius-Workspace/aselius_workspace/venv/bin/python rivine-browse/e2e/server.py
# 3. The desktop app against both
cd rivine-browse-desktop && node scripts/dev-speech-permission.mjs && \
  RIVINE_BROWSE_API=http://127.0.0.1:8765 RIVINE_SELIUS_RELAY=ws://127.0.0.1:8787 node scripts/build.mjs --dev && \
  env -u ELECTRON_RUN_AS_NODE npx electron .
```

**Tests:**
- Live voice, in the real extension with a fake microphone playing a spoken WAV: `SELIUS_WAV=<16 kHz wav> npm run e2e -- selius`. It checks that Selius:
  - heard you;
  - answered aloud;
  - closed itself;
  - had the dragon listen and speak, with its lips following the voice.
- Unit tests:
  - `rivine-browse/test/selius*.test.ts` and `mascot.test.ts`;
  - `rivine-browse-desktop/test/wake.test.ts`;
  - `Aselius-Workspace/aselius_workspace/tests/test_selius.py`;
  - `Aselius_V1.0.0_Frontend/tests/selius-workspace.test.mjs`.

## Deploying

1. Deploy the relay: `cd selius-relay && npx wrangler deploy && npx wrangler secret put SELIUS_RELAY_SECRET`.
2. Put the same secret in SSM at `/aselius/production/workspace/SELIUS_RELAY_SECRET`, through `.env.production.fordeveloper` and `./ops.sh`.
3. Deploy the workspace backend. It already has the Vertex service account, and `SELIUS_RELAY_URL` defaults to the production relay.
