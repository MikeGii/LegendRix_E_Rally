// src/components/shared/RichTextEditor.tsx
'use client'

import { useRef, useState, useEffect } from 'react'

interface RichTextEditorProps {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  rows?: number
}

export function RichTextEditor({
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  rows = 8
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isToolbarSticky, setIsToolbarSticky] = useState(false)
  const [selectedFontSize, setSelectedFontSize] = useState('normal')

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [])

  // Format text with execCommand
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    handleContentChange()
    editorRef.current?.focus()
  }

  // Handle font size change
  const changeFontSize = (size: string) => {
    setSelectedFontSize(size)
    
    const sizeMap: Record<string, string> = {
      'small': '2',
      'normal': '3',
      'large': '5',
      'xlarge': '7'
    }
    
    formatText('fontSize', sizeMap[size])
  }

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }

  // Handle paste to strip formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    handleContentChange()
  }

  // Check if command is active
  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command)
  }

  // Toolbar button component
  const ToolbarButton = ({ 
    command, 
    icon, 
    title,
    onClick
  }: { 
    command?: string
    icon: string
    title: string
    onClick?: () => void
  }) => {
    const isActive = command ? isCommandActive(command) : false

    return (
      <button
        type="button"
        onClick={() => {
          if (onClick) {
            onClick()
          } else if (command) {
            formatText(command)
          }
        }}
        title={title}
        className={`
          px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800
        `}
      >
        {icon}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div 
        className={`
          bg-slate-700/50 border rounded-xl overflow-hidden
          ${error ? 'border-red-500' : 'border-slate-600'}
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
          transition-all duration-200
        `}
      >
        {/* Toolbar */}
        <div 
          className={`
            flex items-center gap-2 p-3 bg-slate-800/50 border-b border-slate-700
            ${isToolbarSticky ? 'sticky top-0 z-10' : ''}
          `}
        >
          {/* Text formatting buttons */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              command="bold"
              icon="B"
              title="Rasvane (Ctrl+B)"
            />
            <ToolbarButton
              command="italic"
              icon="I"
              title="Kaldkiri (Ctrl+I)"
            />
            <ToolbarButton
              command="underline"
              icon="U"
              title="Allajoonitud (Ctrl+U)"
            />
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-slate-600 mx-1" />

          {/* Font size dropdown */}
          <div className="relative">
            <select
              value={selectedFontSize}
              onChange={(e) => changeFontSize(e.target.value)}
              className="
                px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg
                text-sm text-slate-300 hover:bg-slate-600 hover:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200 cursor-pointer
              "
            >
              <option value="small">Väike</option>
              <option value="normal">Tavaline</option>
              <option value="large">Suur</option>
              <option value="xlarge">Väga suur</option>
            </select>
          </div>

          {/* Additional formatting options */}
          <div className="w-px h-6 bg-slate-600 mx-1" />
          
          <div className="flex items-center gap-1">
            <ToolbarButton
              command="insertUnorderedList"
              icon="• —"
              title="Täpploend"
            />
            <ToolbarButton
              command="insertOrderedList"
              icon="1."
              title="Numberloend"
            />
          </div>

          {/* Clear formatting */}
          <div className="ml-auto">
            <ToolbarButton
              command="removeFormat"
              icon="Tx"
              title="Eemalda vormindus"
            />
          </div>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onPaste={handlePaste}
          className="
            w-full px-4 py-3 text-white
            focus:outline-none
            min-h-[200px] max-h-[500px] overflow-y-auto
          "
          style={{ minHeight: `${rows * 1.5}rem` }}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Hint about keyboard shortcuts */}
      <p className="text-slate-500 text-xs">
        Kiirklahvid: Ctrl+B (rasvane), Ctrl+I (kaldkiri), Ctrl+U (allajoonitud)
      </p>
    </div>
  )
}

// Helper function to strip HTML tags (useful for preview/excerpt)
export function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Helper function to sanitize HTML content
export function sanitizeHtml(html: string): string {
  // Basic sanitization - you can expand this based on your needs
  const div = document.createElement('div')
  div.innerHTML = html
  
  // Remove script tags and event handlers
  const scripts = div.getElementsByTagName('script')
  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].remove()
  }
  
  // Remove event attributes
  const allElements = div.getElementsByTagName('*')
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i]
    const attrs = el.attributes
    for (let j = attrs.length - 1; j >= 0; j--) {
      const attr = attrs[j]
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name)
      }
    }
  }
  
  return div.innerHTML
}