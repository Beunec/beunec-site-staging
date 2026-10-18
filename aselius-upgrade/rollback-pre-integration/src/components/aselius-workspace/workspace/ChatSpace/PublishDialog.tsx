'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, Loader2, Copy, Check, ExternalLink, AlertTriangle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { publishAsset, unpublishAsset, type PublishState } from '../../lib/publishApi'

/**
 * The publish / unpublish dialog, shared by the HTML artifact preview and the
 * markdown document editor.
 *
 * Publishing is the one action in Workspace that moves content outside the auth
 * boundary, so the dialog leads with what that actually means — anyone with the
 * link, no sign-in — before it offers the button, and shows the same warning
 * again while a page is live. Taking a page down destroys the published copy
 * outright rather than hiding it, which is also stated where the person decides.
 */

interface PublishDialogProps {
  open: boolean
  onClose: () => void
  workspaceId: string
  assetId: string
  title: string
  kind: 'html' | 'markdown' | 'image' | 'video' | 'document'
  state: PublishState | null
  onStateChange: (next: PublishState) => void
}

export default function PublishDialog({
  open,
  onClose,
  workspaceId,
  assetId,
  title,
  kind,
  state,
  onStateChange,
}: PublishDialogProps) {
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmingRemoval, setConfirmingRemoval] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => setIsClient(true), [])

  // Reset the transient bits whenever the dialog reopens, so a previous visit's
  // "copied!" tick or half-armed removal never greets the next one.
  useEffect(() => {
    if (open) {
      setCopied(false)
      setConfirmingRemoval(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  const publicUrl = state?.public_url || ''
  const isPublished = Boolean(state?.published && publicUrl)
  // The button is always present, so this dialog is where "publishing is not
  // set up on this environment" has to be said. Silently hiding the control
  // instead just left people unable to find a feature they had been told about.
  const unavailable = state?.available === false

  const handlePublish = useCallback(async () => {
    setBusy(true)
    try {
      const next = await publishAsset(workspaceId, assetId)
      onStateChange(next)
      toast.success(state?.published ? 'Public page updated' : 'Published')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not publish this deliverable.')
    } finally {
      setBusy(false)
    }
  }, [workspaceId, assetId, onStateChange, state?.published])

  const handleUnpublish = useCallback(async () => {
    setBusy(true)
    try {
      const next = await unpublishAsset(workspaceId, assetId)
      onStateChange(next)
      setConfirmingRemoval(false)
      toast.success('Page taken down')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not take this page down.')
    } finally {
      setBusy(false)
    }
  }, [workspaceId, assetId, onStateChange])

  const handleCopy = useCallback(async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Could not copy the link — select it and copy manually.')
    }
  }, [publicUrl])

  if (!isClient) return null

  const kindLabel =
    kind === 'html' ? 'page' : kind === 'image' ? 'image' : kind === 'video' ? 'video' : 'document'

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="publish-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !busy && onClose()}
          role="presentation"
        >
          <motion.div
            key="publish-panel"
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-dialog-title"
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-700 !bg-canvas dark:!bg-gray-900 shadow-2xl p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#00477d]/10 dark:bg-[#6cb2f0]/15 flex items-center justify-center">
                <Globe className="w-4.5 h-4.5 text-[#00477d] dark:text-[#6cb2f0]" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  id="publish-dialog-title"
                  className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight"
                >
                  {unavailable
                    ? 'Publishing needs setup on this deployment'
                    : isPublished
                      ? 'This page is public'
                      : 'Publish for public access'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate" title={title}>
                  {title}
                </p>
              </div>
            </div>

            {/* The warning is the point of this dialog, so it is stated before the
                action either way — once as "here is what will happen", and once
                as "here is what is currently true". */}
            <div className="flex gap-2.5 rounded-xl border border-amber-300/70 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-3 mb-4">
              <AlertTriangle
                className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <p className="text-xs sm:text-[13px] leading-relaxed text-amber-900 dark:text-amber-200">
                {unavailable ? (
                  <>
                    Public links need storage credentials that have not been added to this
                    deployment yet — this is a one-time setup step, not a permission on your
                    account or workspace. Nothing about this {kindLabel} has been shared.
                    Once the credentials are in place, this button starts working with no
                    further changes here.
                  </>
                ) : isPublished ? (
                  <>
                    Anyone with this link can open this {kindLabel} right now — no Aselius
                    account and no workspace access needed. They see{' '}
                    {kind === 'html'
                      ? 'the rendered page, not its code'
                      : kind === 'image' || kind === 'video'
                        ? 'it view-only — no download control is offered'
                        : 'a view-only rendition; the original file is never shared'}.
                  </>
                ) : (
                  <>
                    This creates a link anyone can open — no Aselius account and no workspace
                    access needed. They see{' '}
                    {kind === 'html'
                      ? 'the rendered page, not its code'
                      : kind === 'image' || kind === 'video'
                        ? 'it view-only — no download control is offered'
                        : 'a view-only rendition; the original file is never shared'}. Only what
                    you publish here becomes public, and you can take it down at any time.
                  </>
                )}
              </p>
            </div>

            {isPublished && (
              <div className="mb-4">
                <label
                  htmlFor="publish-url"
                  className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-400 mb-1.5"
                >
                  Public link
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="publish-url"
                    type="text"
                    readOnly
                    value={publicUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 !bg-white dark:!bg-gray-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00477d]/30"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 !bg-white dark:!bg-gray-800 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 hover:border-[#00477d] transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden />
                      )}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 !bg-white dark:!bg-gray-800 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 hover:border-[#00477d] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                      Open
                    </a>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  The public page is a snapshot. Later edits stay private until you update it
                  here.
                </p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="sm:mr-auto px-3.5 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {unavailable ? 'Close' : isPublished ? 'Done' : 'Cancel'}
              </button>

              {isPublished && !confirmingRemoval && (
                <button
                  type="button"
                  onClick={() => setConfirmingRemoval(true)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                  Unpublish
                </button>
              )}

              {isPublished && confirmingRemoval && (
                <button
                  type="button"
                  onClick={() => void handleUnpublish()}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {busy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" aria-hidden />
                  )}
                  Delete it permanently
                </button>
              )}

              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={busy || unavailable}
                title={unavailable ? 'Publishing is not configured on this environment' : undefined}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00477d] hover:brightness-110 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {busy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                ) : (
                  <Globe className="w-3.5 h-3.5" aria-hidden />
                )}
                {isPublished ? 'Update public page' : 'Publish for public access'}
              </button>
            </div>

            {unavailable && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Running this deployment? The step is{' '}
                <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[10px]">
                  scripts/provision-preview-publishing.sh
                </code>
                {' '}— it takes an R2 token and writes the rest itself.
              </p>
            )}

            {confirmingRemoval && (
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-3 leading-relaxed">
                The published copy is deleted outright — the link stops working for everyone,
                everywhere, immediately. You can publish again later, but this page cannot be
                restored.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
