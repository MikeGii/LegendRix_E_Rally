'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'

interface CategoryFormData {
  category_name: string
}

interface CategoryCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated: () => void
}

export function CategoryCreateModal({ isOpen, onClose, onCategoryCreated }: CategoryCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryFormData>({
    defaultValues: {
      category_name: ''
    }
  })

  const handleClose = () => {
    reset()
    setSubmitError('')
    onClose()
  }

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      console.log('🔄 Creating category:', data.category_name)

      const { error } = await supabase
        .from('product_categories')
        .insert([{
          category_name: data.category_name.trim()
        }])

      if (error) {
        console.error('❌ Error creating category:', error)
        if (error.code === '23505') {
          setSubmitError('See kategooria on juba olemas.')
        } else {
          setSubmitError('Kategooria lisamine ebaõnnestus. Palun proovi uuesti.')
        }
        return
      }

      console.log('✅ Category created successfully')
      handleClose()
      onCategoryCreated() // Refresh the parent component
      
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setSubmitError('Ootamatu viga. Palun proovi uuesti.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Lisa Uus Kategooria"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {submitError}
          </div>
        )}

        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Kategooria nimi <span className="text-red-400">*</span>
          </label>
          <input
            {...register('category_name', {
              required: 'Kategooria nimi on kohustuslik',
              minLength: { value: 2, message: 'Kategooria nimi peab olema vähemalt 2 tähemärki' },
              maxLength: { value: 100, message: 'Kategooria nimi ei tohi olla üle 100 tähemärgi' }
            })}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                     text-white placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                     transition-all duration-200"
            placeholder="Sisesta kategooria nimi..."
            autoFocus
          />
          {errors.category_name && (
            <p className="text-red-400 text-sm mt-1">{errors.category_name.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tühista
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl
                     transition-all duration-200 transform hover:scale-105
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Salvestamine...</span>
              </span>
            ) : (
              'Lisa Kategooria'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}