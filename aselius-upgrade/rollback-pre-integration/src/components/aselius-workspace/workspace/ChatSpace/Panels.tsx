/**
 * Panels.tsx
 *
 * Overlay modals used by ChatSpace.
 *
 * Exported:
 *   DeleteConfirmModal
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'

import type { Asset } from './ChatSpace'

// ─────────────────────────────────────────────────────────────────────────────
// DeleteConfirmModal
// ─────────────────────────────────────────────────────────────────────────────

export const DeleteConfirmModal = ({
  isOpen,
  asset,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  asset: Asset | null
  onConfirm: () => void
  onCancel: () => void
}) => {
  if (!isOpen || !asset) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-canvas dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative z-[61] border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Asset</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{' '}
              <strong className="text-gray-900 dark:text-white">"{asset.name}"</strong>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This will permanently remove the asset from your workspace.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ConfirmModal — generic destructive-action confirm (same visual language as
// DeleteConfirmModal, but not tied to the Asset type). Used by the Rivine Code
// workspace for file/folder delete instead of the native window.confirm.
// ─────────────────────────────────────────────────────────────────────────────

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-canvas dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative z-[61] border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <div className="mb-6 text-gray-700 dark:text-gray-300">{message}</div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
