export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      weather_preferences: {
        Row: {
          id: string
          created_at: string
          user_id: string
          location: string
          temperature_unit: 'celsius' | 'fahrenheit'
          notification_enabled: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          location: string
          temperature_unit?: 'celsius' | 'fahrenheit'
          notification_enabled?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          location?: string
          temperature_unit?: 'celsius' | 'fahrenheit'
          notification_enabled?: boolean
        }
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
  }
}