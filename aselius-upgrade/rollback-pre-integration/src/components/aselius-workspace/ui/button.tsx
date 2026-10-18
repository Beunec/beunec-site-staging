import React from 'react'
import { motion, MotionProps } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-[#00477d] dark:!bg-[#00477d] text-white hover:bg-[#003666] dark:hover:!bg-[#003666] focus:ring-[#00477d]/50 transition-colors duration-300',
    secondary: 'bg-gray-100 dark:!bg-gray-800 text-gray-900 dark:!text-gray-300 hover:bg-gray-200 dark:hover:!bg-gray-700 focus:ring-gray-500/50 transition-colors duration-300',
    ghost: 'text-gray-600 dark:!text-gray-300 hover:text-gray-900 dark:hover:!text-white hover:bg-gray-100 dark:hover:!bg-gray-800 focus:ring-gray-500/50 transition-colors duration-300',
    danger: 'bg-red-600 dark:!bg-red-600 text-white hover:bg-red-700 dark:hover:!bg-red-700 focus:ring-red-500/50 transition-colors duration-300'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {Icon && !loading && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </motion.button>
  )
}