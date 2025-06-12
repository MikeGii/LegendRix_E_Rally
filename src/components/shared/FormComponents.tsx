// src/components/shared/FormComponents.tsx - Reusable form elements
import { ReactNode, forwardRef } from 'react'

// ============= Input Components =============
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  hint, 
  icon, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label} {props.required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">{icon}</span>
          </div>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700'}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-red-400 text-sm flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
      
      {hint && !error && (
        <p className="text-slate-400 text-xs">{hint}</p>
      )}
    </div>
  )
})
Input.displayName = 'Input'

// ============= Textarea Component =============
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ 
  label, 
  error, 
  hint, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label} {props.required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700'}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-red-400 text-sm flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
      
      {hint && !error && (
        <p className="text-slate-400 text-xs">{hint}</p>
      )}
    </div>
  )
})
Textarea.displayName = 'Textarea'

// ============= Select Component =============
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ 
  label, 
  error, 
  hint, 
  options, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label} {props.required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700'}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
            className="bg-slate-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-red-400 text-sm flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
      
      {hint && !error && (
        <p className="text-slate-400 text-xs">{hint}</p>
      )}
    </div>
  )
})
Select.displayName = 'Select'

// ============= Checkbox Component =============
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ 
  label, 
  description, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="flex items-start space-x-3">
      <input
        ref={ref}
        type="checkbox"
        className={`mt-1 w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded 
          focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      <div className="flex-1">
        <label className="text-sm font-medium text-slate-300 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
})
Checkbox.displayName = 'Checkbox'

// ============= Form Grid Layout =============
interface FormGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function FormGrid({ children, columns = 1, className = '' }: FormGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  )
}

// ============= Form Section =============
interface FormSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-slate-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// ============= Form Actions =============
interface FormActionsProps {
  children: ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}

export function FormActions({ children, align = 'right', className = '' }: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end'
  }

  return (
    <div className={`flex space-x-4 pt-6 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}

// ============= Button Components =============
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  icon,
  children,
  className = '', 
  disabled,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-blue-500/25',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-lg hover:shadow-green-500/25',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-red-500/25',
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-700/50 focus:ring-slate-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
      )}
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </button>
  )
})
Button.displayName = 'Button'