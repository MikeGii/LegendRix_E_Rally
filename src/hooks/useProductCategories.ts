import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ProductCategory {
  category_id: string
  category_name: string
}

export interface CreateCategoryInput {
  category_name: string
}

// Query keys
export const categoryKeys = {
  all: ['product_categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
}

// Get all categories
export function useProductCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async (): Promise<ProductCategory[]> => {
      console.log('🔄 Fetching product categories...')
      
      const { data, error } = await supabase
        .from('product_categories')
        .select('category_id, category_name')
        .order('category_name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching categories:', error)
        throw error
      }

      console.log('✅ Categories fetched:', data?.length || 0)
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create new category
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCategoryInput): Promise<ProductCategory> => {
      console.log('🔄 Creating category:', input.category_name)

      const { data, error } = await supabase
        .from('product_categories')
        .insert([{
          category_name: input.category_name.trim()
        }])
        .select('category_id, category_name')
        .single()

      if (error) {
        console.error('❌ Error creating category:', error)
        throw error
      }

      console.log('✅ Category created successfully')
      return data
    },
    onSuccess: () => {
      // Invalidate categories cache
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
    onError: (error) => {
      console.error('❌ Category creation failed:', error)
    }
  })
}