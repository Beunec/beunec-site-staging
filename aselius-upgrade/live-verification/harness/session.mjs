// Mints a LOCAL-ONLY Auth0 v4 session cookie for the Aselius frontend running on
// localhost, using the same env files `next start` loads. The secret never leaves
// this process and is never printed. The access token inside is a placeholder:
// every backend call is answered by Playwright fixtures, never a real API.
import { createRequire } from 'node:module'
import path from 'node:path'

const FRONTEND = '/Users/akinnawo/beunecfullstack/deploy-aws-lambda-cloudflare/Aselius_V1.0.0_Frontend'
const require = createRequire(path.join(FRONTEND, 'package.json'))

export async function mintSessionCookie() {
  const { loadEnvConfig } = require('@next/env')
  // dev=false mirrors `next start` precedence (.env.production.local > .env.local > ...)
  loadEnvConfig(FRONTEND, false, { info() {}, error() {} })
  const secret = process.env.AUTH0_SECRET
  if (!secret) throw new Error('AUTH0_SECRET missing from frontend env files')
  const cookies = await import(path.join(FRONTEND, 'node_modules/@auth0/nextjs-auth0/dist/server/cookies.js'))
  const now = Math.floor(Date.now() / 1000)
  const session = {
    user: {
      sub: 'auth0|harness-demo-user',
      email: 'demo@example.test',
      name: 'Demo User',
      nickname: 'demo',
      picture: '',
      email_verified: true,
    },
    tokenSet: {
      accessToken: 'harness-placeholder-token',
      idToken: undefined,
      scope: 'openid profile email offline_access',
      expiresAt: now + 60 * 60 * 6,
    },
    internal: { sid: 'harness-sid', createdAt: now },
  }
  return cookies.encrypt(session, secret, now + 60 * 60 * 6)
}
