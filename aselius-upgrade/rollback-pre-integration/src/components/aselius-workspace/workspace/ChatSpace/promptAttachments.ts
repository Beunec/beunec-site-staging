/**
 * Embed / parse pasted text and file references inside user message prompts.
 * Snapshots in the UI read content from these XML tags — no separate DB row.
 */

import type { Asset } from './ChatSpace'
import type { ChatAttachment } from './PreviewPanel'

const PASTED_REGEX = /<pasted_text>\s*([\s\S]*?)\s*<\/pasted_text>/gi
const FILE_REGEX = /<file_attachment\s+([^>/]*)\s*\/?>/gi
const AGENT_NOTE_REGEX = /<agent_note>\s*[\s\S]*?\s*<\/agent_note>/gi
const RIVINE_NOTE_REGEX = /<rivine_note>\s*[\s\S]*?\s*<\/rivine_note>/gi
const CONTEXT_IDENTITY_REGEX = /<context_identity>\s*[\s\S]*?\s*<\/context_identity>/gi
const USER_PRIORITY_REGEX = /<user_propritize>\s*[\s\S]*?\s*<\/user_propritize>/gi
const AGENTIC_ENGINE_REGEX = /<agentic_engine>\s*[\s\S]*?\s*<\/agentic_engine>/gi
const LANGUAGE_HINT_REGEX = /\[User wants your AI response to be in [^\]]+\.\]/gi

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function parseAttrs(attrStr: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([\w-]+)="([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = re.exec(attrStr))) attrs[match[1]] = match[2]
  return attrs
}

function guessAssetType(filename: string): Asset['type'] {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'rb'].includes(ext)) return 'code'
  if (['csv', 'json', 'yaml', 'yml', 'xml'].includes(ext)) return 'data'
  return 'document'
}

export type ParsedPastedBlock = { index: number; content: string }
export type ParsedFileBlock = { index: number; assetId: string; filename: string }

export type ParsedMessagePrompt = {
  visibleText: string
  pastedBlocks: ParsedPastedBlock[]
  fileBlocks: ParsedFileBlock[]
}

/** Build the full prompt sent to the API (user text + embedded attachment tags). */
export function buildMessagePrompt(userText: string, attachments: ChatAttachment[]): string {
  const parts: string[] = []
  const trimmed = userText.trim()
  if (trimmed) parts.push(trimmed)

  for (const att of attachments) {
    if (att.type === 'text' && att.content?.trim()) {
      parts.push(`<pasted_text>\n${att.content.trim()}\n</pasted_text>`)
    } else if (att.type === 'file' && att.assetId) {
      const name = att.name || att.file?.name || 'file'
      parts.push(`<file_attachment asset_id="${escapeAttr(att.assetId)}" filename="${escapeAttr(name)}" />`)
    }
  }

  return parts.join('\n\n')
}

/** Split stored message content into visible text + attachment blocks for UI snapshots. */
export function parseMessagePrompt(content: string): ParsedMessagePrompt {
  const pastedBlocks: ParsedPastedBlock[] = []
  const fileBlocks: ParsedFileBlock[] = []
  let pastedIdx = 0
  let fileIdx = 0

  let visible = content.replace(PASTED_REGEX, (_, inner: string) => {
    pastedBlocks.push({ index: pastedIdx++, content: inner.trim() })
    return ''
  })

  visible = visible.replace(FILE_REGEX, (_, attrs: string) => {
    const parsed = parseAttrs(attrs)
    fileBlocks.push({
      index: fileIdx++,
      assetId: parsed.asset_id ?? '',
      filename: parsed.filename ?? 'File',
    })
    return ''
  })

  visible = visible
    .replace(AGENT_NOTE_REGEX, '')
    .replace(RIVINE_NOTE_REGEX, '')
    .replace(CONTEXT_IDENTITY_REGEX, '')
    .replace(USER_PRIORITY_REGEX, '')
    .replace(AGENTIC_ENGINE_REGEX, '')
    .replace(LANGUAGE_HINT_REGEX, '')

  visible = visible.replace(/\n{3,}/g, '\n\n').trim()

  return { visibleText: visible, pastedBlocks, fileBlocks }
}

export function assetStubFromFileBlock(block: ParsedFileBlock): Asset {
  return {
    id: block.assetId,
    name: block.filename,
    type: guessAssetType(block.filename),
    creator: 'user',
    created_at: new Date().toISOString(),
    size: 0,
    format: block.filename.split('.').pop()?.toLowerCase() ?? '',
    chatSpaceId: '',
  }
}

export function snippetFromText(text: string, maxLen = 120): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= maxLen) return flat
  return `${flat.slice(0, maxLen)}…`
}
