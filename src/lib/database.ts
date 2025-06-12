// src/lib/database.ts - Vercel-friendly Database Service
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-application-name': 'ewrc-admin'
      }
    }
  }
)

export interface DatabaseConfig {
  table: string
  filters?: { field: string; operator: string; value: any }[]
  sort?: { field: string; direction: 'asc' | 'desc' }[]
  limit?: number
  offset?: number
}

export class DatabaseService {
  static async findMany<T>(table: string, config: Partial<DatabaseConfig> = {}): Promise<T[]> {
    try {
      let query = supabase.from(table).select('*')
      
      // Apply filters
      if (config.filters) {
        config.filters.forEach(filter => {
          query = query.filter(filter.field, filter.operator as any, filter.value)
        })
      }
      
      // Apply sorting
      if (config.sort) {
        config.sort.forEach(sort => {
          query = query.order(sort.field, { ascending: sort.direction === 'asc' })
        })
      }
      
      // Apply pagination
      if (config.limit) {
        query = query.limit(config.limit)
      }
      if (config.offset) {
        query = query.range(config.offset, config.offset + (config.limit || 10) - 1)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error(`Database query error (${table}):`, error)
        throw new Error(`Failed to fetch ${table}: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error(`DatabaseService.findMany error:`, error)
      throw error
    }
  }
  
  static async findById<T>(table: string, id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch ${table} by ID: ${error.message}`)
      }
      
      return data || null
    } catch (error) {
      console.error(`DatabaseService.findById error:`, error)
      throw error
    }
  }
  
  static async create<T>(table: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to create ${table}: ${error.message}`)
      }
      
      return result
    } catch (error) {
      console.error(`DatabaseService.create error:`, error)
      throw error
    }
  }
  
  static async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to update ${table}: ${error.message}`)
      }
      
      return result
    } catch (error) {
      console.error(`DatabaseService.update error:`, error)
      throw error
    }
  }
  
  static async delete(table: string, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) {
        throw new Error(`Failed to delete ${table}: ${error.message}`)
      }
    } catch (error) {
      console.error(`DatabaseService.delete error:`, error)
      throw error
    }
  }
  
  static async count(table: string, filters?: { field: string; operator: string; value: any }[]): Promise<number> {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true })
      
      if (filters) {
        filters.forEach(filter => {
          query = query.filter(filter.field, filter.operator as any, filter.value)
        })
      }
      
      const { count, error } = await query
      
      if (error) {
        throw new Error(`Failed to count ${table}: ${error.message}`)
      }
      
      return count || 0
    } catch (error) {
      console.error(`DatabaseService.count error:`, error)
      throw error
    }
  }
}