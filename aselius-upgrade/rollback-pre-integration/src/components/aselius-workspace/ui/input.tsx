import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:!text-gray-300 mb-1 transition-colors duration-300">
          {label}
        </label>
      )}
      <motion.input
        ref={ref}
        whileFocus={{ scale: 1.01 }}
        className={`
          w-full px-3 py-2 
          bg-canvas dark:!bg-gray-800
          border border-gray-300 dark:!border-gray-600 rounded-lg 
          text-gray-900 dark:!text-white
          placeholder-gray-400 dark:!placeholder-gray-500
          focus:ring-2 focus:ring-[#00477d]/50 dark:focus:ring-[#00477d]/50 focus:border-[#00477d] 
          transition-all duration-300
          ${error ? 'border-red-500 dark:!border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600 dark:!text-red-400 transition-colors duration-300"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'