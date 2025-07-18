'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'
import { CategoryCreateModal } from './CategoryCreateModal'
import { useProductCategories } from '@/hooks/useProductCategories'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { Product } from './ProductsTable'

interface ProductFormData {
  product_name: string
  product_price: number
  category_id: string
  product_description: string
  is_top_product: boolean
  display_order: number
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingProduct?: Product | null
}

export function ProductFormModal({ isOpen, onClose, editingProduct }: ProductFormModalProps) {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const createProductMutation = useCreateProduct()
    const updateProductMutation = useUpdateProduct()  

    const { data: categories = [] } = useProductCategories()
    const queryClient = useQueryClient()

    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
    } = useForm<ProductFormData>({
    defaultValues: {
        product_name: '',
        product_price: 0,
        category_id: '',
        product_description: '',
        is_top_product: false,
        display_order: 0
    }
    })

    useEffect(() => {
    if (editingProduct) {
        setValue('product_name', editingProduct.product_name)
        setValue('product_price', editingProduct.product_price)
        setValue('category_id', editingProduct.category_id)
        setValue('product_description', editingProduct.product_description || '')
        setValue('is_top_product', editingProduct.is_top_product)
        setValue('display_order', editingProduct.display_order)
    } else {
        reset()
    }
    }, [editingProduct, setValue, reset])

    const handleClose = () => {
    reset()
    setShowSuccessMessage(false)
    onClose()
    }

    const onSubmit = async (data: ProductFormData) => {
        try {
            console.log(editingProduct ? '🔄 Updating product:' : '🔄 Creating product:', data)
            
            if (editingProduct) {
            // Update existing product
            await updateProductMutation.mutateAsync({
                product_id: editingProduct.product_id,
                ...data
            })
            } else {
            // Create new product
            await createProductMutation.mutateAsync(data)
            }
            
            console.log(editingProduct ? '✅ Product updated successfully' : '✅ Product created successfully')
            
            // Show success message
            setShowSuccessMessage(true)
            
            // Close modal after a short delay
            setTimeout(() => {
            handleClose()
            }, 1500)
            
        } catch (error: any) {
            console.error(editingProduct ? '❌ Product update error:' : '❌ Product creation error:', error)
        }
    }

    const handleCategoryCreated = () => {
        // Refresh categories list
        queryClient.invalidateQueries({ queryKey: ['product_categories'] })
        setIsCategoryModalOpen(false)
    }

  return (
    <>
    <Modal
    isOpen={isOpen}
    onClose={handleClose}
    title={editingProduct ? "Muuda Toodet" : "Lisa Uus Toode"}
    maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {showSuccessMessage && (
            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center space-x-2">
                <span className="text-lg">✅</span>
                <span>Toode edukalt lisatud!</span>
            </div>
            )}

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Toote nimi <span className="text-red-400">*</span>
          </label>
          <input
            {...register('product_name', {
              required: 'Toote nimi on kohustuslik',
              minLength: { value: 2, message: 'Toote nimi peab olema vähemalt 2 tähemärki' }
            })}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                     text-white placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                     transition-all duration-200"
            placeholder="Sisesta toote nimi..."
          />
          {errors.product_name && (
            <p className="text-red-400 text-sm mt-1">{errors.product_name.message}</p>
          )}
        </div>

        {/* Price and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Price */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hind (€) <span className="text-red-400">*</span>
            </label>
            <input
              {...register('product_price', {
                required: 'Hind on kohustuslik',
                min: { value: 0.01, message: 'Hind peab olema positiivne' },
                valueAsNumber: true
              })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                       text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       transition-all duration-200"
              placeholder="0.00"
            />
            {errors.product_price && (
              <p className="text-red-400 text-sm mt-1">{errors.product_price.message}</p>
            )}
          </div>

          {/* Category with Add New Button */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Kategooria <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              <select
                {...register('category_id', { required: 'Kategooria on kohustuslik' })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                         text-white
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         transition-all duration-200"
              >
                <option value="">Vali kategooria</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300
                         rounded-xl transition-all duration-200 backdrop-blur-sm border border-red-500/30 
                         hover:border-red-400/50 text-sm font-medium"
              >
                ➕ Lisa uus kategooria
              </button>
            </div>
            {errors.category_id && (
              <p className="text-red-400 text-sm mt-1">{errors.category_id.message}</p>
            )}
          </div>
        </div>  

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Kirjeldus
          </label>
          <textarea
            {...register('product_description')}
            rows={4}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                     text-white placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                     transition-all duration-200 resize-vertical"
            placeholder="Sisesta toote kirjeldus..."
          />
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Järjekord
            </label>
            <input
              {...register('display_order', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                       text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       transition-all duration-200"
              placeholder="0"
            />
          </div>

          {/* Top Product */}
          <div className="flex items-center justify-center">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                {...register('is_top_product')}
                type="checkbox"
                className="w-5 h-5 text-red-600 bg-slate-700 border-slate-600 rounded
                         focus:ring-red-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-slate-300">
                Esiletõstetud toode
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700/50">
            <button
                type="button"
                onClick={handleClose}
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Tühista
            </button>
            <button
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl
                        transition-all duration-200 transform hover:scale-105
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
                {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                    <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvestamine...</span>
                    </span>
                ) : (
                    editingProduct ? 'Salvesta Muudatused' : 'Lisa Toode'
                )}
            </button>
        </div>
      </form>
    </Modal>

    {/* Category Creation Modal */}
    <CategoryCreateModal
      isOpen={isCategoryModalOpen}
      onClose={() => setIsCategoryModalOpen(false)}
      onCategoryCreated={handleCategoryCreated}
    />
  </>

  )
}