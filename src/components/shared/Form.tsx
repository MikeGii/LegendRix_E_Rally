// src/components/shared/Form.tsx - Universal Form Components
import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function FormModal({ isOpen, onClose, title, children, maxWidth = 'md' }: FormModalProps) {
  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        />
        
        <div className={`inline-block w-full ${maxWidthClasses[maxWidth]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

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

interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder?: string
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