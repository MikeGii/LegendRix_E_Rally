// src/components/shared/FormComponents.tsx - Universal Form Components
import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string
  error?: string
  hint?: string
  icon?: string
}

export function Input({ label, error, hint, icon, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">{icon}</span>
          </div>
        )}
        
        <input
          {...props}
          className={`
            w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
            text-white placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        />
      </div>
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-slate-400 text-sm">{hint}</p>
      )}
    </div>
  )
}

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        {...props}
        className={`
          w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
          text-white placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 resize-vertical
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
        `}
      />
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-slate-400 text-sm">{hint}</p>
      )}
    </div>
  )
}

interface SelectProps {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: () => void  // Add missing onBlur prop
  name?: string        // Add missing name prop
  required?: boolean
  disabled?: boolean
}

export function Select({ label, error, hint, options, placeholder, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <select
        {...props}
        className={`
          w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
          text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-slate-400 text-sm">{hint}</p>
      )}
    </div>
  )
}

interface FormGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
}

export function FormGrid({ children, columns = 2 }: FormGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-4`}>
      {children}
    </div>
  )
}

interface FormActionsProps {
  children: ReactNode
  align?: 'left' | 'center' | 'right'
}

export function FormActions({ children, align = 'right' }: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  return (
    <div className={`flex ${alignClasses[align]} space-x-3 pt-6 border-t border-slate-700`}>
      {children}
    </div>
  )
}

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  loading?: boolean
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
  icon?: string
  size?: 'sm' | 'md' | 'lg'    // Add missing size prop
  className?: string          // Add missing className prop
}

export function Button({ 
  type = 'button',
  variant = 'primary', 
  loading = false, 
  disabled = false,
  children,
  onClick,
  icon,
  size = 'md',      // Default size
  className = ''    // Default className
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-xl font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </div>
      )}
    </button>
  )
}

interface FormSectionProps {
  title?: string
  description?: string
  children: ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-lg font-medium text-white">{title}</h4>
          )}
          {description && (
            <p className="text-slate-400 text-sm">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
