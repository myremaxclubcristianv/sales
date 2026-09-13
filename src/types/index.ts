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
          important_dates: Record<string, unknown> | null
          personal_notes: string | null
          communication_preferences: Record<string, unknown> | null
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
          important_dates?: Record<string, unknown> | null
          personal_notes?: string | null
          communication_preferences?: Record<string, unknown> | null
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
          important_dates?: Record<string, unknown> | null
          personal_notes?: string | null
          communication_preferences?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      client_relationships: {
        Row: {
          id: string
          client_id: string
          relationship_type: 'buyer' | 'seller' | 'landlord' | 'investor' | 'insurance' | 'credit' | 'b2b' | 'partner' | 'referral'
          is_primary: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          relationship_type: 'buyer' | 'seller' | 'landlord' | 'investor' | 'insurance' | 'credit' | 'b2b' | 'partner' | 'referral'
          is_primary?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          relationship_type?: 'buyer' | 'seller' | 'landlord' | 'investor' | 'insurance' | 'credit' | 'b2b' | 'partner' | 'referral'
          is_primary?: boolean
          notes?: string | null
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
          features: Record<string, unknown> | null
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
          features?: Record<string, unknown> | null
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
          features?: Record<string, unknown> | null
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
      property_media: {
        Row: {
          id: string
          property_id: string
          file_path: string
          file_name: string
          file_type: string
          file_size: number | null
          is_primary: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          file_path: string
          file_name: string
          file_type: string
          file_size?: number | null
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          file_path?: string
          file_name?: string
          file_type?: string
          file_size?: number | null
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
      }
      property_documents: {
        Row: {
          id: string
          property_id: string
          file_path: string
          file_name: string
          file_type: string
          category: 'contract' | 'ownership' | 'cadastral' | 'legal' | 'other' | null
          description: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          file_path: string
          file_name: string
          file_type: string
          category?: 'contract' | 'ownership' | 'cadastral' | 'legal' | 'other' | null
          description?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          file_path?: string
          file_name?: string
          file_type?: string
          category?: 'contract' | 'ownership' | 'cadastral' | 'legal' | 'other' | null
          description?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          client_id: string | null
          property_id: string | null
          opportunity_id: string | null
          type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE' | 'VIEWING' | 'FOLLOW_UP' | 'TASK' | 'DOCUMENT' | 'OFFER' | 'STATUS_CHANGE'
          title: string
          notes: string | null
          date: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          property_id?: string | null
          opportunity_id?: string | null
          type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE' | 'VIEWING' | 'FOLLOW_UP' | 'TASK' | 'DOCUMENT' | 'OFFER' | 'STATUS_CHANGE'
          title: string
          notes?: string | null
          date?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          property_id?: string | null
          opportunity_id?: string | null
          type?: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE' | 'VIEWING' | 'FOLLOW_UP' | 'TASK' | 'DOCUMENT' | 'OFFER' | 'STATUS_CHANGE'
          title?: string
          notes?: string | null
          date?: string
          created_by?: string | null
          created_at?: string
        }
      }
      follow_ups: {
        Row: {
          id: string
          client_id: string
          property_id: string | null
          opportunity_id: string | null
          insurance_id: string | null
          credit_id: string | null
          reason: string
          due_date: string
          priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SNOOZED'
          notes: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id?: string | null
          opportunity_id?: string | null
          insurance_id?: string | null
          credit_id?: string | null
          reason: string
          due_date: string
          priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SNOOZED'
          notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string | null
          opportunity_id?: string | null
          insurance_id?: string | null
          credit_id?: string | null
          reason?: string
          due_date?: string
          priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SNOOZED'
          notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          due_date: string | null
          priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
          client_id: string | null
          property_id: string | null
          opportunity_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          due_date?: string | null
          priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
          client_id?: string | null
          property_id?: string | null
          opportunity_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
          status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
          client_id?: string | null
          property_id?: string | null
          opportunity_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          file_path: string
          file_name: string
          file_type: string
          file_size: number | null
          category: 'general' | 'real_estate' | 'insurance' | 'credit' | 'other' | null
          folder_name: string | null
          client_id: string | null
          property_id: string | null
          opportunity_id: string | null
          insurance_id: string | null
          credit_id: string | null
          notes: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_path: string
          file_name: string
          file_type: string
          file_size?: number | null
          category?: 'general' | 'real_estate' | 'insurance' | 'credit' | 'other' | null
          folder_name?: string | null
          client_id?: string | null
          property_id?: string | null
          opportunity_id?: string | null
          insurance_id?: string | null
          credit_id?: string | null
          notes?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_path?: string
          file_name?: string
          file_type?: string
          file_size?: number | null
          category?: 'general' | 'real_estate' | 'insurance' | 'credit' | 'other' | null
          folder_name?: string | null
          client_id?: string | null
          property_id?: string | null
          opportunity_id?: string | null
          insurance_id?: string | null
          credit_id?: string | null
          notes?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      document_folders: {
        Row: {
          id: string
          name: string
          client_id: string
          parent_folder_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          client_id: string
          parent_folder_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          client_id?: string
          parent_folder_id?: string | null
          created_at?: string
        }
      }
      personal_events: {
        Row: {
          id: string
          client_id: string
          event_type: 'birthday' | 'anniversary' | 'custom'
          event_date: string
          title: string | null
          notes: string | null
          reminder_days: number | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          event_type: 'birthday' | 'anniversary' | 'custom'
          event_date: string
          title?: string | null
          notes?: string | null
          reminder_days?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          event_type?: 'birthday' | 'anniversary' | 'custom'
          event_date?: string
          title?: string | null
          notes?: string | null
          reminder_days?: number | null
          created_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          title: string
          buyer_id: string
          property_type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'office' | 'retail' | 'industrial' | 'other' | null
          preferred_locations: string[] | null
          budget_min: number | null
          budget_max: number | null
          currency: 'EUR' | 'USD' | 'RON'
          bedrooms: number | null
          bathrooms: number | null
          minimum_area: number | null
          desired_features: Record<string, unknown> | null
          timeline: string | null
          financing_required: boolean
          status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
          notes: string | null
          public_visibility: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          buyer_id: string
          property_type?: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'office' | 'retail' | 'industrial' | 'other' | null
          preferred_locations?: string[] | null
          budget_min?: number | null
          budget_max?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          bedrooms?: number | null
          bathrooms?: number | null
          minimum_area?: number | null
          desired_features?: Record<string, unknown> | null
          timeline?: string | null
          financing_required?: boolean
          status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
          notes?: string | null
          public_visibility?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          buyer_id?: string
          property_type?: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'office' | 'retail' | 'industrial' | 'other' | null
          preferred_locations?: string[] | null
          budget_min?: number | null
          budget_max?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          bedrooms?: number | null
          bathrooms?: number | null
          minimum_area?: number | null
          desired_features?: Record<string, unknown> | null
          timeline?: string | null
          financing_required?: boolean
          status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
          notes?: string | null
          public_visibility?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          source: 'website' | 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'referral' | 'phone' | 'email' | 'property' | 'campaign' | 'other' | null
          campaign_id: string | null
          property_id: string | null
          request_id: string | null
          message: string | null
          status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST' | 'ARCHIVED'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          source?: 'website' | 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'referral' | 'phone' | 'email' | 'property' | 'campaign' | 'other' | null
          campaign_id?: string | null
          property_id?: string | null
          request_id?: string | null
          message?: string | null
          status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST' | 'ARCHIVED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          source?: 'website' | 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'referral' | 'phone' | 'email' | 'property' | 'campaign' | 'other' | null
          campaign_id?: string | null
          property_id?: string | null
          request_id?: string | null
          message?: string | null
          status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST' | 'ARCHIVED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          client_id: string
          property_id: string | null
          request_id: string | null
          type: 'sale' | 'rent' | 'buy' | 'insurance' | 'credit' | 'other'
          title: string
          value: number | null
          currency: 'EUR' | 'USD' | 'RON'
          stage: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
          probability: number | null
          expected_close_date: string | null
          actual_close_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id?: string | null
          request_id?: string | null
          type: 'sale' | 'rent' | 'buy' | 'insurance' | 'credit' | 'other'
          title: string
          value?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          stage?: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
          probability?: number | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string | null
          request_id?: string | null
          type?: 'sale' | 'rent' | 'buy' | 'insurance' | 'credit' | 'other'
          title?: string
          value?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          stage?: 'PROSPECT' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
          probability?: number | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      insurance_policies: {
        Row: {
          id: string
          client_id: string
          policy_number: string | null
          product: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'IMM' | 'BUSINESS' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'OTHER'
          insurer: string
          premium: number | null
          currency: 'EUR' | 'USD' | 'RON'
          start_date: string
          expiry_date: string
          status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL'
          documents: Record<string, unknown> | null
          notes: string | null
          renewal_follow_up_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          policy_number?: string | null
          product: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'IMM' | 'BUSINESS' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'OTHER'
          insurer: string
          premium?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          start_date: string
          expiry_date: string
          status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL'
          documents?: Record<string, unknown> | null
          notes?: string | null
          renewal_follow_up_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          policy_number?: string | null
          product?: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'IMM' | 'BUSINESS' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'OTHER'
          insurer?: string
          premium?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          start_date?: string
          expiry_date?: string
          status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL'
          documents?: Record<string, unknown> | null
          notes?: string | null
          renewal_follow_up_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_cases: {
        Row: {
          id: string
          client_id: string
          amount: number
          currency: 'EUR' | 'USD' | 'RON'
          purpose: string
          status: 'LEAD' | 'QUALIFICATION' | 'ANALYSIS' | 'DOCUMENTS' | 'OFFERS' | 'APPROVAL' | 'CONTRACT' | 'COMPLETED' | 'LOST'
          institution: string | null
          documents: Record<string, unknown> | null
          notes: string | null
          follow_up_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          amount: number
          currency?: 'EUR' | 'USD' | 'RON'
          purpose: string
          status?: 'LEAD' | 'QUALIFICATION' | 'ANALYSIS' | 'DOCUMENTS' | 'OFFERS' | 'APPROVAL' | 'CONTRACT' | 'COMPLETED' | 'LOST'
          institution?: string | null
          documents?: Record<string, unknown> | null
          notes?: string | null
          follow_up_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          amount?: number
          currency?: 'EUR' | 'USD' | 'RON'
          purpose?: string
          status?: 'LEAD' | 'QUALIFICATION' | 'ANALYSIS' | 'DOCUMENTS' | 'OFFERS' | 'APPROVAL' | 'CONTRACT' | 'COMPLETED' | 'LOST'
          institution?: string | null
          documents?: Record<string, unknown> | null
          notes?: string | null
          follow_up_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
