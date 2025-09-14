import { Database } from "./supabase";

export type Profiles = Database['public']['Tables']['profiles']['Row'];
export type Insumo = Database['public']['Tables']['insumos']['Row'];
export type Plato = Database['public']['Tables']['platos']['Row'];
export type PlatoInsumo = Database['public']['Tables']['plato_insumos']['Row'];
export type Menu = Database['public']['Tables']['menus']['Row'];
export type MenuPlato = Database['public']['Tables']['menu_platos']['Row'];
export type EventType = Database['public']['Tables']['event_types']['Row'];
export type MealService = Database['public']['Tables']['meal_services']['Row'];
export type PurchaseRecord = Database['public']['Tables']['purchase_records']['Row'];
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
export type UrgentPurchaseRequest = Database['public']['Tables']['urgent_purchase_requests']['Row'];
export type InsumoPriceHistory = Database['public']['Tables']['insumo_price_history']['Row'];
export type InsumoSupplierHistory = Database['public']['Tables']['insumo_supplier_history']['Row'];
export type Proveedor = Database['public']['Tables']['proveedores']['Row'];
export type ServiceReport = Database['public']['Tables']['service_reports']['Row'];
export type ServiceReportPlato = Database['public']['Tables']['service_report_platos']['Row'];
export type ConsumptionRecord = Database['public']['Tables']['consumption_records']['Row'];

// Extend types with relations for fetching
export type InsumoWithRelations = Insumo & {
  proveedor_preferido?: Proveedor;
};

export type PlatoInsumoWithRelations = PlatoInsumo & {
  insumos?: InsumoWithRelations;
};

export type PlatoWithRelations = Plato & {
  plato_insumos?: PlatoInsumoWithRelations[];
};

export type MenuPlatoWithRelations = MenuPlato & {
  platos?: PlatoWithRelations;
  meal_services?: MealService;
};

export type MenuWithRelations = Menu & {
  event_types?: EventType;
  menu_platos?: MenuPlatoWithRelations[];
};

// Form values for Menu creation/update
export interface PlatoPorServicio {
  plato_id: string;
  meal_service_id: string;
  dish_category: string;
  quantity_needed: number;
}

export interface MenuFormValues {
  title: string;
  description?: string;
  menu_date: Date;
  event_type_id?: string;
  menu_type: 'daily' | 'special';
  platos_por_servicio: PlatoPorServicio[];
}

// Aggregated Insumo Need for Daily Prep Overview
export interface AggregatedInsumoNeed {
  insumo_id: string;
  insumo_nombre: string;
  base_unit: string;
  purchase_unit: string;
  conversion_factor: number;
  current_stock_quantity: number;
  total_needed_base_unit: number;
  total_needed_purchase_unit: number;
  missing_quantity: number;
  meal_service_id: string; // Added for grouping
  meal_service_name: string; // Added for grouping
}

// New type for grouped insumo needs
export interface GroupedInsumoNeeds {
  meal_service_id: string;
  meal_service_name: string;
  insumos: AggregatedInsumoNeed[];
}

// For DeductQuantitiesDialog
export interface InsumoToDeduct {
  insumo_id: string;
  insumo_nombre: string;
  purchase_unit: string;
  quantity_to_deduct: number;
  current_stock_quantity: number;
}