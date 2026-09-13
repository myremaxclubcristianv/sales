import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types'

type PropertyInsert = Database['public']['Tables']['properties']['Insert']
type PropertyUpdate = Database['public']['Tables']['properties']['Update']
type PropertyMediaInsert = Database['public']['Tables']['property_media']['Insert']
type PropertyDocumentInsert = Database['public']['Tables']['property_documents']['Insert']

export interface PropertyFilterParams {
  type?: string
  status?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  location?: string
}

export async function getProperties(filters?: PropertyFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('properties')
    .select(`
      *,
      owner:clients!properties_owner_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      media:property_media (
        id,
        file_path,
        file_name,
        file_type,
        is_primary,
        display_order
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.status) {
    query = query.eq('property_status', filters.status)
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  if (filters?.minPrice !== undefined && filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte('price', filters.maxPrice)
  }
  if (filters?.bedrooms !== undefined && filters.bedrooms > 0) {
    query = query.gte('bedrooms', filters.bedrooms)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPublicProperties(filters?: PropertyFilterParams) {
  const supabase = await createServerClient()
  let query = supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      type,
      location,
      area,
      neighborhood,
      bedrooms,
      bathrooms,
      rooms,
      built_area,
      land_area,
      price,
      currency,
      property_status,
      availability,
      description,
      features,
      public_price_visibility,
      public_location_visibility,
      created_at,
      media:property_media (
        id,
        file_path,
        file_name,
        file_type,
        is_primary,
        display_order
      )
    `)
    .eq('public_visibility', true)
    .eq('property_status', 'PUBLIC')
    .order('created_at', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.location) {
    query = query.or(`location.ilike.%${filters.location}%,area.ilike.%${filters.location}%`)
  }
  if (filters?.minPrice !== undefined && filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte('price', filters.maxPrice)
  }
  if (filters?.bedrooms !== undefined && filters.bedrooms > 0) {
    query = query.gte('bedrooms', filters.bedrooms)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPropertyById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:clients!properties_owner_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      seller:clients!properties_seller_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        email
      ),
      media:property_media (
        id,
        file_path,
        file_name,
        file_type,
        is_primary,
        display_order,
        created_at
      ),
      documents:property_documents (
        id,
        file_path,
        file_name,
        file_type,
        category,
        description,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getPublicPropertyBySlug(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      type,
      location,
      area,
      neighborhood,
      bedrooms,
      bathrooms,
      rooms,
      built_area,
      land_area,
      price,
      currency,
      property_status,
      availability,
      description,
      features,
      public_price_visibility,
      public_location_visibility,
      created_at,
      media:property_media (
        id,
        file_path,
        file_name,
        file_type,
        is_primary,
        display_order
      )
    `)
    .eq('slug', slug)
    .eq('public_visibility', true)
    .eq('property_status', 'PUBLIC')
    .single()

  if (error) return null
  return data
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base}-${Date.now().toString(36).substring(4)}`
}

export async function createProperty(property: PropertyInsert) {
  const supabase = await createServerClient()
  const slug = property.slug || generateSlug(property.title)

  const { data, error } = await supabase
    .from('properties')
    .insert({
      ...property,
      slug,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProperty(id: string, property: PropertyUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('properties')
    .update(property)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addPropertyMedia(media: PropertyMediaInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('property_media')
    .insert(media)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePropertyMedia(mediaId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('property_media')
    .delete()
    .eq('id', mediaId)

  if (error) throw error
}

export async function addPropertyDocument(doc: PropertyDocumentInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('property_documents')
    .insert(doc)
    .select()
    .single()

  if (error) throw error
  return data
}
