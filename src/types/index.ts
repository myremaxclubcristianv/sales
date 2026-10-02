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
          county: string | null
          postal_code: string | null
          country: string
          cnp: string | null
          client_type: 'INDIVIDUAL' | 'CORPORATE' | string
          preferred_communication: 'phone' | 'whatsapp' | 'email'
          lead_source: string | null
          category?: string | null
          interest_summary?: string | null
          tags: string[] | null
          status:
            | 'NEW'
            | 'NOT_CONTACTED'
            | 'CONTACTED'
            | 'IN_DISCUSSION'
            | 'ACTIVE'
            | 'OFFERING'
            | 'IN_PROGRESS'
            | 'FOLLOW_UP'
            | 'CALL_BACK'
            | 'WAITING_CLIENT'
            | 'WAITING_DOCUMENTS'
            | 'CONVERTED'
            | 'REFUSED'
            | 'NO_RESPONSE'
            | 'INACTIVE'
            | 'LOST'
            | 'ARCHIVED'
            | string
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
          county?: string | null
          postal_code?: string | null
          country?: string
          cnp?: string | null
          client_type?: 'INDIVIDUAL' | 'CORPORATE' | string
          preferred_communication?: 'phone' | 'whatsapp' | 'email'
          lead_source?: string | null
          category?: string | null
          interest_summary?: string | null
          tags?: string[] | null
          status?:
            | 'NEW'
            | 'NOT_CONTACTED'
            | 'CONTACTED'
            | 'IN_DISCUSSION'
            | 'ACTIVE'
            | 'OFFERING'
            | 'IN_PROGRESS'
            | 'FOLLOW_UP'
            | 'CALL_BACK'
            | 'WAITING_CLIENT'
            | 'WAITING_DOCUMENTS'
            | 'CONVERTED'
            | 'REFUSED'
            | 'NO_RESPONSE'
            | 'INACTIVE'
            | 'LOST'
            | 'ARCHIVED'
            | string
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
          county?: string | null
          postal_code?: string | null
          country?: string
          cnp?: string | null
          client_type?: 'INDIVIDUAL' | 'CORPORATE' | string
          preferred_communication?: 'phone' | 'whatsapp' | 'email'
          lead_source?: string | null
          category?: string | null
          interest_summary?: string | null
          tags?: string[] | null
          status?:
            | 'NEW'
            | 'NOT_CONTACTED'
            | 'CONTACTED'
            | 'IN_DISCUSSION'
            | 'ACTIVE'
            | 'OFFERING'
            | 'IN_PROGRESS'
            | 'FOLLOW_UP'
            | 'CALL_BACK'
            | 'WAITING_CLIENT'
            | 'WAITING_DOCUMENTS'
            | 'CONVERTED'
            | 'REFUSED'
            | 'NO_RESPONSE'
            | 'INACTIVE'
            | 'LOST'
            | 'ARCHIVED'
            | string
          date_of_birth?: string | null
          important_dates?: Record<string, unknown> | null
          personal_notes?: string | null
          communication_preferences?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          company_id: string | null
          client_id: string | null
          first_name: string
          last_name: string
          company_name: string | null
          role: string | null
          phone: string | null
          whatsapp: string | null
          email: string | null
          category: string | null
          source: string | null
          interest_summary: string | null
          address: string | null
          city: string | null
          country: string | null
          notes: string | null
          raw_data: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          first_name: string
          last_name?: string
          company_name?: string | null
          role?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          category?: string | null
          source?: string | null
          interest_summary?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          notes?: string | null
          raw_data?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          first_name?: string
          last_name?: string
          company_name?: string | null
          role?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          category?: string | null
          source?: string | null
          interest_summary?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          notes?: string | null
          raw_data?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_imports: {
        Row: {
          id: string
          filename: string
          imported_by: string | null
          total_rows: number
          imported_count: number
          skipped_count: number
          duplicate_count: number
          invalid_count: number
          summary: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          imported_by?: string | null
          total_rows?: number
          imported_count?: number
          skipped_count?: number
          duplicate_count?: number
          invalid_count?: number
          summary?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          imported_by?: string | null
          total_rows?: number
          imported_count?: number
          skipped_count?: number
          duplicate_count?: number
          invalid_count?: number
          summary?: Record<string, unknown> | null
          created_at?: string
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
          portfolio_type: 'PERSONAL' | 'CHESTERTONS'
          source_url: string | null
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
          portfolio_type?: 'PERSONAL' | 'CHESTERTONS'
          source_url?: string | null
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
          portfolio_type?: 'PERSONAL' | 'CHESTERTONS'
          source_url?: string | null
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
      viewings: {
        Row: {
          id: string
          client_id: string
          property_id: string
          date: string
          status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          attendees: string[] | null
          notes: string | null
          feedback: string | null
          interest: 'high' | 'medium' | 'low' | 'none' | null
          next_action: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id: string
          date: string
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          attendees?: string[] | null
          notes?: string | null
          feedback?: string | null
          interest?: 'high' | 'medium' | 'low' | 'none' | null
          next_action?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string
          date?: string
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          attendees?: string[] | null
          notes?: string | null
          feedback?: string | null
          interest?: 'high' | 'medium' | 'low' | 'none' | null
          next_action?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          client_id: string
          property_id: string
          asking_price: number
          offer_price: number
          currency: 'EUR' | 'USD' | 'RON'
          offer_date: string
          party: 'buyer' | 'seller' | null
          notes: string | null
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'WITHDRAWN'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id: string
          asking_price: number
          offer_price: number
          currency?: 'EUR' | 'USD' | 'RON'
          offer_date: string
          party?: 'buyer' | 'seller' | null
          notes?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'WITHDRAWN'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string
          asking_price?: number
          offer_price?: number
          currency?: 'EUR' | 'USD' | 'RON'
          offer_date?: string
          party?: 'buyer' | 'seller' | null
          notes?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'WITHDRAWN'
          created_at?: string
          updated_at?: string
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
          vehicle_id: string | null
          client_property_id: string | null
          policy_number: string | null
          product: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'TRAVEL' | 'LIABILITY' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'IMM' | 'BUSINESS' | 'CYBER' | 'OTHER' | string
          insurer: string
          premium: number | null
          commission: number | null
          currency: 'EUR' | 'USD' | 'RON'
          start_date: string
          issue_date: string | null
          expiry_date: string
          status: 'DRAFT' | 'OFFERED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL' | string
          documents: Record<string, unknown> | null
          notes: string | null
          details: string | null
          renewal_follow_up_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          vehicle_id?: string | null
          client_property_id?: string | null
          policy_number?: string | null
          product: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'TRAVEL' | 'LIABILITY' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'IMM' | 'BUSINESS' | 'CYBER' | 'OTHER' | string
          insurer: string
          premium?: number | null
          commission?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          start_date: string
          issue_date?: string | null
          expiry_date: string
          status?: 'DRAFT' | 'OFFERED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL' | string
          documents?: Record<string, unknown> | null
          notes?: string | null
          details?: string | null
          renewal_follow_up_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          vehicle_id?: string | null
          client_property_id?: string | null
          policy_number?: string | null
          product?: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'TRAVEL' | 'LIABILITY' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'IMM' | 'BUSINESS' | 'CYBER' | 'OTHER' | string
          insurer?: string
          premium?: number | null
          commission?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          start_date?: string
          issue_date?: string | null
          expiry_date?: string
          status?: 'DRAFT' | 'OFFERED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL' | string
          documents?: Record<string, unknown> | null
          notes?: string | null
          details?: string | null
          renewal_follow_up_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_vehicles: {
        Row: {
          id: string
          client_id: string
          vin: string
          make: string
          model: string
          year: number | null
          plate_number: string | null
          fuel_type: string | null
          engine_capacity: number | null
          power_hp: number | null
          value: number | null
          details: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          vin: string
          make: string
          model: string
          year?: number | null
          plate_number?: string | null
          fuel_type?: string | null
          engine_capacity?: number | null
          power_hp?: number | null
          value?: number | null
          details?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          vin?: string
          make?: string
          model?: string
          year?: number | null
          plate_number?: string | null
          fuel_type?: string | null
          engine_capacity?: number | null
          power_hp?: number | null
          value?: number | null
          details?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_properties: {
        Row: {
          id: string
          client_id: string
          property_type: string
          address: string
          city: string | null
          county: string | null
          surface_sqm: number | null
          property_value: number | null
          insured_value: number | null
          construction_year: number | null
          details: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_type?: string
          address: string
          city?: string | null
          county?: string | null
          surface_sqm?: number | null
          property_value?: number | null
          insured_value?: number | null
          construction_year?: number | null
          details?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_type?: string
          address?: string
          city?: string | null
          county?: string | null
          surface_sqm?: number | null
          property_value?: number | null
          insured_value?: number | null
          construction_year?: number | null
          details?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      insurance_claims: {
        Row: {
          id: string
          client_id: string
          policy_id: string | null
          incident_date: string
          claim_type: string
          claim_number: string | null
          insurer: string | null
          estimated_amount: number | null
          currency: 'EUR' | 'USD' | 'RON'
          status: 'OPEN' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CLOSED'
          description: string | null
          notes: string | null
          next_action: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          policy_id?: string | null
          incident_date: string
          claim_type: string
          claim_number?: string | null
          insurer?: string | null
          estimated_amount?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          status?: 'OPEN' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CLOSED'
          description?: string | null
          notes?: string | null
          next_action?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          policy_id?: string | null
          incident_date?: string
          claim_type?: string
          claim_number?: string | null
          insurer?: string | null
          estimated_amount?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          status?: 'OPEN' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CLOSED'
          description?: string | null
          notes?: string | null
          next_action?: string | null
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
      insurance_opportunities: {
        Row: {
          id: string
          client_id: string
          product: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'IMM' | 'BUSINESS' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'OTHER'
          estimated_premium: number | null
          currency: 'EUR' | 'USD' | 'RON'
          status: 'LEAD' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
          notes: string | null
          converted_to_policy_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          product: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'IMM' | 'BUSINESS' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'OTHER'
          estimated_premium?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          status?: 'LEAD' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
          notes?: string | null
          converted_to_policy_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          product?: 'RCA' | 'CASCO' | 'HOME' | 'LIFE' | 'HEALTH' | 'IMM' | 'BUSINESS' | 'PROFESSIONAL_LIABILITY' | 'CARGO' | 'OTHER'
          estimated_premium?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          status?: 'LEAD' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
          notes?: string | null
          converted_to_policy_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_documents: {
        Row: {
          id: string
          credit_case_id: string
          file_path: string
          file_name: string
          file_type: string
          category: string | null
          description: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          credit_case_id: string
          file_path: string
          file_name: string
          file_type: string
          category?: string | null
          description?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          credit_case_id?: string
          file_path?: string
          file_name?: string
          file_type?: string
          category?: string | null
          description?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          objective: string | null
          channel: 'website' | 'social' | 'email' | 'paid_ads' | 'referral' | 'other' | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          currency: 'EUR' | 'USD' | 'RON'
          status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          objective?: string | null
          channel?: 'website' | 'social' | 'email' | 'paid_ads' | 'referral' | 'other' | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          objective?: string | null
          channel?: 'website' | 'social' | 'email' | 'paid_ads' | 'referral' | 'other' | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          currency?: 'EUR' | 'USD' | 'RON'
          status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      marketing_events: {
        Row: {
          id: string
          campaign_id: string | null
          lead_id: string | null
          property_id: string | null
          event_type: string
          event_date: string
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          lead_id?: string | null
          property_id?: string | null
          event_type: string
          event_date?: string
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          lead_id?: string | null
          property_id?: string | null
          event_type?: string
          event_date?: string
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          message: string | null
          related_entity_type: string | null
          related_entity_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          message?: string | null
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          message?: string | null
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      insurance_clients: {
        Row: {
          id: string
          import_source_id: string | null
          full_name: string
          phone: string | null
          canonical_phone: string | null
          email: string | null
          cnp: string | null
          address: string | null
          city: string | null
          county: string | null
          postal_code: string | null
          status: 'ACTIVE' | 'INACTIVE'
          source: string | null
          last_interaction: string | null
          notes: string | null
          source_data: Record<string, unknown>
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          import_source_id?: string | null
          full_name: string
          phone?: string | null
          canonical_phone?: string | null
          email?: string | null
          cnp?: string | null
          address?: string | null
          city?: string | null
          county?: string | null
          postal_code?: string | null
          status?: 'ACTIVE' | 'INACTIVE'
          source?: string | null
          last_interaction?: string | null
          notes?: string | null
          source_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          import_source_id?: string | null
          full_name?: string
          phone?: string | null
          canonical_phone?: string | null
          email?: string | null
          cnp?: string | null
          address?: string | null
          city?: string | null
          county?: string | null
          postal_code?: string | null
          status?: 'ACTIVE' | 'INACTIVE'
          source?: string | null
          last_interaction?: string | null
          notes?: string | null
          source_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      insurance_client_policies: {
        Row: {
          id: string
          insurance_client_id: string
          import_source_id: string | null
          policy_type: string
          insurer: string | null
          insurer_raw: string | null
          policy_number: string | null
          issue_date: string | null
          expiry_date: string
          premium_amount: number | null
          premium_currency: 'RON' | 'EUR' | 'USD'
          commission_amount: number | null
          commission_rate: string | null
          status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL'
          vin: string | null
          vehicle_registration: string | null
          property_details: string | null
          details: string | null
          notes: string | null
          source_data: Record<string, unknown>
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          insurance_client_id: string
          import_source_id?: string | null
          policy_type: string
          insurer?: string | null
          insurer_raw?: string | null
          policy_number?: string | null
          issue_date?: string | null
          expiry_date: string
          premium_amount?: number | null
          premium_currency?: 'RON' | 'EUR' | 'USD'
          commission_amount?: number | null
          commission_rate?: string | null
          status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL'
          vin?: string | null
          vehicle_registration?: string | null
          property_details?: string | null
          details?: string | null
          notes?: string | null
          source_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          insurance_client_id?: string
          import_source_id?: string | null
          policy_type?: string
          insurer?: string | null
          insurer_raw?: string | null
          policy_number?: string | null
          issue_date?: string | null
          expiry_date?: string
          premium_amount?: number | null
          premium_currency?: 'RON' | 'EUR' | 'USD'
          commission_amount?: number | null
          commission_rate?: string | null
          status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED' | 'PENDING_RENEWAL'
          vin?: string | null
          vehicle_registration?: string | null
          property_details?: string | null
          details?: string | null
          notes?: string | null
          source_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      insurance_client_notes: {
        Row: {
          id: string
          insurance_client_id: string
          content: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          insurance_client_id: string
          content: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          insurance_client_id?: string
          content?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      insurance_client_activities: {
        Row: {
          id: string
          insurance_client_id: string
          activity_type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE' | 'POLICY_CREATED' | 'EXPIRATION_ALERT' | 'MANUAL_UPDATE' | 'IMPORT'
          title: string
          description: string | null
          performed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          insurance_client_id: string
          activity_type?: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE' | 'POLICY_CREATED' | 'EXPIRATION_ALERT' | 'MANUAL_UPDATE' | 'IMPORT'
          title: string
          description?: string | null
          performed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          insurance_client_id?: string
          activity_type?: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE' | 'POLICY_CREATED' | 'EXPIRATION_ALERT' | 'MANUAL_UPDATE' | 'IMPORT'
          title?: string
          description?: string | null
          performed_by?: string | null
          created_at?: string
        }
      }
    }
  }
}

