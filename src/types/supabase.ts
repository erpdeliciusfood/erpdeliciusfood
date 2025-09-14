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
      consumption_records: {
        Row: {
          consumed_at: string | null
          id: string
          insumo_id: string
          quantity_consumed: number
          service_report_id: string
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          id?: string
          insumo_id: string
          quantity_consumed: number
          service_report_id: string
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          id?: string
          insumo_id?: string
          quantity_consumed?: number
          service_report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumption_records_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_records_service_report_id_fkey"
            columns: ["service_report_id"]
            isOneToOne: false
            referencedRelation: "service_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      insumo_price_history: {
        Row: {
          changed_at: string | null
          id: string
          insumo_id: string
          new_costo_unitario: number | null
          old_costo_unitario: number | null
        }
        Insert: {
          changed_at?: string | null
          id?: string
          insumo_id: string
          new_costo_unitario?: number | null
          old_costo_unitario?: number | null
        }
        Update: {
          changed_at?: string | null
          id?: string
          insumo_id?: string
          new_costo_unitario?: number | null
          old_costo_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insumo_price_history_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      insumo_supplier_history: {
        Row: {
          changed_at: string | null
          id: string
          insumo_id: string
          new_supplier_address: string | null
          new_supplier_name: string | null
          new_supplier_phone: string | null
          old_supplier_address: string | null
          old_supplier_name: string | null
          old_supplier_phone: string | null
        }
        Insert: {
          changed_at?: string | null
          id?: string
          insumo_id: string
          new_supplier_address?: string | null
          new_supplier_name?: string | null
          new_supplier_phone?: string | null
          old_supplier_address?: string | null
          old_supplier_name?: string | null
          old_supplier_phone?: string | null
        }
        Update: {
          changed_at?: string | null
          id?: string
          insumo_id?: string
          new_supplier_address?: string | null
          new_supplier_name?: string | null
          new_supplier_phone?: string | null
          old_supplier_address?: string | null
          old_supplier_name?: string | null
          old_supplier_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insumo_supplier_history_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos: {
        Row: {
          base_unit: string
          category: string
          committed_quantity: number
          conversion_factor: number
          costo_unitario: number
          created_at: string | null
          discrepancy_quantity: number
          id: string
          last_physical_count_date: string | null
          last_physical_count_quantity: number
          last_price_update: string | null
          min_stock_level: number | null
          nombre: string
          pending_delivery_quantity: number
          pending_reception_quantity: number
          proveedor_preferido_id: string | null
          purchase_unit: string
          received_stock_quantity: number
          stock_quantity: number
          supplier_address: string | null
          supplier_name: string | null
          supplier_phone: string | null
          user_id: string
        }
        Insert: {
          base_unit: string
          category?: string
          committed_quantity?: number
          conversion_factor?: number
          costo_unitario: number
          created_at?: string | null
          discrepancy_quantity?: number
          id?: string
          last_physical_count_date?: string | null
          last_physical_count_quantity?: number
          last_price_update?: string | null
          min_stock_level?: number | null
          nombre: string
          pending_delivery_quantity?: number
          pending_reception_quantity?: number
          proveedor_preferido_id?: string | null
          purchase_unit?: string
          received_stock_quantity?: number
          stock_quantity?: number
          supplier_address?: string | null
          supplier_name?: string | null
          supplier_phone?: string | null
          user_id: string
        }
        Update: {
          base_unit?: string
          category?: string
          committed_quantity?: number
          conversion_factor?: number
          costo_unitario?: number
          created_at?: string | null
          discrepancy_quantity?: number
          id?: string
          last_physical_count_date?: string | null
          last_physical_count_quantity?: number
          last_price_update?: string | null
          min_stock_level?: number | null
          nombre?: string
          pending_delivery_quantity?: number
          pending_reception_quantity?: number
          proveedor_preferido_id?: string | null
          purchase_unit?: string
          received_stock_quantity?: number
          stock_quantity?: number
          supplier_address?: string | null
          supplier_name?: string | null
          supplier_phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insumos_proveedor_preferido_id_fkey"
            columns: ["proveedor_preferido_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_services: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      menu_platos: {
        Row: {
          created_at: string | null
          dish_category: string
          id: string
          meal_service_id: string
          menu_id: string
          plato_id: string
          quantity_needed: number
        }
        Insert: {
          created_at?: string | null
          dish_category?: string
          id?: string
          meal_service_id: string
          menu_id: string
          plato_id: string
          quantity_needed?: number
        }
        Update: {
          created_at?: string | null
          dish_category?: string
          id?: string
          meal_service_id?: string
          menu_id?: string
          plato_id?: string
          quantity_needed?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_platos_meal_service_id_fkey"
            columns: ["meal_service_id"]
            isOneToOne: false
            referencedRelation: "meal_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_platos_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_platos_plato_id_fkey"
            columns: ["plato_id"]
            isOneToOne: false
            referencedRelation: "platos"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string | null
          description: string | null
          event_type_id: string | null
          id: string
          menu_date: string | null
          menu_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type_id?: string | null
          id?: string
          menu_date?: string | null
          menu_type?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type_id?: string | null
          id?: string
          menu_date?: string | null
          menu_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menus_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plato_insumos: {
        Row: {
          cantidad_necesaria: number
          created_at: string | null
          id: string
          insumo_id: string
          plato_id: string
        }
        Insert: {
          cantidad_necesaria: number
          created_at?: string | null
          id?: string
          insumo_id: string
          plato_id: string
        }
        Update: {
          cantidad_necesaria?: number
          created_at?: string | null
          id?: string
          insumo_id?: string
          plato_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plato_insumos_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plato_insumos_plato_id_fkey"
            columns: ["plato_id"]
            isOneToOne: false
            referencedRelation: "platos"
            referencedColumns: ["id"]
          },
        ]
      }
      platos: {
        Row: {
          categoria: string | null
          category: string | null
          costo_produccion: number | null
          costo_total: number | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          tiempo_preparacion: number | null
          user_id: string
        }
        Insert: {
          categoria?: string | null
          category?: string | null
          costo_produccion?: number | null
          costo_total?: number | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          tiempo_preparacion?: number | null
          user_id: string
        }
        Update: {
          categoria?: string | null
          category?: string | null
          costo_produccion?: number | null
          costo_total?: number | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          tiempo_preparacion?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      purchase_records: {
        Row: {
          created_at: string | null
          from_registered_supplier: boolean
          id: string
          insumo_id: string
          notes: string | null
          purchase_date: string
          quantity_purchased: number
          quantity_received: number
          received_date: string | null
          status: string
          supplier_address_at_purchase: string | null
          supplier_name_at_purchase: string | null
          supplier_phone_at_purchase: string | null
          total_amount: number
          unit_cost_at_purchase: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_registered_supplier?: boolean
          id?: string
          insumo_id: string
          notes?: string | null
          purchase_date?: string
          quantity_purchased: number
          quantity_received?: number
          received_date?: string | null
          status?: string
          supplier_address_at_purchase?: string | null
          supplier_name_at_purchase?: string | null
          supplier_phone_at_purchase?: string | null
          total_amount: number
          unit_cost_at_purchase: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_registered_supplier?: boolean
          id?: string
          insumo_id?: string
          notes?: string | null
          purchase_date?: string
          quantity_purchased?: number
          quantity_received?: number
          received_date?: string | null
          status?: string
          supplier_address_at_purchase?: string | null
          supplier_name_at_purchase?: string | null
          supplier_phone_at_purchase?: string | null
          total_amount?: number
          unit_cost_at_purchase?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_records_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_report_platos: {
        Row: {
          created_at: string | null
          id: string
          plato_id: string
          quantity_sold: number
          service_report_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          plato_id: string
          quantity_sold?: number
          service_report_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          plato_id?: string
          quantity_sold?: number
          service_report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_report_platos_plato_id_fkey"
            columns: ["plato_id"]
            isOneToOne: false
            referencedRelation: "platos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_report_platos_service_report_id_fkey"
            columns: ["service_report_id"]
            isOneToOne: false
            referencedRelation: "service_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reports: {
        Row: {
          additional_services_revenue: number
          created_at: string | null
          id: string
          meal_service_id: string
          meals_sold: number
          menu_id: string
          notes: string | null
          report_date: string
          tickets_issued: number
          user_id: string
        }
        Insert: {
          additional_services_revenue?: number
          created_at?: string | null
          id?: string
          meal_service_id: string
          meals_sold?: number
          menu_id: string
          notes?: string | null
          report_date: string
          tickets_issued?: number
          user_id: string
        }
        Update: {
          additional_services_revenue?: number
          created_at?: string | null
          id?: string
          meal_service_id?: string
          meals_sold?: number
          menu_id?: string
          notes?: string | null
          report_date?: string
          tickets_issued?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reports_meal_service_id_fkey"
            columns: ["meal_service_id"]
            isOneToOne: false
            referencedRelation: "meal_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reports_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          insumo_id: string
          menu_id: string | null
          movement_type: string
          new_stock_quantity: number
          notes: string | null
          quantity_change: number
          source_document_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insumo_id: string
          menu_id?: string | null
          movement_type: string
          new_stock_quantity: number
          notes?: string | null
          quantity_change: number
          source_document_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insumo_id?: string
          menu_id?: string | null
          movement_type?: string
          new_stock_quantity?: number
          notes?: string | null
          quantity_change?: number
          source_document_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      urgent_purchase_requests: {
        Row: {
          created_at: string | null
          fulfilled_purchase_record_id: string | null
          id: string
          insistence_count: number | null
          insumo_id: string
          notes: string | null
          priority: string
          quantity_requested: number
          rejection_reason: string | null
          request_date: string
          requested_by_user_id: string
          source_module: string
          status: string
        }
        Insert: {
          created_at?: string | null
          fulfilled_purchase_record_id?: string | null
          id?: string
          insistence_count?: number | null
          insumo_id: string
          notes?: string | null
          priority?: string
          quantity_requested: number
          rejection_reason?: string | null
          request_date?: string
          requested_by_user_id: string
          source_module?: string
          status?: string
        }
        Update: {
          created_at?: string | null
          fulfilled_purchase_record_id?: string | null
          id?: string
          insistence_count?: number | null
          insumo_id?: string
          notes?: string | null
          priority?: string
          quantity_requested?: number
          rejection_reason?: string | null
          request_date?: string
          requested_by_user_id?: string
          source_module?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "urgent_purchase_requests_fulfilled_purchase_record_id_fkey"
            columns: ["fulfilled_purchase_record_id"]
            isOneToOne: false
            referencedRelation: "purchase_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_purchase_requests_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urgent_purchase_requests_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      call_deduct_service_report_stock_function: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      handle_insumo_price_update: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      handle_insumo_supplier_update: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_insumo_quantities: {
        Args: {
          insumo_id_param: string
          pending_delivery_change?: number
          pending_reception_change?: number
          stock_change?: number
        }
        Returns: {
          base_unit: string
          category: string
          committed_quantity: number
          conversion_factor: number
          costo_unitario: number
          created_at: string | null
          discrepancy_quantity: number
          id: string
          last_physical_count_date: string | null
          last_physical_count_quantity: number
          last_price_update: string | null
          min_stock_level: number | null
          nombre: string
          pending_delivery_quantity: number
          pending_reception_quantity: number
          proveedor_preferido_id: string | null
          purchase_unit: string
          received_stock_quantity: number
          stock_quantity: number
          supplier_address: string | null
          supplier_name: string | null
          supplier_phone: string | null
          user_id: string
        }[]
      }
      update_insumo_price_timestamp: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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