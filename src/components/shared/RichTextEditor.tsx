// src/components/shared/RichTextEditor.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import '@/styles/quill.css'
import '@/styles/quill-overrides.css' // Add this if you created the overrides file

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Kirjuta siia...',
  error,
  hint,
  label,
  required = false,
  minHeight = 200,
  readOnly = false,
  className = '',
  toolbar = 'basic'
}) {
  const [mounted, setMounted] = useState(false)
  const [quill, setQuill] = useState(null)
  const editorRef = useRef(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true)
      
      // Import Quill dynamically
      import('quill').then(Quill => {
        if (!quill && editorRef.current) {
          // Define toolbar options based on the selected preset
          const toolbarOptions = {
            minimal: [
              ['bold', 'italic', 'underline'],
              ['clean']
            ],
            basic: [
              ['bold', 'italic', 'underline', 'strike'],
              [{'list': 'ordered'}, {'list': 'bullet'}],
              ['link'],
              ['clean']
            ],
            full: [
              [{'header': [1, 2, 3, false]}],
              ['bold', 'italic', 'underline', 'strike'],
              [{'list': 'ordered'}, {'list': 'bullet'}],
              [{'indent': '-1'}, {'indent': '+1'}],
              [{'align': []}],
              ['link'],
              ['clean']
            ]
          }
          
          // Apply custom translations for Estonian
          const QuillClass = Quill.default;
          
          // Create Quill instance
          const quillInstance = new QuillClass(editorRef.current, {
            modules: {
              toolbar: toolbarOptions[toolbar],
              clipboard: {
                matchVisual: false
              }
            },
            placeholder: placeholder,
            readOnly: readOnly,
            theme: 'snow'
          })
          
          // Instead of trying to access tooltip directly, handle it after a small delay
          // to ensure all Quill components are initialized
          setTimeout(() => {
            try {
              // Use querySelector to find and modify tooltip elements directly
              // This avoids TypeScript errors since we're not using the theme.tooltip property
              const tooltipActionEl = document.querySelector('.ql-tooltip a.ql-action');
              const tooltipRemoveEl = document.querySelector('.ql-tooltip a.ql-remove');
              
              if (tooltipActionEl) {
                tooltipActionEl.textContent = 'Muuda';
              }
              
              if (tooltipRemoveEl) {
                tooltipRemoveEl.textContent = 'Eemalda';
              }
            } catch (err) {
              // Silent catch - not critical if translations fail
              console.log('Note: Could not translate tooltip elements', err);
            }
          }, 500);
          
          // Set initial content
          const sanitizedValue = value ? DOMPurify.sanitize(value) : '';
          quillInstance.root.innerHTML = sanitizedValue;
          
          // Add change event listener
          quillInstance.on('text-change', () => {
            const html = quillInstance.root.innerHTML;
            if (html !== value) {
              const sanitizedHtml = DOMPurify.sanitize(html);
              onChange(sanitizedHtml === '<p><br></p>' ? '' : sanitizedHtml);
            }
          });
          
          setQuill(quillInstance);
        }
      }).catch(err => {
        console.error('Failed to load Quill editor:', err);
      });
    }
    
    // Cleanup function
    return () => {
      if (quill) {
        quill.off('text-change');
      }
    };
  }, []);
  
  // Update content when value prop changes
  useEffect(() => {
    if (quill && value !== undefined) {
      const sanitizedValue = DOMPurify.sanitize(value);
      if (quill.root.innerHTML !== sanitizedValue) {
        quill.root.innerHTML = sanitizedValue;
      }
    }
  }, [value, quill]);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {mounted ? (
        <div
          className={`
            quill-editor
            rounded-xl overflow-hidden
            ${error ? 'quill-error' : ''}
            ${readOnly ? 'quill-readonly' : ''}
          `}
        >
          <div ref={editorRef} style={{ minHeight: `${minHeight}px` }} />
        </div>
      ) : (
        <div className="w-full h-[200px] bg-slate-700/50 rounded-xl border border-slate-600 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-slate-400 text-sm">{hint}</p>
      )}
    </div>
  );
}

export default RichTextEditor;