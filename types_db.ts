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
      "work-history": {
        Row: {
          code: string | null
          created_at: string
          department: string | null
          id: number
          isBackup: boolean | null
          model_name: string | null
          receivedDate: string | null
          serial: string | null
          task_details: string | null
          user: string | null
          writer: string | null
          client: string | null
          work_type: string | null
          pc_name: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          department?: string | null
          id?: number
          isBackup?: boolean | null
          model_name?: string | null
          receivedDate?: string | null
          serial?: string | null
          task_details?: string | null
          user?: string | null
          writer?: string | null
          client?: string | null
          work_type?: string | null
          pc_name?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          department?: string | null
          id?: number
          isBackup?: boolean | null
          model_name?: string | null
          receivedDate?: string | null
          serial?: string | null
          task_details?: string | null
          user?: string | null
          writer?: string | null
          client?: string | null
          work_type?: string | null
          pc_name?: string | null
        }
        Relationships: []
      },
      admins: {
        Row: {
          id: string;
          login_id: string;
          name: string;
          role: 'admin' | 'manager' | 'user';
          department: string | null;
          created_at: string;
          last_login: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          login_id: string;
          password: string;
          name: string;
          role?: 'admin' | 'manager' | 'user';
          department?: string | null;
          created_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
        Update: {
          login_id?: string;
          password?: string;
          name?: string;
          role?: 'admin' | 'manager' | 'user';
          department?: string | null;
          last_login?: string | null;
          is_active?: boolean;
        };
      },
      "pc_assets": {
        Row: {
          brand: string;
          model_name: string;
          serial_number: string;
          pc_type: string;
          status : string;
          first_stock_date : string;
        
      };
      Insert: {
        brand: string;
        model_name: string;
        serial_number: string;
        pc_type: string;
        status : string;
        first_stock_date : string;
      };
      Update: {
        brand: string;
        model_name: string;
        serial_number: string;
        pc_type: string;
        status : string;
        first_stock_date : string;
      };
  }
  "pc_management_log": {
    Row: {
      asset_id: number;
      employee_id: number;
      work_type: string;
      work_date: string;
      requester: string;
      security_code: string;
      detailed_description: string;
      created_by: string;
      created_at: string;
      status : string;
      is_available : boolean;
      usage_count : number;
      employee_workspace : string;
      employee_department : string;
      employee_name : string;
    }
    Insert: {
      asset_id: number;
      employee_id: number;
      work_type: string;
      work_date: string;
      requester: string;
      security_code: string;
      detailed_description: string;
      created_by: string;
      created_at: string;
      status : string;
      is_available : boolean;
      usage_count : number;
      employee_workspace : string;
      employee_department : string;
      employee_name : string;
    }
    Update: {
      asset_id: number;
      employee_id: number;
      work_type: string;
      work_date: string;
      requester: string;
      security_code: string;
      detailed_description: string;
      created_by: string;
      created_at: string;
      status : string;
      is_available : boolean;
      usage_count : number;
      employee_workspace : string;
      employee_department : string;
      employee_name : string;
    }
  };
  "employees": {
    Row: {
      name: string;
      department: string;
      workplace: string;
    }
    Insert: {
      name: string;
      department: string;
      workplace: string;
    }
    Update: {
      name: string;
      department: string;
      workplace: string;
    }
  };
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