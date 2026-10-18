// Deterministic fixture backend for the harness. Every response here is
// synthetic demo data; nothing is fetched from a real Aselius service.
const T0 = '2026-10-15T14:00:00.000Z'
const iso = (min) => new Date(Date.parse(T0) + min * 60_000).toISOString()

export const WS = [
  { id: 'ws-launch', name: 'Product launch', description: null, owner_cloudhandle: 'demo', created_at: iso(-900), updated_at: iso(30), user_role: 'owner' },
  { id: 'ws-research', name: 'Research & intelligence', description: null, owner_cloudhandle: 'demo', created_at: iso(-800), updated_at: iso(-60), user_role: 'owner' },
  { id: 'ws-eng', name: 'Engineering', description: null, owner_cloudhandle: 'demo', created_at: iso(-700), updated_at: iso(-120), user_role: 'owner' },
]
export const CS = {
  'ws-launch': [
    { id: 'cs-launch-research', workspace_id: 'ws-launch', title: 'Launch research', created_at: iso(-300), updated_at: iso(30) },
    { id: 'cs-creative-brief', workspace_id: 'ws-launch', title: 'Creative brief', created_at: iso(-200), updated_at: iso(-30) },
  ],
  'ws-research': [{ id: 'cs-market-scan', workspace_id: 'ws-research', title: 'Market scan', created_at: iso(-500), updated_at: iso(-60) }],
  'ws-eng': [{ id: 'cs-api-review', workspace_id: 'ws-eng', title: 'API review', created_at: iso(-600), updated_at: iso(-120) }],
}

const BRIEF_MD = `# Launch readiness\n\nThe product story, source material and launch checklist are ready for review.\n\n## 01 Positioning\nExplain the workflow through a concrete user task. Keep the first action obvious.\n\n## 02 Deliverables\nShare the launch brief, supporting evidence and a clear review checklist.\n\n## 03 Next steps\nReview the sources, confirm the owner and approve the final release.\n`

export const ASSETS = {
  'cs-launch-research': [
    { id: 'asset-brief-pdf', name: 'product-brief.pdf', type: 'document', creator: 'user', created_at: iso(0), size: 182000, format: 'pdf', chatSpaceId: 'cs-launch-research', content: '# Product brief\n\nDemo attachment text for the harness.', language: 'markdown' },
    { id: 'asset-launch-md', name: 'launch-brief.md', type: 'document', creator: 'ai', created_at: iso(5), size: 2400, format: 'md', chatSpaceId: 'cs-launch-research', content: BRIEF_MD, language: 'markdown' },
    { id: 'asset-checklist', name: 'release-checklist.xlsx', type: 'data', creator: 'ai', created_at: iso(5), size: 9100, format: 'xlsx', chatSpaceId: 'cs-launch-research', language: 'xlsx' },
    { id: 'asset-site-html', name: 'launch-site.html', type: 'code', creator: 'ai', created_at: iso(5), size: 5100, format: 'html', chatSpaceId: 'cs-launch-research', content: '<!doctype html><html><body style="font-family:system-ui;padding:24px"><h1>Launch site</h1><p>Demo HTML deliverable.</p></body></html>', language: 'html' },
  ],
}

const USER_1 = `<file_attachment asset_id="asset-brief-pdf" filename="product-brief.pdf" />\nTurn the attached product brief into a concise launch plan. Include a review checklist and show me your progress.`
const AI_1 = `I reviewed **product-brief.pdf** and prepared the launch materials.\n\n## Launch plan\n1. Confirm positioning with the product owner.\n2. Publish the launch brief and the review checklist.\n3. Run the release review on Friday.\n\n| Owner | Task | Due |\n| --- | --- | --- |\n| Product | Positioning sign-off | Wed |\n| Marketing | Launch site copy | Thu |\n| Engineering | Release review | Fri |\n\n\`\`\`ts\nexport function isLaunchReady(checks: boolean[]): boolean {\n  return checks.length > 0 && checks.every(Boolean)\n}\n\`\`\`\n\nThe brief, the checklist and a one-page launch site are attached below.`

const LONG = Array.from({ length: 24 }, (_, i) => [
  { id: `long-u${i}`, role: 'user', content: `Question ${i + 1}: summarize section ${i + 1} of the creative brief.`, created_at: iso(10 + i * 2) },
  { id: `long-a${i}`, role: 'assistant', content: `Section ${i + 1} covers the audience, tone and the visual direction.\n\n- Audience: product teams\n- Tone: calm and direct\n- Visuals: solid colour, no glass`, created_at: iso(11 + i * 2), metadata: { target_engine: 'rivine_creative' } },
]).flat()

export const MESSAGES = {
  'cs-creative-brief': LONG,
  'cs-launch-research': [
    { id: 'msg-u1', role: 'user', content: USER_1, created_at: iso(1) },
    {
      id: 'msg-a1', role: 'assistant', content: AI_1, created_at: iso(5),
      metadata: {
        target_engine: 'rivine_chat',
        activity: [
          { id: 's1', label: 'Reading product-brief.pdf', kind: 'tool' },
          { id: 's2', label: 'Planning the launch materials', kind: 'thought' },
          { id: 's3', label: 'Writing the launch brief', kind: 'stage' },
          { id: 's4', label: 'Building the review checklist', kind: 'tool' },
        ],
      },
      fragment: {
        deliverables: [
          { asset_id: 'asset-launch-md', filename: 'launch-brief.md', fragment_type: 'markdown' },
          { asset_id: 'asset-checklist', filename: 'release-checklist.xlsx', fragment_type: 'xlsx' },
          { asset_id: 'asset-site-html', filename: 'launch-site.html', fragment_type: 'html' },
        ],
      },
    },
  ],
}

/** Scripted public SSE events for a live turn, mirroring public_stream.py shapes. */
export function streamEvents() {
  return [
    { type: 'meta', user_message_id: 'msg-u2' },
    { type: 'engine_selected', engine: 'rivine_code' },
    { type: 'thought', title: 'Planning the change' },
    { type: 'stage', node: 'engine', status: 'start', label: 'Reading the project…' },
    { type: 'tool_call_start', name: 'read_asset', tool_call_id: 'call-1', args: { filename: 'launch-brief.md' } },
    { type: 'tool_call_done', name: 'read_asset', tool_call_id: 'call-1', status: 'ok' },
    { type: 'tool_call_start', name: 'web_search', tool_call_id: 'call-1b', args: {} },
    { type: 'tool_call_done', name: 'web_search', tool_call_id: 'call-1b', status: 'failed' },
    { type: 'tool_call_start', name: 'web_search', tool_call_id: 'call-1c', args: {} },
    { type: 'tool_call_done', name: 'web_search', tool_call_id: 'call-1c', status: 'ok' },
    { type: 'tool_call_start', name: 'execute', tool_call_id: 'call-2', args: { command: 'npm test -- --run launch' } },
    { type: 'thought', title: 'Checking the test output ✅ — überprüft' },
    { type: 'tool_call_done', name: 'execute', tool_call_id: 'call-2', status: 'ok', result_preview: 'PASS  launch.test.ts\n  ✓ isLaunchReady (3 ms)\nTests: 1 passed' },
    { type: 'stage', node: 'engine', status: 'error', label: 'A step ran into a problem — recovering…' },
    { type: 'tool_call_start', name: 'perform_grounded_research', tool_call_id: 'call-3', args: {} },
    { type: 'token', content: 'The launch checks pass. ' },
    { type: 'token', content: 'I updated the brief and kept your checklist unchanged.' },
    { type: 'tool_call_start', name: 'write_file', tool_call_id: 'call-4', args: { filename: 'launch-brief.md' } },
    { type: 'tool_call_done', name: 'write_file', tool_call_id: 'call-4', status: 'skipped' },
    { type: 'final_answer', content: 'The launch checks pass. I updated the brief and kept your checklist unchanged.', ai_message_id: 'msg-a2', target_engine: 'rivine_code' },
  ]
}

/**
 * Encode events as SSE and split the bytes at awkward places (mid-JSON,
 * CRLF framing, inside a multi-byte UTF-8 character) to exercise framing.
 */
export function sseChunks(events) {
  const text = events.map((e, i) => (i % 3 === 1 ? `: keepalive\r\n\r\ndata: ${JSON.stringify(e)}\r\n\r\n` : `data: ${JSON.stringify(e)}\n\n`)).join('')
  const bytes = Buffer.from(text, 'utf8')
  const chunks = []
  let i = 0, n = 0
  while (i < bytes.length) {
    const size = [7, 61, 13, 120, 3, 45][n++ % 6]
    chunks.push(bytes.subarray(i, i + size)); i += size
  }
  return chunks
}

export function rest(method, pathname, search) {
  const p = pathname.replace(/^\/api\/aselius/, '')
  let m
  if (method === 'GET' && p === '/workspaces/bootstrap') {
    return { workspaces: WS, active_workspace_id: 'ws-launch', chat_spaces: CS['ws-launch'], active_chat_space_id: 'cs-launch-research' }
  }
  if (method === 'GET' && (p === '/workspaces/' || p === '/workspaces')) return WS
  if (method === 'GET' && (m = p.match(/^\/workspaces\/([^/]+)\/chat-spaces\/?$/))) return CS[m[1]] || []
  if (method === 'GET' && (m = p.match(/^\/workspaces\/([^/]+)\/chats\/([^/]+)\/messages\/?$/))) {
    const msgs = MESSAGES[m[2]] || []
    return { messages: msgs, total_count: msgs.length, chat_space_id: m[2], workspace_id: m[1] }
  }
  if (method === 'GET' && (m = p.match(/^\/workspaces\/([^/]+)\/chats\/([^/]+)\/assets\/?$/))) return ASSETS[m[2]] || []
  if (method === 'GET' && (m = p.match(/^\/workspaces\/([^/]+)\/assets\/([^/]+)\/?$/))) {
    for (const list of Object.values(ASSETS)) { const a = list.find((x) => x.id === m[2]); if (a) return a }
    return undefined
  }
  if (method === 'GET' && (m = p.match(/^\/workspaces\/([^/]+)\/assets\/([^/]+)\/content\/?$/))) {
    for (const list of Object.values(ASSETS)) { const a = list.find((x) => x.id === m[2]); if (a) return { content: a.content || '', asset_id: a.id } }
    return undefined
  }
  if (method === 'GET' && /\/taskforce-connectors\/selection\/?$/.test(p)) return { connector_ids: [], selected: [] }
  if (method === 'GET' && /\/taskforce-connectors\/?$/.test(p)) return []
  if (method === 'GET' && /\/members\/?$/.test(p)) return []
  if (method === 'GET' && /\/invitations/.test(p)) return []
  if (method === 'GET' && /\/permissions|\/role/.test(p)) return { role: 'owner', permission: 'owner' }
  return undefined
}

export function node(method, pathname) {
  if (pathname.endsWith('/user/cloudhandle')) return { cloudHandle: 'demo' }
  if (pathname.endsWith('/payment/credits') || pathname.endsWith('/credits')) return { balance: 24.5, credits: 24.5, currency: 'USD', plan: 'essential', subscription: { plan: 'essential', status: 'active' } }
  if (pathname.endsWith('/payment/plan-limits')) return { plan: 'essential', limits: { uploads_per_day: 100, uploads_used: 3 }, uploadsRemaining: 97 }
  if (pathname.endsWith('/user/status')) return { ok: true, status: 'active' }
  if (pathname.endsWith('/users/status')) return {}
  if (pathname.endsWith('/user-profiles/min-profile')) return { cloudhandle: 'demo', firstName: 'Demo', lastName: 'User' }
  return undefined
}
