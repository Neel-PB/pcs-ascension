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
      data_refresh_log: {
        Row: {
          created_at: string | null
          data_source: string
          id: string
          last_refresh_at: string
          notes: string | null
          record_count: number | null
          refresh_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_source: string
          id?: string
          last_refresh_at: string
          notes?: string | null
          record_count?: number | null
          refresh_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_source?: string
          id?: string
          last_refresh_at?: string
          notes?: string | null
          record_count?: number | null
          refresh_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          region: string | null
          submarket: string | null
        }
        Insert: {
          created_at?: string
          facility_id: string
          facility_name: string
          id?: string
          market: string
          region?: string | null
          submarket?: string | null
        }
        Update: {
          created_at?: string
          facility_id?: string
          facility_name?: string
          id?: string
          market?: string
          region?: string | null
          submarket?: string | null
        }
        Relationships: []
      }
      forecast_positions_to_close: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          department_id: string | null
          department_name: string
          facility_id: string | null
          facility_name: string
          fte: number
          id: string
          is_gap_record: boolean | null
          market: string
          parent_id: string | null
          reason_to_close: string
          selected_position_ids: Json | null
          skill_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department_id?: string | null
          department_name: string
          facility_id?: string | null
          facility_name: string
          fte: number
          id?: string
          is_gap_record?: boolean | null
          market: string
          parent_id?: string | null
          reason_to_close: string
          selected_position_ids?: Json | null
          skill_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department_id?: string | null
          department_name?: string
          facility_id?: string | null
          facility_name?: string
          fte?: number
          id?: string
          is_gap_record?: boolean | null
          market?: string
          parent_id?: string | null
          reason_to_close?: string
          selected_position_ids?: Json | null
          skill_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_positions_to_close_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forecast_positions_to_close"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_positions_to_open: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          department_id: string | null
          department_name: string
          facility_id: string | null
          facility_name: string
          fte: number
          id: string
          is_gap_record: boolean | null
          market: string
          parent_id: string | null
          reason_to_open: string
          skill_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department_id?: string | null
          department_name: string
          facility_id?: string | null
          facility_name: string
          fte: number
          id?: string
          is_gap_record?: boolean | null
          market: string
          parent_id?: string | null
          reason_to_open: string
          skill_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department_id?: string | null
          department_name?: string
          facility_id?: string | null
          facility_name?: string
          fte?: number
          id?: string
          is_gap_record?: boolean | null
          market?: string
          parent_id?: string | null
          reason_to_open?: string
          skill_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_positions_to_open_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forecast_positions_to_open"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_performance: {
        Row: {
          actual_fte: number | null
          created_at: string
          departmentId: string
          departmentName: string
          facilityId: string
          facilityName: string
          id: string
          laborHoursPerUoS: number | null
          manhours: number | null
          market: string
          month: string | null
          updated_at: string
          volume: number | null
        }
        Insert: {
          actual_fte?: number | null
          created_at?: string
          departmentId: string
          departmentName: string
          facilityId: string
          facilityName: string
          id?: string
          laborHoursPerUoS?: number | null
          manhours?: number | null
          market: string
          month?: string | null
          updated_at?: string
          volume?: number | null
        }
        Update: {
          actual_fte?: number | null
          created_at?: string
          departmentId?: string
          departmentName?: string
          facilityId?: string
          facilityName?: string
          id?: string
          laborHoursPerUoS?: number | null
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
          region: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          market: string
          region?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          market?: string
          region?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sent_at: string
          target_roles: string[]
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sent_at?: string
          target_roles: string[]
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sent_at?: string
          target_roles?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      position_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          position_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          position_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          position_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          actual_fte: number | null
          actual_fte_expiry: string | null
          actual_fte_status: string | null
          created_at: string
          departmentId: string
          departmentName: string
          employeeId: string | null
          employeeName: string | null
          employeeType: string | null
          employmentFlag: string | null
          employmentType: string | null
          facilityId: string
          facilityName: string
          FTE: number | null
          id: string
          jobcode: string | null
          jobFamily: string | null
          jobTitle: string | null
          managerEmployeeId: string | null
          managerName: string | null
          managerPositionNum: string | null
          market: string
          payrollStatus: string | null
          positionLifecycle: string | null
          positionNum: string | null
          positionStatus: string | null
          positionStatusDate: string | null
          shift: string | null
          shift_override: string | null
          standardHours: number | null
          updated_at: string
        }
        Insert: {
          actual_fte?: number | null
          actual_fte_expiry?: string | null
          actual_fte_status?: string | null
          created_at?: string
          departmentId: string
          departmentName: string
          employeeId?: string | null
          employeeName?: string | null
          employeeType?: string | null
          employmentFlag?: string | null
          employmentType?: string | null
          facilityId: string
          facilityName: string
          FTE?: number | null
          id?: string
          jobcode?: string | null
          jobFamily?: string | null
          jobTitle?: string | null
          managerEmployeeId?: string | null
          managerName?: string | null
          managerPositionNum?: string | null
          market: string
          payrollStatus?: string | null
          positionLifecycle?: string | null
          positionNum?: string | null
          positionStatus?: string | null
          positionStatusDate?: string | null
          shift?: string | null
          shift_override?: string | null
          standardHours?: number | null
          updated_at?: string
        }
        Update: {
          actual_fte?: number | null
          actual_fte_expiry?: string | null
          actual_fte_status?: string | null
          created_at?: string
          departmentId?: string
          departmentName?: string
          employeeId?: string | null
          employeeName?: string | null
          employeeType?: string | null
          employmentFlag?: string | null
          employmentType?: string | null
          facilityId?: string
          facilityName?: string
          FTE?: number | null
          id?: string
          jobcode?: string | null
          jobFamily?: string | null
          jobTitle?: string | null
          managerEmployeeId?: string | null
          managerName?: string | null
          managerPositionNum?: string | null
          market?: string
          payrollStatus?: string | null
          positionLifecycle?: string | null
          positionNum?: string | null
          positionStatus?: string | null
          positionStatusDate?: string | null
          shift?: string | null
          shift_override?: string | null
          standardHours?: number | null
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
          email: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          region: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          region: string
        }
        Update: {
          created_at?: string | null
          id?: string
          region?: string
        }
        Relationships: []
      }
      staffing_standards: {
        Row: {
          "% Census": number | null
          "1:1 / Other": number | null
          ANM: number | null
          "CL : PT": string | null
          "CL Day total hours": number | null
          "CL Night total hours": number | null
          "CL-Day": number | null
          "CL-Night": number | null
          "Clerk Day total hours": number | null
          "Clerk Night total hours": number | null
          "Clerk-Day": number | null
          "Clerk-Night": number | null
          Column1: string | null
          Column2: string | null
          Column3: string | null
          created_at: string
          departmentId: string
          departmentName: string
          Director: number | null
          facilityId: string
          facilityName: string
          "Fixed Hrs Per UoS": number | null
          Frequency: string | null
          id: string
          Manager: number | null
          market: string
          "Ops Coordinator": number | null
          Patients: number | null
          "PCT Day total hours": number | null
          "PCT Night total hours": number | null
          "PCT-Day": number | null
          "PCT-Night": number | null
          "Practice Specialist": number | null
          "RN : PT": string | null
          "RN Day total hours": number | null
          "RN Night total hours": number | null
          "RN-Day": number | null
          "RN-Night": number | null
          "Total Overhead Hours": number | null
          updated_at: string
          "Variable Hrs Per UoS": number | null
        }
        Insert: {
          "% Census"?: number | null
          "1:1 / Other"?: number | null
          ANM?: number | null
          "CL : PT"?: string | null
          "CL Day total hours"?: number | null
          "CL Night total hours"?: number | null
          "CL-Day"?: number | null
          "CL-Night"?: number | null
          "Clerk Day total hours"?: number | null
          "Clerk Night total hours"?: number | null
          "Clerk-Day"?: number | null
          "Clerk-Night"?: number | null
          Column1?: string | null
          Column2?: string | null
          Column3?: string | null
          created_at?: string
          departmentId: string
          departmentName: string
          Director?: number | null
          facilityId: string
          facilityName: string
          "Fixed Hrs Per UoS"?: number | null
          Frequency?: string | null
          id?: string
          Manager?: number | null
          market: string
          "Ops Coordinator"?: number | null
          Patients?: number | null
          "PCT Day total hours"?: number | null
          "PCT Night total hours"?: number | null
          "PCT-Day"?: number | null
          "PCT-Night"?: number | null
          "Practice Specialist"?: number | null
          "RN : PT"?: string | null
          "RN Day total hours"?: number | null
          "RN Night total hours"?: number | null
          "RN-Day"?: number | null
          "RN-Night"?: number | null
          "Total Overhead Hours"?: number | null
          updated_at?: string
          "Variable Hrs Per UoS"?: number | null
        }
        Update: {
          "% Census"?: number | null
          "1:1 / Other"?: number | null
          ANM?: number | null
          "CL : PT"?: string | null
          "CL Day total hours"?: number | null
          "CL Night total hours"?: number | null
          "CL-Day"?: number | null
          "CL-Night"?: number | null
          "Clerk Day total hours"?: number | null
          "Clerk Night total hours"?: number | null
          "Clerk-Day"?: number | null
          "Clerk-Night"?: number | null
          Column1?: string | null
          Column2?: string | null
          Column3?: string | null
          created_at?: string
          departmentId?: string
          departmentName?: string
          Director?: number | null
          facilityId?: string
          facilityName?: string
          "Fixed Hrs Per UoS"?: number | null
          Frequency?: string | null
          id?: string
          Manager?: number | null
          market?: string
          "Ops Coordinator"?: number | null
          Patients?: number | null
          "PCT Day total hours"?: number | null
          "PCT Night total hours"?: number | null
          "PCT-Day"?: number | null
          "PCT-Night"?: number | null
          "Practice Specialist"?: number | null
          "RN : PT"?: string | null
          "RN Day total hours"?: number | null
          "RN Night total hours"?: number | null
          "RN-Day"?: number | null
          "RN-Night"?: number | null
          "Total Overhead Hours"?: number | null
          updated_at?: string
          "Variable Hrs Per UoS"?: number | null
        }
        Relationships: []
      }
      user_organization_access: {
        Row: {
          created_at: string | null
          department_id: string | null
          department_name: string | null
          facility_id: string | null
          facility_name: string | null
          id: string
          market: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          department_name?: string | null
          facility_id?: string | null
          facility_name?: string | null
          id?: string
          market?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          department_name?: string | null
          facility_id?: string | null
          facility_name?: string | null
          id?: string
          market?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      volume_override_config: {
        Row: {
          backfill_lookback_months: number
          created_at: string
          created_by: string | null
          enable_backfill: boolean
          fiscal_year_end_day: number
          fiscal_year_end_month: number
          id: string
          max_override_months_full_history: number
          min_months_for_target: number
          min_months_mandatory_override: number
          min_volume_threshold: number | null
          updated_at: string
        }
        Insert: {
          backfill_lookback_months?: number
          created_at?: string
          created_by?: string | null
          enable_backfill?: boolean
          fiscal_year_end_day?: number
          fiscal_year_end_month?: number
          id?: string
          max_override_months_full_history?: number
          min_months_for_target?: number
          min_months_mandatory_override?: number
          min_volume_threshold?: number | null
          updated_at?: string
        }
        Update: {
          backfill_lookback_months?: number
          created_at?: string
          created_by?: string | null
          enable_backfill?: boolean
          fiscal_year_end_day?: number
          fiscal_year_end_month?: number
          id?: string
          max_override_months_full_history?: number
          min_months_for_target?: number
          min_months_mandatory_override?: number
          min_volume_threshold?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volume_override_config_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volume_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          department_id: string
          department_name: string
          expiry_date: string
          facility_id: string
          facility_name: string
          historical_months_count: number | null
          id: string
          market: string
          max_allowed_expiry_date: string | null
          override_mandatory: boolean | null
          override_volume: number
          target_volume: number | null
          updated_at: string
          validation_message: string | null
          validation_status: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id: string
          department_name: string
          expiry_date: string
          facility_id: string
          facility_name: string
          historical_months_count?: number | null
          id?: string
          market: string
          max_allowed_expiry_date?: string | null
          override_mandatory?: boolean | null
          override_volume: number
          target_volume?: number | null
          updated_at?: string
          validation_message?: string | null
          validation_status?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string
          department_name?: string
          expiry_date?: string
          facility_id?: string
          facility_name?: string
          historical_months_count?: number | null
          id?: string
          market?: string
          max_allowed_expiry_date?: string | null
          override_mandatory?: boolean | null
          override_volume?: number
          target_volume?: number | null
          updated_at?: string
          validation_message?: string | null
          validation_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "labor_team"
        | "leadership"
        | "cno"
        | "director"
        | "nurse_manager"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "labor_team",
        "leadership",
        "cno",
        "director",
        "nurse_manager",
      ],
    },
  },
} as const
