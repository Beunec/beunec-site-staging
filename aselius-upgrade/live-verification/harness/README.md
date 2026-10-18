# Live UI harness (local only)

Drives the real Aselius frontend (`next build && next start -p 3100`) in Chromium with:
- a local Auth0 v4 session cookie minted from your own `.env.production.local` / `.env.local` secret (`session.mjs`; never printed, never sent anywhere),
- every backend call answered from `fixtures.mjs`, every WebSocket mocked, and the engine stream replayed by a local HTTPS server with awkward chunk splits.

Results are mocked-backend evidence, not live engine runs.

```bash
# from Aselius_V1.0.0_Frontend, after `npx next build`
APP_BASE_URL=http://localhost:3100 npx next start -p 3100 &
cd aselius-upgrade/live-verification/harness
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 2 -subj "/CN=localhost"
node shots.mjs ../run-$(date +%s)
```

Playwright is resolved from `deploy-aws-lambda-cloudflare/rivine-browse/node_modules`.
