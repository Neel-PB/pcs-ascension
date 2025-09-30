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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          department_id: string
          department_name: string
          facility_id: string
          id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          department_name: string
          facility_id: string
          id?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          department_name?: string
          facility_id?: string
          id?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          created_at: string
          facility_id: string
          facility_name: string
          id: string
          market: string
        }
        Insert: {
          created_at?: string
          facility_id: string
          facility_name: string
          id?: string
          market: string
        }
        Update: {
          created_at?: string
          facility_id?: string
          facility_name?: string
          id?: string
          market?: string
        }
        Relationships: []
      }
      labor_performance: {
        Row: {
          actual_fte: number | null
          created_at: string
          department_id: string
          department_name: string
          facility_id: string
          facility_name: string
          id: string
          labor_hours_per_uos: number | null
          manhours: number | null
          market: string
          month: string | null
          updated_at: string
          volume: number | null
        }
        Insert: {
          actual_fte?: number | null
          created_at?: string
          department_id: string
          department_name: string
          facility_id: string
          facility_name: string
          id?: string
          labor_hours_per_uos?: number | null
          manhours?: number | null
          market: string
          month?: string | null
          updated_at?: string
          volume?: number | null
        }
        Update: {
          actual_fte?: number | null
          created_at?: string
          department_id?: string
          department_name?: string
          facility_id?: string
          facility_name?: string
          id?: string
          labor_hours_per_uos?: number | null
          manhours?: number | null
          market?: string
          month?: string | null
          updated_at?: string
          volume?: number | null
        }
        Relationships: []
      }
      markets: {
        Row: {
          created_at: string
          id: string
          market: string
        }
        Insert: {
          created_at?: string
          id?: string
          market: string
        }
        Update: {
          created_at?: string
          id?: string
          market?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          adjusted_hire_date: string | null
          created_at: string
          department_id: string
          department_name: string
          employee_id: string | null
          employee_name: string | null
          employment_status: string | null
          facility_id: string
          facility_name: string
          flsa_code: string | null
          full_part_time: string | null
          home_cost_center: string | null
          home_cost_center_id: string | null
          id: string
          job_code: string | null
          job_title: string | null
          market: string
          original_hire_date: string | null
          pay_type: string | null
          people_manager_id: string | null
          people_manager_name: string | null
          position_control_id: string | null
          regular_temporary: string | null
          status: string | null
          termination_date: string | null
          union_non_union: string | null
          updated_at: string
        }
        Insert: {
          adjusted_hire_date?: string | null
          created_at?: string
          department_id: string
          department_name: string
          employee_id?: string | null
          employee_name?: string | null
          employment_status?: string | null
          facility_id: string
          facility_name: string
          flsa_code?: string | null
          full_part_time?: string | null
          home_cost_center?: string | null
          home_cost_center_id?: string | null
          id?: string
          job_code?: string | null
          job_title?: string | null
          market: string
          original_hire_date?: string | null
          pay_type?: string | null
          people_manager_id?: string | null
          people_manager_name?: string | null
          position_control_id?: string | null
          regular_temporary?: string | null
          status?: string | null
          termination_date?: string | null
          union_non_union?: string | null
          updated_at?: string
        }
        Update: {
          adjusted_hire_date?: string | null
          created_at?: string
          department_id?: string
          department_name?: string
          employee_id?: string | null
          employee_name?: string | null
          employment_status?: string | null
          facility_id?: string
          facility_name?: string
          flsa_code?: string | null
          full_part_time?: string | null
          home_cost_center?: string | null
          home_cost_center_id?: string | null
          id?: string
          job_code?: string | null
          job_title?: string | null
          market?: string
          original_hire_date?: string | null
          pay_type?: string | null
          people_manager_id?: string | null
          people_manager_name?: string | null
          position_control_id?: string | null
          regular_temporary?: string | null
          status?: string | null
          termination_date?: string | null
          union_non_union?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string
          id: string
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string
          id?: string
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string
          id?: string
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staffing_standards: {
        Row: {
          additional_data_1: string | null
          additional_data_2: string | null
          additional_data_3: string | null
          adjusted_patient_days: number | null
          admissions: number | null
          alos: number | null
          charge_nurse_fte: number | null
          clerk_fte: number | null
          cmindex: number | null
          cna_fte: number | null
          contracted_registry_fte: number | null
          contracted_registry_hours: number | null
          contracted_registry_hppd: number | null
          created_at: string
          department_id: string
          department_name: string
          direct_patient_care_fte: number | null
          direct_patient_care_hours: number | null
          direct_patient_care_hppd: number | null
          educator_fte: number | null
          facility_id: string
          facility_name: string
          id: string
          indirect_patient_care_fte: number | null
          indirect_patient_care_hours: number | null
          indirect_patient_care_hppd: number | null
          lvn_fte: number | null
          manager_fte: number | null
          market: string
          non_productive_fte: number | null
          non_productive_hours: number | null
          other_fte: number | null
          overhead_fte: number | null
          overhead_hours: number | null
          overhead_hppd: number | null
          patient_days: number | null
          rn_fte: number | null
          total_fte: number | null
          total_hours: number | null
          total_hppd: number | null
          total_worked_fte: number | null
          total_worked_hours: number | null
          total_worked_hppd: number | null
          total_worked_productive_fte: number | null
          total_worked_productive_hours: number | null
          total_worked_productive_hppd: number | null
          updated_at: string
        }
        Insert: {
          additional_data_1?: string | null
          additional_data_2?: string | null
          additional_data_3?: string | null
          adjusted_patient_days?: number | null
          admissions?: number | null
          alos?: number | null
          charge_nurse_fte?: number | null
          clerk_fte?: number | null
          cmindex?: number | null
          cna_fte?: number | null
          contracted_registry_fte?: number | null
          contracted_registry_hours?: number | null
          contracted_registry_hppd?: number | null
          created_at?: string
          department_id: string
          department_name: string
          direct_patient_care_fte?: number | null
          direct_patient_care_hours?: number | null
          direct_patient_care_hppd?: number | null
          educator_fte?: number | null
          facility_id: string
          facility_name: string
          id?: string
          indirect_patient_care_fte?: number | null
          indirect_patient_care_hours?: number | null
          indirect_patient_care_hppd?: number | null
          lvn_fte?: number | null
          manager_fte?: number | null
          market: string
          non_productive_fte?: number | null
          non_productive_hours?: number | null
          other_fte?: number | null
          overhead_fte?: number | null
          overhead_hours?: number | null
          overhead_hppd?: number | null
          patient_days?: number | null
          rn_fte?: number | null
          total_fte?: number | null
          total_hours?: number | null
          total_hppd?: number | null
          total_worked_fte?: number | null
          total_worked_hours?: number | null
          total_worked_hppd?: number | null
          total_worked_productive_fte?: number | null
          total_worked_productive_hours?: number | null
          total_worked_productive_hppd?: number | null
          updated_at?: string
        }
        Update: {
          additional_data_1?: string | null
          additional_data_2?: string | null
          additional_data_3?: string | null
          adjusted_patient_days?: number | null
          admissions?: number | null
          alos?: number | null
          charge_nurse_fte?: number | null
          clerk_fte?: number | null
          cmindex?: number | null
          cna_fte?: number | null
          contracted_registry_fte?: number | null
          contracted_registry_hours?: number | null
          contracted_registry_hppd?: number | null
          created_at?: string
          department_id?: string
          department_name?: string
          direct_patient_care_fte?: number | null
          direct_patient_care_hours?: number | null
          direct_patient_care_hppd?: number | null
          educator_fte?: number | null
          facility_id?: string
          facility_name?: string
          id?: string
          indirect_patient_care_fte?: number | null
          indirect_patient_care_hours?: number | null
          indirect_patient_care_hppd?: number | null
          lvn_fte?: number | null
          manager_fte?: number | null
          market?: string
          non_productive_fte?: number | null
          non_productive_hours?: number | null
          other_fte?: number | null
          overhead_fte?: number | null
          overhead_hours?: number | null
          overhead_hppd?: number | null
          patient_days?: number | null
          rn_fte?: number | null
          total_fte?: number | null
          total_hours?: number | null
          total_hppd?: number | null
          total_worked_fte?: number | null
          total_worked_hours?: number | null
          total_worked_hppd?: number | null
          total_worked_productive_fte?: number | null
          total_worked_productive_hours?: number | null
          total_worked_productive_hppd?: number | null
          updated_at?: string
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
    Enums: {},
  },
} as const
