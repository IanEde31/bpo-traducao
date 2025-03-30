export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      quotes: {
        Row: {
          amount: number
          currency: string | null
          quote_id: string
          request_id: string
          valid_until: string | null
        }
        Insert: {
          amount: number
          currency?: string | null
          quote_id?: string
          request_id: string
          valid_until?: string | null
        }
        Update: {
          amount?: number
          currency?: string | null
          quote_id?: string
          request_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "translationrequests"
            referencedColumns: ["request_id"]
          },
        ]
      }
      translation_files: {
        Row: {
          created_at: string | null
          file_type: string | null
          id: number
          original_name: string
          request_id: string | null
          storage_path: string
          word_count: number | null
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          id?: number
          original_name: string
          request_id?: string | null
          storage_path: string
          word_count?: number | null
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          id?: number
          original_name?: string
          request_id?: string | null
          storage_path?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "translation_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "translationrequests"
            referencedColumns: ["request_id"]
          },
        ]
      }
      translation_processing: {
        Row: {
          deepl_document_id: string | null
          deepl_document_key: string | null
          error_message: string | null
          last_check_time: string | null
          processing_id: string
          request_id: string | null
          seconds_remaining: number | null
          start_time: string | null
          status: string
        }
        Insert: {
          deepl_document_id?: string | null
          deepl_document_key?: string | null
          error_message?: string | null
          last_check_time?: string | null
          processing_id: string
          request_id?: string | null
          seconds_remaining?: number | null
          start_time?: string | null
          status: string
        }
        Update: {
          deepl_document_id?: string | null
          deepl_document_key?: string | null
          error_message?: string | null
          last_check_time?: string | null
          processing_id?: string
          request_id?: string | null
          seconds_remaining?: number | null
          start_time?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_processing_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "translationrequests"
            referencedColumns: ["request_id"]
          },
        ]
      }
      translation_progress: {
        Row: {
          id: number
          last_updated: string | null
          translated_content: string | null
          translation_id: string | null
        }
        Insert: {
          id?: number
          last_updated?: string | null
          translated_content?: string | null
          translation_id?: string | null
        }
        Update: {
          id?: number
          last_updated?: string | null
          translated_content?: string | null
          translation_id?: string | null
        }
        Relationships: []
      }
      translationrequests: {
        Row: {
          billed_characters: number | null
          bucket_name: string | null
          created_at: string | null
          currency: string | null
          deepl_document_id: string | null
          deepl_document_key: string | null
          deepl_progress: number | null
          deepl_status: string | null
          delivery_date: string | null
          email: string | null
          file_count: number | null
          file_name: string | null
          file_path: string | null
          file_type: string | null
          files: Json | null
          name: string | null
          payment_intent_id: string | null
          payment_session_id: string | null
          payment_status: string | null
          phone: string | null
          price_per_word: number | null
          request_id: string
          service_type: string
          source_language: string | null
          status: string | null
          target_language: string | null
          total_price: number | null
          total_word_count: number | null
          translated_file_path: string | null
          translation_status: string | null
          translation_subtype: string | null
          translation_type: string | null
          translator_id: string | null
          user_id: string
          valid_until: string | null
          word_count: number | null
        }
        Insert: {
          billed_characters?: number | null
          bucket_name?: string | null
          created_at?: string | null
          currency?: string | null
          deepl_document_id?: string | null
          deepl_document_key?: string | null
          deepl_progress?: number | null
          deepl_status?: string | null
          delivery_date?: string | null
          email?: string | null
          file_count?: number | null
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          files?: Json | null
          name?: string | null
          payment_intent_id?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          phone?: string | null
          price_per_word?: number | null
          request_id?: string
          service_type: string
          source_language?: string | null
          status?: string | null
          target_language?: string | null
          total_price?: number | null
          total_word_count?: number | null
          translated_file_path?: string | null
          translation_status?: string | null
          translation_subtype?: string | null
          translation_type?: string | null
          translator_id?: string | null
          user_id: string
          valid_until?: string | null
          word_count?: number | null
        }
        Update: {
          billed_characters?: number | null
          bucket_name?: string | null
          created_at?: string | null
          currency?: string | null
          deepl_document_id?: string | null
          deepl_document_key?: string | null
          deepl_progress?: number | null
          deepl_status?: string | null
          delivery_date?: string | null
          email?: string | null
          file_count?: number | null
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          files?: Json | null
          name?: string | null
          payment_intent_id?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          phone?: string | null
          price_per_word?: number | null
          request_id?: string
          service_type?: string
          source_language?: string | null
          status?: string | null
          target_language?: string | null
          total_price?: number | null
          total_word_count?: number | null
          translated_file_path?: string | null
          translation_status?: string | null
          translation_subtype?: string | null
          translation_type?: string | null
          translator_id?: string | null
          user_id?: string
          valid_until?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "translationrequests_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators"
            referencedColumns: ["translator_id"]
          },
          {
            foreignKeyName: "translationrequests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      translations: {
        Row: {
          completed_at: string | null
          request_id: string
          review_notes: string | null
          translated_file_path: string
          translation_id: string
          translator_id: string
        }
        Insert: {
          completed_at?: string | null
          request_id: string
          review_notes?: string | null
          translated_file_path: string
          translation_id?: string
          translator_id: string
        }
        Update: {
          completed_at?: string | null
          request_id?: string
          review_notes?: string | null
          translated_file_path?: string
          translation_id?: string
          translator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "translationrequests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "translations_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators"
            referencedColumns: ["translator_id"]
          },
        ]
      }
      translators: {
        Row: {
          certifications: string | null
          languages: string
          rating: number | null
          translator_id: string
          user_id: string
        }
        Insert: {
          certifications?: string | null
          languages: string
          rating?: number | null
          translator_id?: string
          user_id: string
        }
        Update: {
          certifications?: string | null
          languages?: string
          rating?: number | null
          translator_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "translators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          birth_date: string
          cnpj: string | null
          cpf: string | null
          created_at: string | null
          email: string
          is_individual: boolean
          name: string
          newsletter: boolean | null
          phone: string
          role: string
          user_id: string
        }
        Insert: {
          birth_date: string
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          is_individual?: boolean
          name: string
          newsletter?: boolean | null
          phone: string
          role?: string
          user_id?: string
        }
        Update: {
          birth_date?: string
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          is_individual?: boolean
          name?: string
          newsletter?: boolean | null
          phone?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
