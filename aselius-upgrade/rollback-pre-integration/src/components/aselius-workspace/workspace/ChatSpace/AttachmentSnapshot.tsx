'use client'

import React from 'react'
import {
  FileType2,
  FileSpreadsheet,
  FileCode2,
  Image as ImageIcon,
  Play,
  Layers,
  PenLine,
  FolderKanban,
  Download,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { snippetFromText } from './promptAttachments'

type SnapshotKind = 'pasted' | 'file'

function friendlyTypeLabel(label: string): string {
  switch (label.toUpperCase()) {
    case 'MD':
    case 'MARKDOWN':
      return 'Document'
    case 'HTML':
    case 'STEM':
    case '3D':
      return 'Web page'
    case 'PASTED':
      return 'Pasted text'
    case 'PROJECT':
      return 'Project'
    case 'DIAGRAM':
    case 'MERMAID':
      return 'Diagram'
    case 'YT':
      return 'Video'
    case 'IMAGE':
    case 'PNG':
      return 'Image'
    case 'PDF':
      return 'PDF'
    case 'XLSX':
      return 'Spreadsheet'
    case 'PPTX':
      return 'Presentation'
    default:
      return label
  }
}

function stripExtension(title: string): string {
  return title.replace(/\.(md|markdown|pdf|xlsx|pptx|html?|json|txt|csv|png|jpe?g|gif|webp)$/i, '')
}

/** Turn `research-retrieve-current-weather…` into readable words. */
function humanizeTitle(title: string, kind: SnapshotKind): string {
  if (kind === 'pasted') return 'Pasted text'
  const base = stripExtension(title)
  return base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * One hue per deliverable kind.
 *
 * A turn routinely returns eight artifacts at once, and when every card is the
 * same violet the grid reads as one undifferentiated block — you have to read
 * each label to find the spreadsheet. Colour does that work pre-attentively,
 * so the hue is keyed to the KIND and never to position: the PDF is always the
 * same red wherever it lands in the grid.
 *
 * Values are Tailwind utility fragments rather than raw hex so the existing
 * dark-mode tokens keep applying.
 */
type SnapshotTone = {
  /** Icon well: translucent fill + ring. */
  well: string
  icon: string
  /** Card edge + the glass sheen tint. */
  border: string
  hoverBorder: string
  sheen: string
}

const TONES: Record<string, SnapshotTone> = {
  document: {
    well: 'from-sky-100/80 to-sky-50/40 dark:from-sky-900/40 dark:to-sky-950/20 ring-sky-200/60 dark:ring-sky-800/40',
    icon: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200/70 dark:border-sky-800/40',
    hoverBorder: 'hover:border-sky-400/70 dark:hover:border-sky-600/60',
    sheen: 'from-sky-400/10',
  },
  web: {
    well: 'from-fuchsia-100/80 to-fuchsia-50/40 dark:from-fuchsia-900/40 dark:to-fuchsia-950/20 ring-fuchsia-200/60 dark:ring-fuchsia-800/40',
    icon: 'text-fuchsia-600 dark:text-fuchsia-400',
    border: 'border-fuchsia-200/70 dark:border-fuchsia-800/40',
    hoverBorder: 'hover:border-fuchsia-400/70 dark:hover:border-fuchsia-600/60',
    sheen: 'from-fuchsia-400/10',
  },
  pdf: {
    well: 'from-rose-100/80 to-rose-50/40 dark:from-rose-900/40 dark:to-rose-950/20 ring-rose-200/60 dark:ring-rose-800/40',
    icon: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200/70 dark:border-rose-800/40',
    hoverBorder: 'hover:border-rose-400/70 dark:hover:border-rose-600/60',
    sheen: 'from-rose-400/10',
  },
  sheet: {
    well: 'from-emerald-100/80 to-emerald-50/40 dark:from-emerald-900/40 dark:to-emerald-950/20 ring-emerald-200/60 dark:ring-emerald-800/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/70 dark:border-emerald-800/40',
    hoverBorder: 'hover:border-emerald-400/70 dark:hover:border-emerald-600/60',
    sheen: 'from-emerald-400/10',
  },
  slides: {
    well: 'from-orange-100/80 to-orange-50/40 dark:from-orange-900/40 dark:to-orange-950/20 ring-orange-200/60 dark:ring-orange-800/40',
    icon: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200/70 dark:border-orange-800/40',
    hoverBorder: 'hover:border-orange-400/70 dark:hover:border-orange-600/60',
    sheen: 'from-orange-400/10',
  },
  image: {
    well: 'from-amber-100/80 to-amber-50/40 dark:from-amber-900/40 dark:to-amber-950/20 ring-amber-200/60 dark:ring-amber-800/40',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/70 dark:border-amber-800/40',
    hoverBorder: 'hover:border-amber-400/70 dark:hover:border-amber-600/60',
    sheen: 'from-amber-400/10',
  },
  diagram: {
    well: 'from-violet-100/80 to-violet-50/40 dark:from-violet-900/40 dark:to-violet-950/20 ring-violet-200/60 dark:ring-violet-800/40',
    icon: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200/70 dark:border-violet-800/40',
    hoverBorder: 'hover:border-violet-400/70 dark:hover:border-violet-600/60',
    sheen: 'from-violet-400/10',
  },
  video: {
    well: 'from-red-100/80 to-red-50/40 dark:from-red-900/40 dark:to-red-950/20 ring-red-200/60 dark:ring-red-800/40',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200/70 dark:border-red-800/40',
    hoverBorder: 'hover:border-red-400/70 dark:hover:border-red-600/60',
    sheen: 'from-red-400/10',
  },
  project: {
    well: 'from-teal-100/80 to-teal-50/40 dark:from-teal-900/40 dark:to-teal-950/20 ring-teal-200/60 dark:ring-teal-800/40',
    icon: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200/70 dark:border-teal-800/40',
    hoverBorder: 'hover:border-teal-400/70 dark:hover:border-teal-600/60',
    sheen: 'from-teal-400/10',
  },
  pasted: {
    well: 'from-slate-100/80 to-slate-50/40 dark:from-slate-800/50 dark:to-slate-900/25 ring-slate-200/60 dark:ring-slate-700/40',
    icon: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-200/70 dark:border-slate-700/50',
    hoverBorder: 'hover:border-slate-400/70 dark:hover:border-slate-500/60',
    sheen: 'from-slate-400/10',
  },
}

function toneForLabel(label: string): SnapshotTone {
  switch (label.toUpperCase()) {
    case 'MD':
    case 'MARKDOWN':
      return TONES.document
    case 'HTML':
    case 'STEM':
    case '3D':
      return TONES.web
    case 'PDF':
      return TONES.pdf
    case 'XLSX':
      return TONES.sheet
    case 'PPTX':
      return TONES.slides
    case 'PNG':
    case 'IMAGE':
      return TONES.image
    case 'DIAGRAM':
    case 'MERMAID':
      return TONES.diagram
    case 'YT':
      return TONES.video
    case 'PROJECT':
      return TONES.project
    case 'PASTED':
      return TONES.pasted
    default:
      return TONES.document
  }
}


function iconForLabel(label: string): LucideIcon {
  switch (label.toUpperCase()) {
    case 'PDF':
      return FileType2
    case 'XLSX':
      return FileSpreadsheet
    case 'HTML':
    case 'STEM':
    case '3D':
      return FileCode2
    case 'PNG':
    case 'IMAGE':
      return ImageIcon
    case 'YT':
      return Play
    case 'DIAGRAM':
    case 'MERMAID':
      return Layers
    case 'PROJECT':
      return FolderKanban
    case 'PASTED':
      return PenLine
    default:
      return FileType2
  }
}

export function AttachmentSnapshot({
  kind,
  title,
  preview,
  label,
  onClick,
  onRemove,
  onDownload,
  compact = false,
  layout = 'card',
}: {
  kind: SnapshotKind
  title: string
  preview?: string
  label: string
  onClick?: () => void
  onRemove?: () => void
  /** Saves the deliverable straight to disk. Omitted for cards with no asset. */
  onDownload?: () => void | Promise<void>
  compact?: boolean
  /** `strip` = composer/thread carousel. `card` = deliverable grid (fills cell on desktop). */
  layout?: 'card' | 'strip'
}) {
  const previewText = preview ?? (kind === 'pasted' ? snippetFromText(title, 140) : title)
  const shownTitle = humanizeTitle(title, kind)
  const typeLabel = friendlyTypeLabel(label)
  const Icon = iconForLabel(label)
  const tone = toneForLabel(label)
  const [downloading, setDownloading] = React.useState(false)

  const handleDownload = async (e: React.MouseEvent | React.KeyboardEvent) => {
    // The card itself opens the Preview Panel; downloading must not also do that.
    e.stopPropagation()
    e.preventDefault()
    if (!onDownload || downloading) return
    setDownloading(true)
    try {
      await onDownload()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={shownTitle}
      className={[
        'group relative flex-shrink-0 flex items-center gap-3 overflow-hidden rounded-xl border transition-all text-left',
        // Liquid glass: a translucent pane over whatever sits behind it, with a
        // hairline highlight along the top edge where light would catch.
        'backdrop-blur-xl bg-white/70 dark:bg-white/[0.06]',
        'shadow-sm hover:shadow-lg hover:-translate-y-px',
        tone.border,
        tone.hoverBorder,
        compact
          ? 'w-[min(100%,240px)] min-h-[52px] px-2.5 py-2'
          : layout === 'strip'
            ? 'w-full max-w-md min-h-[62px] px-3 py-2.5 md:w-[20rem] md:max-w-[20rem]'
            : 'w-full max-w-md min-h-[62px] px-3 py-2.5 md:max-w-none',
      ].join(' ')}
    >
      {/* Sheen — the tint that makes each kind recognisable at a glance, and
          the highlight that reads as a glass surface. Pointer-events-none so
          it never intercepts the click. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone.sheen} via-transparent to-transparent`}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 dark:via-white/25 to-transparent"
      />

      <div className="relative flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tone.well} flex items-center justify-center ring-1`}>
          {kind === 'file' ? (
            <Icon className={`w-[18px] h-[18px] ${tone.icon}`} strokeWidth={1.65} />
          ) : (
            <PenLine className={`w-[18px] h-[18px] ${tone.icon}`} strokeWidth={1.65} />
          )}
        </div>
      </div>

      <div className="relative flex-1 min-w-0 flex flex-col justify-center gap-0.5 pr-1">
        <p className="text-[13px] font-medium leading-snug text-gray-900 dark:text-gray-100 line-clamp-2 break-words">
          {shownTitle}
        </p>
        <p className="text-[11px] leading-none text-gray-400 dark:text-gray-500">
          {typeLabel}
        </p>
        {kind === 'pasted' && (
          <p className="text-[10px] leading-snug text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
            {previewText}
          </p>
        )}
      </div>

      {onDownload && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Download ${shownTitle}`}
          title="Download"
          onClick={handleDownload}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDownload(e) }}
          className={[
            'relative flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg',
            'text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-100',
            'bg-white/60 dark:bg-white/10 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10',
            'hover:bg-white/90 dark:hover:bg-white/20 transition-colors',
            // Always visible on touch, where there is no hover to reveal it.
            'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100',
          ].join(' ')}
        >
          {downloading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Download className="w-3.5 h-3.5" strokeWidth={1.9} />}
        </span>
      )}

      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemove() } }}
          className="absolute top-1.5 right-1.5 p-0.5 rounded-md bg-white/90 dark:bg-gray-800/90 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-xs leading-none"
        >
          ×
        </span>
      )}
    </button>
  )
}

/** Map pending chat attachment to snapshot props. */
export function snapshotFromPendingAttachment(att: {
  type?: string
  name?: string
  content?: string
  file?: File
  markdownPreview?: string
  sourceUrl?: string
}): { kind: SnapshotKind; title: string; preview: string; label: string } {
  if (att.type === 'text') {
    const content = att.content ?? ''
    return {
      kind: 'pasted',
      title: 'Pasted text',
      preview: snippetFromText(content, 140),
      label: 'PASTED',
    }
  }
  const name = att.name || att.file?.name || 'Document'
  const ext = name.split('.').pop()?.toUpperCase() ?? 'MD'
  const isHtml = /\.html?$/i.test(name)
  const preview = att.markdownPreview || att.sourceUrl || name
  return { kind: 'file', title: name, preview: snippetFromText(preview, 140), label: isHtml ? 'HTML' : ext }
}
