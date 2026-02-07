export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      advisor_skills: {
        Row: {
          advisor_id: string
          case_count: number | null
          created_at: string
          evidence: string | null
          id: string
          last_assessed_at: string | null
          skill_level: number
          subtopic_id: string
          updated_at: string
        }
        Insert: {
          advisor_id: string
          case_count?: number | null
          created_at?: string
          evidence?: string | null
          id?: string
          last_assessed_at?: string | null
          skill_level: number
          subtopic_id: string
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          case_count?: number | null
          created_at?: string
          evidence?: string | null
          id?: string
          last_assessed_at?: string | null
          skill_level?: number
          subtopic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_skills_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_skills_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
        ]
      }
      advisors: {
        Row: {
          availability_status: string | null
          certifications: string[] | null
          created_at: string
          current_families: number
          growth_goals: string[] | null
          id: string
          interest_areas: string[] | null
          max_families: number
          predictive_index: Json | null
          target_segment: Database["public"]["Enums"]["segment_type"] | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          certifications?: string[] | null
          created_at?: string
          current_families?: number
          growth_goals?: string[] | null
          id?: string
          interest_areas?: string[] | null
          max_families?: number
          predictive_index?: Json | null
          target_segment?: Database["public"]["Enums"]["segment_type"] | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          certifications?: string[] | null
          created_at?: string
          current_families?: number
          growth_goals?: string[] | null
          id?: string
          interest_areas?: string[] | null
          max_families?: number
          predictive_index?: Json | null
          target_segment?: Database["public"]["Enums"]["segment_type"] | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      asset_categories: {
        Row: {
          category_type: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          category_type: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          category_type?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      asset_ownership: {
        Row: {
          asset_id: string
          created_at: string
          end_date: string | null
          entity_id: string | null
          id: string
          owner_name: string
          owner_type: string
          ownership_percentage: number
          start_date: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          end_date?: string | null
          entity_id?: string | null
          id?: string
          owner_name: string
          owner_type: string
          ownership_percentage?: number
          start_date: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          end_date?: string | null
          entity_id?: string | null
          id?: string
          owner_name?: string
          owner_type?: string
          ownership_percentage?: number
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_ownership_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_ownership_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_values: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          notes: string | null
          value: number
          value_date: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          notes?: string | null
          value?: number
          value_date: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          value?: number
          value_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_values_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: string
          category_id: string
          client_id: string
          created_at: string
          description: string | null
          details: Json
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          category_id: string
          client_id: string
          created_at?: string
          description?: string | null
          details?: Json
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          category_id?: string
          client_id?: string
          created_at?: string
          description?: string | null
          details?: Json
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          approved_by: string | null
          backup_advisor_id: string | null
          client_id: string
          created_at: string
          id: string
          lead_advisor_id: string | null
          notes: string | null
          override_reason: string | null
          support_advisor_id: string | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          backup_advisor_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          lead_advisor_id?: string | null
          notes?: string | null
          override_reason?: string | null
          support_advisor_id?: string | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          backup_advisor_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          lead_advisor_id?: string | null
          notes?: string | null
          override_reason?: string | null
          support_advisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_backup_advisor_id_fkey"
            columns: ["backup_advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_lead_advisor_id_fkey"
            columns: ["lead_advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_support_advisor_id_fkey"
            columns: ["support_advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      client_needs: {
        Row: {
          client_id: string
          created_at: string
          horizon: Database["public"]["Enums"]["horizon_type"]
          id: string
          importance: number
          notes: string | null
          subtopic_id: string
          updated_at: string
          urgency: number
        }
        Insert: {
          client_id: string
          created_at?: string
          horizon?: Database["public"]["Enums"]["horizon_type"]
          id?: string
          importance: number
          notes?: string | null
          subtopic_id: string
          updated_at?: string
          urgency: number
        }
        Update: {
          client_id?: string
          created_at?: string
          horizon?: Database["public"]["Enums"]["horizon_type"]
          id?: string
          importance?: number
          notes?: string | null
          subtopic_id?: string
          updated_at?: string
          urgency?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_needs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_needs_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          aum_band: string | null
          complexity_tier: Database["public"]["Enums"]["complexity_tier"]
          constraints: Json | null
          created_at: string
          created_by: string | null
          id: string
          is_prospect: boolean
          name: string
          net_worth_band: string | null
          notes: string | null
          office: string | null
          preferences: Json | null
          segment: Database["public"]["Enums"]["segment_type"]
          updated_at: string
        }
        Insert: {
          aum_band?: string | null
          complexity_tier?: Database["public"]["Enums"]["complexity_tier"]
          constraints?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_prospect?: boolean
          name: string
          net_worth_band?: string | null
          notes?: string | null
          office?: string | null
          preferences?: Json | null
          segment?: Database["public"]["Enums"]["segment_type"]
          updated_at?: string
        }
        Update: {
          aum_band?: string | null
          complexity_tier?: Database["public"]["Enums"]["complexity_tier"]
          constraints?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_prospect?: boolean
          name?: string
          net_worth_band?: string | null
          notes?: string | null
          office?: string | null
          preferences?: Json | null
          segment?: Database["public"]["Enums"]["segment_type"]
          updated_at?: string
        }
        Relationships: []
      }
      config_versions: {
        Row: {
          created_at: string
          created_by: string | null
          curves: Json
          id: string
          is_active: boolean
          taxonomy_snapshot: Json | null
          version_number: number
          weights: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          curves?: Json
          id?: string
          is_active?: boolean
          taxonomy_snapshot?: Json | null
          version_number: number
          weights?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          curves?: Json
          id?: string
          is_active?: boolean
          taxonomy_snapshot?: Json | null
          version_number?: number
          weights?: Json
        }
        Relationships: []
      }
      domains: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      entities: {
        Row: {
          client_id: string
          created_at: string
          entity_type: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          entity_type: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          entity_type?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_ownership: {
        Row: {
          created_at: string
          end_date: string | null
          entity_id: string
          id: string
          owner_name: string
          ownership_percentage: number
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          entity_id: string
          id?: string
          owner_name: string
          ownership_percentage?: number
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          entity_id?: string
          id?: string
          owner_name?: string
          ownership_percentage?: number
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_ownership_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          advisor_id: string
          created_at: string
          explanation: Json
          id: string
          match_run_id: string
          role: Database["public"]["Enums"]["assignment_role"]
          score: number
        }
        Insert: {
          advisor_id: string
          created_at?: string
          explanation?: Json
          id?: string
          match_run_id: string
          role: Database["public"]["Enums"]["assignment_role"]
          score: number
        }
        Update: {
          advisor_id?: string
          created_at?: string
          explanation?: Json
          id?: string
          match_run_id?: string
          role?: Database["public"]["Enums"]["assignment_role"]
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_results_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_match_run_id_fkey"
            columns: ["match_run_id"]
            isOneToOne: false
            referencedRelation: "match_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      match_runs: {
        Row: {
          client_id: string
          config_version_id: string | null
          generated_at: string
          generated_by: string | null
          id: string
        }
        Insert: {
          client_id: string
          config_version_id?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
        }
        Update: {
          client_id?: string
          config_version_id?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_runs_config_version_id_fkey"
            columns: ["config_version_id"]
            isOneToOne: false
            referencedRelation: "config_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          office: string | null
          team: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          office?: string | null
          team?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          office?: string | null
          team?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subtopics: {
        Row: {
          created_at: string
          default_weight: number
          description: string | null
          display_order: number
          domain_id: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          default_weight?: number
          description?: string | null
          display_order?: number
          domain_id: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          default_weight?: number
          description?: string | null
          display_order?: number
          domain_id?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtopics_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "advisor" | "recruiter"
      assignment_role: "lead" | "backup" | "support"
      complexity_tier: "standard" | "complex" | "highly_complex"
      horizon_type: "now" | "1yr" | "3yr" | "5yr"
      segment_type:
        | "mass_affluent"
        | "high_net_worth"
        | "ultra_high_net_worth"
        | "institutional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "advisor", "recruiter"],
      assignment_role: ["lead", "backup", "support"],
      complexity_tier: ["standard", "complex", "highly_complex"],
      horizon_type: ["now", "1yr", "3yr", "5yr"],
      segment_type: [
        "mass_affluent",
        "high_net_worth",
        "ultra_high_net_worth",
        "institutional",
      ],
    },
  },
} as const
