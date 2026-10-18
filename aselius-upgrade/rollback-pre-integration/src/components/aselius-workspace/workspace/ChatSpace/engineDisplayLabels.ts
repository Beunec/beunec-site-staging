const ENGINE_LABELS: Record<string, string> = {
  rivine_chat: 'Rivine TaskForce',
  'rivine-chat': 'Rivine TaskForce',
  // Added for Observability, which reads the normalized engine_key group
  // (aselius_workspace/observability_ledger.py::ENGINE_GROUPS) rather than
  // the '-'-separated route-path spelling the rest of this map otherwise
  // uses — both spellings are kept so either caller gets a real label
  // instead of falling through to the humanized-slug fallback below.
  rivine_research: 'Rivine Research',
  'rivine-research': 'Rivine Research',
  rivine_code: 'Rivine Code',
  'rivine-code': 'Rivine Code',
  rivine_creative: 'Rivine Creative',
  'rivine-creative': 'Rivine Creative',
  rivine_cicero: 'Rivine Cicero',
  'rivine-cicero': 'Rivine Cicero',
  rivine_confluence: 'Rivine Confluence',
  'rivine-confluence': 'Rivine Confluence',
  mediator: 'Mediator',
  // Not a real engine — the pre-routing state for a request the mediator
  // has not yet classified (or a request that was refused before routing,
  // e.g. a rate limit). Labeled rather than left to the raw-slug fallback,
  // since "auto" read literally is confusing on an activity list.
  auto: 'Routing…',
}

export function getEngineDisplayLabel(engineId: string, fallback?: string): string {
  return ENGINE_LABELS[engineId] || fallback || engineId.replace(/[_-]/g, ' ')
}

