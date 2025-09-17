import { Database } from "./supabase";

// Base types from Supabase auto-generated file
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Insumo = Database['public']['Tables']['insumos']['Row'];
export type Plato = Database['public']['Tables']['platos']['Row'];
export type PlatoInsumo = Database['public']['Tables']['plato_insumos']['Row'];
export type Menu = Database['public']['Tables']['menus']['Row'] & { menu_type: 'daily' | 'event' }; // Explicitly define menu_type
export type MenuPlato = Database['public']['Tables']['menu_platos']['Row'];
export type EventType = Database['public']['Tables']['event_types']['Row'];
export type MealService = Database['public']['Tables']['meal_services']['Row'];
export type PurchaseRecord = Database['public']['Tables']['purchase_records']['Row'] & { status: 'ordered' | 'received_by_company' | 'received_by_warehouse' | 'cancelled' }; // Explicitly define status
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
export type UrgentPurchaseRequest = Database['public']['Tables']['urgent_purchase_requests']['Row'] & { priority: 'urgent' | 'high' | 'medium' | 'low'; status: 'pending' | 'approved' | 'rejected' | 'fulfilled' }; // Explicitly define priority and status
export type InsumoPriceHistory = Database['public']['Tables']['insumo_price_history']['Row'];
export type InsumoSupplierHistory = Database['public']['Tables']['insumo_supplier_history']['Row'];
export type Supplier = Database['public']['Tables']['proveedores']['Row'];
export type ServiceReport = Database['public']['Tables']['service_reports']['Row'];
export type ServiceReportPlato = Database['public']['Tables']['service_report_platos']['Row'];
export type ConsumptionRecord = Database['public']['Tables']['consumption_records']['Row'];

// Extended types with relations for fetching
export type InsumoWithRelations = Insumo & {
  proveedores?: Supplier;
};

export type PlatoInsumoWithRelations = PlatoInsumo & {
  insumos?: InsumoWithRelations;
};

export type Receta = Plato & {
  plato_insumos?: PlatoInsumoWithRelations[];
};

export type MenuPlatoWithRelations = MenuPlato & {
  platos?: Receta;
  meal_services?: MealService;
};

export type MenuWithRelations = Menu & {
  event_types?: EventType;
  menu_platos?: MenuPlatoWithRelations[];
};

// NEW: Extended ServiceReport to include MenuWithRelations
export type ServiceReportWithRelations = ServiceReport & {
  meal_services?: MealService;
  menus?: MenuWithRelations; // Add menu relation
  service_report_platos?: ServiceReportPlatoWithRelations[];
};

export type ServiceReportPlatoWithRelations = ServiceReportPlato & {
  platos?: Receta;
};

export type PurchaseRecordWithRelations = PurchaseRecord & {
  insumos?: Insumo;
};

export type StockMovementWithRelations = StockMovement & {
  insumos?: Insumo;
};

export type UrgentPurchaseRequestWithRelations = UrgentPurchaseRequest & {
  insumos?: Insumo;
};


// Form values interfaces
export interface InsumoFormValues {
  nombre: string;
  base_unit: string;
  costo_unitario: number;
  stock_quantity: number;
  purchase_unit: string;
  conversion_factor: number;
  min_stock_level: number;
  category: string;
  supplier_name?: string | null;
  supplier_phone?: string | null;
  supplier_address?: string | null;
  pending_reception_quantity?: number;
  pending_delivery_quantity?: number;
  last_physical_count_quantity?: number;
  last_physical_count_date?: string | null;
  discrepancy_quantity?: number;
  proveedor_preferido_id?: string | null;
}

export interface PlatoPorServicioForm {
  meal_service_id: string;
  plato_id: string;
  dish_category: string;
  quantity_needed: number;
}

export interface MenuFormValues {
  title: string;
  description: string | null;
  menu_date: string | null;
  event_type_id: string | null;
  menu_type: 'daily' | 'event';
  platos_por_servicio: PlatoPorServicioForm[];
}

export interface RecetaFormValues {
  nombre: string;
  descripcion: string | null;
  category: string;
  insumos: { insumo_id: string; cantidad_necesaria: number }[];
}

export interface ServiceReportFormValues {
  report_date: string;
  meal_service_id: string;
  menu_id: string; // NEW: Added menu_id
  tickets_issued: number;
  meals_sold: number;
  additional_services_revenue: number;
  notes: string | null;
  platos_vendidos: { plato_id: string; quantity_sold: number }[];
}

export interface PurchaseRecordFormValues {
  insumo_id: string;
  purchase_date: string;
  quantity_purchased: number;
  quantity_received?: number;
  unit_cost_at_purchase: number;
  total_amount: number;
  supplier_name_at_purchase: string | null;
  supplier_phone_at_purchase: string | null;
  supplier_address_at_purchase: string | null;
  from_registered_supplier: boolean;
  notes: string | null;
  status?: 'ordered' | 'received_by_company' | 'received_by_warehouse' | 'cancelled';
  received_date?: string | null;
}

export interface UrgentPurchaseRequestFormValues {
  insumo_id: string;
  quantity_requested: number;
  notes: string | null;
  source_module?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  fulfilled_purchase_record_id?: string | null;
  insistence_count?: number;
  rejection_reason?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | 'fulfilled'; // NEW: Added status field
}

export interface SupplierFormValues {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface ProfileFormValues { // Made first_name and last_name optional
  first_name?: string | null;
  last_name?: string | null;
  role?: 'user' | 'admin';
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
  deducted_quantity_for_prep: number; // NEW: Quantity already deducted for this need
  deduction_status: 'pending' | 'partial' | 'fulfilled'; // NEW: Status of deduction
}

// NEW: Type for a single, granular insumo deduction item
export interface InsumoDeductionItem {
  unique_id: string; // Composite key: insumo_id-plato_id-meal_service_id-menu_id
  insumo_id: string;
  insumo_nombre: string;
  base_unit: string;
  purchase_unit: string;
  conversion_factor: number;
  current_stock_quantity: number; // Current stock of the insumo
  total_needed_base_unit_for_item: number; // Quantity needed for this specific recipe/service item (in base unit)
  total_needed_purchase_unit_for_item: number; // Quantity needed for this specific recipe/service item (in purchase unit)
  plato_id: string;
  plato_nombre: string;
  meal_service_id: string;
  meal_service_name: string;
  menu_id: string; // The menu this item belongs to
  menu_title: string; // The title of the menu
  menu_date: string | null; // The date of the menu
}

// New type for grouped insumo needs (for display in DailyPrepOverview)
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

// Interface for suggested insumos in PurchaseAnalysis
export interface InsumoNeeded extends Insumo {
  // Explicitly define properties that might be nullable in base Insumo but are expected here
  id: string;
  nombre: string;
  purchase_unit: string;
  costo_unitario: number;
  min_stock_level: number | null; // Keep as nullable as per DB schema
  supplier_name: string | null;
  supplier_phone: string | null;
  supplier_address: string | null;

  quantity_needed_for_period_raw: number;
  quantity_needed_for_period_rounded: number;
  quantity_needed_for_period_rounded_up: boolean;
  current_stock: number;
  purchase_suggestion_raw: number;
  purchase_suggestion_rounded: number;
  purchase_suggestion_rounded_up: boolean;
  estimated_purchase_cost: number;
  reason_for_purchase_suggestion: 'menu_demand' | 'min_stock_level' | 'both' | 'zero_stock_alert';
}

// Interfaces for Quebrado Report
export interface QuebradoInsumoDetail {
  insumoId: string;
  insumoName: string;
  quantityNeeded: number; // in purchase_unit
  unit: string; // purchase_unit
}

export interface QuebradoRecipeDetail {
  recipeId: string;
  recipeName: string;
  dinerCount: number; // per-service diner count
  insumos: QuebradoInsumoDetail[];
}

export interface QuebradoServiceDetail {
  serviceId: string;
  serviceName: string;
  recipes: QuebradoRecipeDetail[];
}

export interface QuebradoDayDetail {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g., "lunes"
  services: QuebradoServiceDetail[];
}

export interface ConsolidatedInsumo {
  insumoId: string;
  insumoName: string;
  totalQuantity: number;
  unit: string;
  services: string[]; // List of service names where it's used
  currentStock: number; // NEW: Current stock quantity of the insumo
  minStockLevel: number | null; // NEW: Min stock level of the insumo
}

export interface QuebradoReportData {
  message: string;
  quebradoData: QuebradoDayDetail[];
  consolidatedInsumos: ConsolidatedInsumo[];
  downloadUrl?: string;
}

export interface StockMovementFormValues {
  insumo_id: string;
  movement_type: 'purchase_in' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out' | 'reception_in';
  quantity_change: number; // Made mandatory
  notes: string | null;
  menu_id?: string | null;
  user_id: string; // Added user_id
  // Removed total_purchase_amount and total_purchase_quantity as they are not directly part of the RPC
  // The logic for calculating unit cost will be handled within createStockMovement
}


export const MEAL_SERVICES_ORDER = [
  "Desayuno",
  "Almuerzo regular",
  "Almuerzo Saludable",
  "Almuerzo Dieta Blanda",
  "Cena",
  "Merienda",
];

export const RECETA_CATEGORIES = [
  "SOPA",
  "SANDWICH",
  "BEBIDAS CALIENTES",
  "REFRESCO",
  "INFUSIONES",
  "TE",
  "CAFE",
  "ENTRADA",
  "PLATO DE FONDO",
  "POSTRE",
  "ENSALADA SALUDABLE",
  "SOPA SALUDABLE",
  "POSTRE SALUDABLE",
  "SOPA DIETA BLANDA",
  "PLATO DE FONDO DIETA BLANDA",
  "SANCOCHADO",
  "FRUTA",
  "ENSALADA",
  "OTROS"
];

export const MENU_DISH_SERVICE_CATEGORIES = [
  "Desayuno / Merienda",
  "Entrada",
  "Sopa / Crema",
  "Ensalada Fría",
  "Ensalada Caliente",
  "Plato de Fondo - Carnes",
  "Plato de Fondo - Aves",
  "Plato de Fondo - Pescados y Mariscos",
  "Plato de Fondo - Pastas y Arroces",
  "Plato de Fondo - Vegetariano / Vegano",
  "Acompañamiento / Guarnición",
  "Postre",
  "Bebida",
  "Dieta Blanda",
  "Otra Opción",
];