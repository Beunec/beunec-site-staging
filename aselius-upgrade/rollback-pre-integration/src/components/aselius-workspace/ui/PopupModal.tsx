import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export interface PopupModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

export const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  duration = 3000
}) => {
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />
      default:
        return <Info className="w-6 h-6 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-blue-800'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`relative w-full max-w-md ${getBackgroundColor()} border rounded-2xl shadow-2xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getIcon()}
                <h3 className={`text-lg font-semibold ${getTextColor()}`}>
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <p className={`text-sm ${getTextColor()} leading-relaxed`}>
                {message}
              </p>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end p-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  type === 'success' 
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : type === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : type === 'warning'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                type="button"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing popup modals
export const usePopupModal = () => {
  const [modal, setModal] = React.useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    duration: 3000
  })

  const showModal = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    duration?: number
  ) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      duration
    })
  }

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  const showSuccess = (title: string, message: string, duration?: number) => {
    showModal('success', title, message, duration)
  }

  const showError = (title: string, message: string, duration?: number) => {
    showModal('error', title, message, duration)
  }

  const showWarning = (title: string, message: string, duration?: number) => {
    showModal('warning', title, message, duration)
  }

  const showInfo = (title: string, message: string, duration?: number) => {
    showModal('info', title, message, duration)
  }

  return {
    modal,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
