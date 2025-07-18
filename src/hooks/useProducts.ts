import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Product {
  product_id: string
  product_name: string
  product_price: number
  category_id: string
  product_description: string
  is_top_product: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface CreateProductInput {
  product_name: string
  product_price: number
  category_id: string
  product_description: string
  is_top_product: boolean
  display_order: number
}

export interface UpdateProductInput {
  product_id: string
  product_name: string
  product_price: number
  category_id: string
  product_description: string
  is_top_product: boolean
  display_order: number
}

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
}

// Create new product
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateProductInput): Promise<Product> => {
      console.log('🔄 Creating product:', input.product_name)

      const { data, error } = await supabase
        .from('products')
        .insert([{
          product_name: input.product_name.trim(),
          product_price: input.product_price,
          category_id: input.category_id,
          product_description: input.product_description.trim(),
          is_top_product: input.is_top_product,
          display_order: input.display_order
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating product:', error)
        throw error
      }

      console.log('✅ Product created successfully')
      return data
    },
    onSuccess: () => {
      // Invalidate products cache
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error) => {
      console.error('❌ Product creation failed:', error)
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateProductInput): Promise<Product> => {
      console.log('🔄 Updating product:', input.product_id)

      const { data, error } = await supabase
        .from('products')
        .update({
          product_name: input.product_name.trim(),
          product_price: input.product_price,
          category_id: input.category_id,
          product_description: input.product_description.trim(),
          is_top_product: input.is_top_product,
          display_order: input.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', input.product_id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating product:', error)
        throw error
      }

      console.log('✅ Product updated successfully')
      return data
    },
    onSuccess: () => {
      // Invalidate products cache
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => {
      console.error('❌ Product update failed:', error)
    }
  })
}