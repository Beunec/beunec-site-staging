'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  itemName?: string
  loading?: boolean
  irreversibleNote?: string | false
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  itemName,
  loading = false,
  irreversibleNote = 'This action cannot be undone.',
}) => {
  const handleConfirm = () => {
    onConfirm()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-500 dark:text-red-400',
          iconBg: 'bg-red-50 dark:bg-red-900/20',
          confirmBg: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
          confirmText: 'text-white'
        }
      case 'warning':
        return {
          iconColor: 'text-amber-500 dark:text-amber-400',
          iconBg: 'bg-amber-50 dark:bg-amber-900/20',
          confirmBg: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700',
          confirmText: 'text-white'
        }
      case 'info':
        return {
          iconColor: 'text-blue-500 dark:text-blue-400',
          iconBg: 'bg-blue-50 dark:bg-blue-900/20',
          confirmBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
          confirmText: 'text-white'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-canvas dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {/* Close Button */}
              <div className="relative px-6 pt-4">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Icon - Centered at top */}
              <div className="flex justify-center pt-2 pb-4">
                <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                  <AlertTriangle className={`w-8 h-8 ${styles.iconColor}`} />
                </div>
              </div>

              {/* Content - Center aligned */}
              <div className="px-6 pb-6 text-center">
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {message}
                </p>

                {/* Item Name */}
                {itemName && (
                  <div className="mt-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {itemName}
                    </p>
                  </div>
                )}

                {/* Optional footer note */}
                {irreversibleNote !== false && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {irreversibleNote}
                  </p>
                )}
              </div>

              {/* Footer - Center aligned buttons */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center space-x-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`px-5 py-2.5 text-sm font-medium ${styles.confirmText} ${styles.confirmBg} rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
