'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { visibleCloudHandle } from '@/lib/displayHandle'

export type ConnectionOption = {
  cloudhandle: string
  displayHandle?: string | null
  name?: string
}

export interface ConnectionPickerProps {
  connections: ConnectionOption[]
  value: string
  onChange: (cloudhandle: string) => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function ConnectionPicker({
  connections,
  value,
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Search connections…',
}: ConnectionPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = connections.find((c) => c.cloudhandle === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return connections
    return connections.filter(
      (c) =>
        c.cloudhandle.includes(q) ||
        (c.displayHandle || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q),
    )
  }, [connections, query])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
    setQuery('')
  }, [open])

  const displayLabel = selected
    ? selected.name
      ? `${selected.name}`
      : `@${visibleCloudHandle(selected)}`
    : null

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        className={[
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors',
          'border-gray-200 dark:border-gray-600 !bg-canvas dark:!bg-gray-800',
          disabled || loading ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#00477d]/40',
          open ? 'ring-2 ring-[#00477d]/20 border-[#00477d]/50' : '',
        ].join(' ')}
      >
        <span className={`truncate ${displayLabel ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
          {loading ? 'Loading connections…' : displayLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[110] mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-600 !bg-canvas dark:!bg-gray-800 shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or @handle"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00477d]/25"
                />
              </div>
            </div>
            <ul className="max-h-52 overflow-y-auto overscroll-contain py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-sm text-gray-500 text-center">No connections found</li>
              ) : (
                filtered.map((c) => {
                  const isActive = c.cloudhandle === value
                  return (
                    <li key={c.cloudhandle}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(c.cloudhandle)
                          setOpen(false)
                        }}
                        className={[
                          'w-full text-left px-3 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-[#00477d]/10 text-[#00477d] dark:text-blue-400'
                            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60',
                        ].join(' ')}
                      >
                        <span className="font-medium block truncate">
                          {c.name || c.cloudhandle}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                          @{visibleCloudHandle(c)}
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Normalize raw getConnections() API rows into picker options. */
export function mapApiConnections(
  users: unknown,
): ConnectionOption[] {
  const list = Array.isArray(users) ? users : []
  return list
    .map((u: { cloudhandle?: string; handle?: string; name?: string; username?: string; displayHandle?: string | null }) => ({
      cloudhandle: (u.cloudhandle || u.handle || '').toLowerCase(),
      displayHandle: u.displayHandle || null,
      name: u.name || u.username || undefined,
    }))
    .filter((u) => u.cloudhandle)
}
