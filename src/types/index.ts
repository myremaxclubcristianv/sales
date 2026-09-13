export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'ADMIN' | 'AGENT' | 'ASSISTANT' | 'VIEWER'
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: 'ADMIN' | 'AGENT' | 'ASSISTANT' | 'VIEWER'
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'ADMIN' | 'AGENT' | 'ASSISTANT' | 'VIEWER'
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          legal_name: string | null
          registration_number: string | null
          tax_id: string | null
          phone: string | null
          email: string | null
          website: string | null
          address: string | null
          city: string | null
          country: string
          industry: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          legal_name?: string | null
          registration_number?: string | null
          tax_id?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          country?: string
          industry?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          legal_name?: string | null
          registration_number?: string | null
          tax_id?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          country?: string
          industry?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          company_id: string | null
          role: string | null
          phone: string | null
          whatsapp: string | null
          email: string | null
          secondary_contact: string | null
          address: string | null
          city: string | null
          country: string
          preferred_communication: 'phone' | 'whatsapp' | 'email'
          lead_source: 'website' | 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'referral' | 'phone' | 'email' | 'property' | 'campaign' | 'other' | null
          tags: string[] | null
          status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
          date_of_birth: string | null
          important_dates: Record<string, any> | null
          personal_notes: string | null
          communication_preferences: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          company_id?: string | null
          role?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          secondary_contact?: string | null
          address?: string | null
          city?: string | null
          country?: string
          preferred_communication?: 'phone' | 'whatsapp' | 'email'
          lead_source?: 'website' | 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'referral' | 'phone' | 'email' | 'property' | 'campaign' | 'other' | null
          tags?: string[] | null
          status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
          date_of_birth?: string | null
          important_dates?: Record<string, any> | null
          personal_notes?: string | null
          communication_preferences?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          company_id?: string | null
          role?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          secondary_contact?: string | null
          address?: string | null
          city?: string | null
          country?: string
          preferred_communication?: 'phone' | 'whatsapp' | 'email'
          lead_source?: 'website' | 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'referral' | 'phone' | 'email' | 'property' | 'campaign' | 'other' | null
          tags?: string[] | null
          status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
          date_of_birth?: string | null
          important_dates?: Record<string, any> | null
          personal_notes?: string | null
          communication_preferences?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          slug: string
          type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'office' | 'retail' | 'industrial' | 'other'
          location: string
          area: string
          neighborhood: string | null
          bedrooms: number | null
          bathrooms: number | null
          rooms: number | null
          built_area: number | null
          land_area: number | null
          price: number | null
          currency: 'EUR' | 'USD' | 'RON'
          property_status: 'DRAFT' | 'PRIVATE' | 'PUBLIC' | 'OFF_MARKET' | 'RESERVED' | 'SOLD' | 'ARCHIVED'
          availability: 'available' | 'reserved' | 'sold' | 'rented' | 'off_market' | null
          description: string | null
          features: Record<string, any> | null
          owner_id: string | null
          seller_id: string | null
          internal_notes: string | null
          minimum_internal_price: number | null
          commission: number | null
          commission_percentage: number | null
          public_visibility: boolean
          public_price_visibility: boolean
          public_location_visibility: boolean
          public_request_visibility: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'office' | 'retail' | 'industrial' | 'other'
          location: string
          area: string
          neighborhood?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          rooms?: number | null
          built_area?: number | null
          land_area?: number | null
          price?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          property_status?: 'DRAFT' | 'PRIVATE' | 'PUBLIC' | 'OFF_MARKET' | 'RESERVED' | 'SOLD' | 'ARCHIVED'
          availability?: 'available' | 'reserved' | 'sold' | 'rented' | 'off_market' | null
          description?: string | null
          features?: Record<string, any> | null
          owner_id?: string | null
          seller_id?: string | null
          internal_notes?: string | null
          minimum_internal_price?: number | null
          commission?: number | null
          commission_percentage?: number | null
          public_visibility?: boolean
          public_price_visibility?: boolean
          public_location_visibility?: boolean
          public_request_visibility?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          type?: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'office' | 'retail' | 'industrial' | 'other'
          location?: string
          area?: string
          neighborhood?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          rooms?: number | null
          built_area?: number | null
          land_area?: number | null
          price?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          property_status?: 'DRAFT' | 'PRIVATE' | 'PUBLIC' | 'OFF_MARKET' | 'RESERVED' | 'SOLD' | 'ARCHIVED'
          availability?: 'available' | 'reserved' | 'sold' | 'rented' | 'off_market' | null
          description?: string | null
          features?: Record<string, any> | null
          owner_id?: string | null
          seller_id?: string | null
          internal_notes?: string | null
          minimum_internal_price?: number | null
          commission?: number | null
          commission_percentage?: number | null
          public_visibility?: boolean
          public_price_visibility?: boolean
          public_location_visibility?: boolean
          public_request_visibility?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
