'use client'

import React, { useEffect, useState } from 'react'
import { Sparkles, Scale, Code2, FileText, Terminal } from 'lucide-react'

export type StarterPrompt = {
  engineId: string
  specialtyId: string
  engineLabel: string
  specialtyLabel: string
  prompt: string
}

const TYPEWRITER_LINES = [
  'Tell Aselius what to research, build, draft, or execute.',
  'Starters below lock the Rivine engine and specialty for you.',
  'Fill in the brackets, then send; or write your own request.',
]

const STARTERS: Array<
  StarterPrompt & {
    icon: typeof Terminal
    surface: string
    badge: string
  }
> = [
  {
    engineId: 'rivine-chat',
    specialtyId: 'code-execution',
    engineLabel: 'Rivine TaskForce',
    specialtyLabel: 'Code Execution',
    icon: Terminal,
    surface:
      'bg-sky-100/90 border-sky-300/80 hover:border-sky-400 dark:bg-sky-950/50 dark:border-sky-700/70 dark:hover:border-sky-500',
    badge: 'bg-sky-200/80 text-sky-900 dark:bg-sky-800/70 dark:text-sky-100',
    prompt:
      'Research the [input your task] in my region, compile their pricing tiers into a structured Excel spreadsheet on my desktop, build an interactive HTML dashboard summarizing their feature gaps, and then add a digestable document to my team.',
  },
  {
    engineId: 'rivine-research',
    specialtyId: 'pdf',
    engineLabel: 'Rivine Research',
    specialtyLabel: 'PDF',
    icon: FileText,
    surface:
      'bg-emerald-100/90 border-emerald-300/80 hover:border-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-700/70 dark:hover:border-emerald-500',
    badge: 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-800/70 dark:text-emerald-100',
    prompt:
      'Act as an Elite B2B GTM Strategy Agent to build a zero-ad-spend, high-retention market entry blueprint for a {PRODUCT_AGE}-old {PRODUCT_CATEGORY} platform fixing competitor flaws ({COMPETITOR_FLAWS_EX_HIGH_COST_OR_HALLUCINATIONS}) via {KEY_DIFFERENTIATORS_EX_INFINITE_CONTEXT_OR_ENCRYPTION}. Deliver a segmented penetration strategy for {TARGET_AUDIENCE_SEGMENTS} using a high-accountability {OUTBOUND_ARM_TYPE_EX_CONSULTING_ARM} for omni-channel outreach ({OUTBOUND_CHANNELS} with a {DEMO_DURATION_EX_15_30_MIN} demo hook: "{OUTBOUND_HOOK_TEMPLATE}") paired with an executive escalation framework ({ROLES_FOR_TECH_BUSINESS_STORYTELLING}), and a disciplined post-onboarding loop converting client critiques into rapid revenue-generating retention.',
  },
  {
    engineId: 'rivine-code',
    specialtyId: 'fullstack',
    engineLabel: 'Rivine Code',
    specialtyLabel: 'Full Stack',
    icon: Code2,
    surface:
      'bg-violet-100/90 border-violet-300/80 hover:border-violet-400 dark:bg-violet-950/50 dark:border-violet-700/70 dark:hover:border-violet-500',
    badge: 'bg-violet-200/80 text-violet-900 dark:bg-violet-800/70 dark:text-violet-100',
    prompt:
      'Build, and validate a production-grade full stack app from scratch, using {DATABASE}, {AUTH_METHOD}, and a custom {LOCAL_COMPLEXITY_ENGINE} while running an autonomous self-correction loop to generate directory maps, relational schemas, validation-wrapped APIs, state-managed UIs, dockerized test environments without human intervention until full-stack integration verification succeeds, and ensure preview.',
  },
  {
    engineId: 'rivine-cicero',
    specialtyId: 'legal-drafting',
    engineLabel: 'Rivine Cicero',
    specialtyLabel: 'Legal Drafting',
    icon: Scale,
    surface:
      'bg-amber-100/90 border-amber-300/80 hover:border-amber-400 dark:bg-amber-950/50 dark:border-amber-700/70 dark:hover:border-amber-500',
    badge: 'bg-amber-200/80 text-amber-900 dark:bg-amber-800/70 dark:text-amber-100',
    prompt:
      'Draft an NDA for a joint due-diligence engagement between our firm and this client, under US governing law. Draft a cross-border data-processing addendum for a client operating in the US, UK, and Germany, and flag where GDPR and US state privacy law conflict.',
  },
]

function TypewriterLine() {
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState('')
  const [phase, setPhase] = useState<'type' | 'hold' | 'erase'>('type')
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const full = TYPEWRITER_LINES[index]
    if (phase === 'hold') {
      const t = window.setTimeout(() => setPhase('erase'), 2200)
      return () => window.clearTimeout(t)
    }
    if (phase === 'erase') {
      if (shown.length === 0) {
        setIndex((i) => (i + 1) % TYPEWRITER_LINES.length)
        setPhase('type')
        return
      }
      const t = window.setTimeout(() => setShown((s) => s.slice(0, -1)), 12)
      return () => window.clearTimeout(t)
    }
    if (shown.length >= full.length) {
      setPhase('hold')
      return
    }
    const t = window.setTimeout(() => setShown(full.slice(0, shown.length + 1)), 28)
    return () => window.clearTimeout(t)
  }, [shown, phase, index, reduceMotion])

  if (reduceMotion) {
    return (
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed min-h-[3.25rem] sm:min-h-[3.5rem]">
        {TYPEWRITER_LINES[0]}
      </p>
    )
  }

  return (
    <p
      className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed min-h-[3.25rem] sm:min-h-[3.5rem]"
      aria-live="polite"
    >
      {shown}
      <span className="taskspace-type-caret" aria-hidden="true" />
    </p>
  )
}

function CometStar() {
  return (
    <div className="taskspace-comet relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8" aria-hidden="true">
      <div className="taskspace-comet-tile absolute inset-0 rounded-3xl flex items-center justify-center shadow-xl backdrop-blur-xl bg-[#00477d]/90 border border-white/20">
        <Sparkles className="taskspace-comet-core w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </div>
      <span className="taskspace-comet-shard taskspace-comet-shard-a" />
      <span className="taskspace-comet-shard taskspace-comet-shard-b" />
      <span className="taskspace-comet-shard taskspace-comet-shard-c" />
      <span className="taskspace-comet-shard taskspace-comet-shard-d" />
      <span className="taskspace-comet-shard taskspace-comet-shard-e" />
    </div>
  )
}

export function TaskspaceEmptyState({
  title,
  onSelectStarter,
}: {
  title: string
  onSelectStarter: (starter: StarterPrompt) => void
}) {
  return (
    <div className="text-center mb-6 sm:mb-8 max-w-4xl mx-auto px-1">
      <CometStar />
      <h3 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
        Welcome to {title}
      </h3>
      <TypewriterLine />

      <div className="mt-5 sm:mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left">
        {STARTERS.map((starter) => {
          const Icon = starter.icon
          return (
            <button
              key={`${starter.engineId}-${starter.specialtyId}`}
              type="button"
              onClick={() => onSelectStarter(starter)}
              className={[
                'rounded-2xl border p-3 sm:p-4 transition-all duration-200',
                'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00477d]/40',
                starter.surface,
              ].join(' ')}
              aria-label={`Use ${starter.engineLabel} ${starter.specialtyLabel} starter`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${starter.badge}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${starter.badge}`}>
                  {starter.engineLabel} · {starter.specialtyLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-4 sm:line-clamp-5">
                {starter.prompt}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
