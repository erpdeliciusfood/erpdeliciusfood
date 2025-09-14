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
  total_needed_base_unit: number; // Added this line
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

export interface StockMovement {
  id: string;
  user_id: string;
  insumo_id: string;
  movement_type: 'purchase_in' | 'consumption_out' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out' | 'reception_in'; // NEW: Added reception_in
  quantity_change: number;
  new_stock_quantity: number;
  source_document_id: string | null;
  menu_id?: string | null;
  notes: string | null;
  created_at: string;
  insumos?: Insumo;
}

export interface StockMovementFormValues {
  insumo_id: string;
  movement_type: 'purchase_in' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out' | 'reception_in'; // NEW: Added reception_in
  quantity_change?: number;
  total_purchase_amount?: number;
  total_purchase_quantity?: number;
  notes: string | null;
  menu_id?: string | null;
}

export interface InsumoSupplierHistory {
  id: string;
  insumo_id: string;
  old_supplier_name: string | null;
  new_supplier_name: string | null;
  old_supplier_phone: string | null;
  new_supplier_phone: string | null;
  old_supplier_address: string | null;
  new_supplier_address: string | null;
  changed_at: string;
}

export interface InsumoPriceHistory {
  id: string;
  insumo_id: string;
  old_costo_unitario: number;
  new_costo_unitario: number;
  changed_at: string;
}

export interface PurchaseRecord {
  id: string;
  user_id: string;
  insumo_id: string;
  purchase_date: string;
  quantity_purchased: number;
  quantity_received: number; // NEW: Track quantity received for partial receptions
  unit_cost_at_purchase: number;
  total_amount: number;
  supplier_name_at_purchase: string | null;
  supplier_phone_at_purchase: string | null;
  supplier_address_at_purchase: string | null;
  from_registered_supplier: boolean;
  notes: string | null;
  status: 'ordered' | 'received_by_company' | 'received_by_warehouse' | 'cancelled'; // NEW: Add status to PurchaseRecord
  received_date: string | null; // NEW: Add received_date to PurchaseRecord
  insumos?: Insumo; // NEW: Add insumos relationship
}

// NEW: Interface for the form values when creating/updating a PurchaseRecord
export interface PurchaseRecordFormValues {
  insumo_id: string;
  purchase_date: string;
  quantity_purchased: number;
  quantity_received?: number; // NEW: Optional for form, will be managed by system/partial reception dialog
  unit_cost_at_purchase: number;
  total_amount: number;
  supplier_name_at_purchase: string | null;
  supplier_phone_at_purchase: string | null;
  supplier_address_at_purchase: string | null;
  from_registered_supplier: boolean;
  notes: string | null;
  status?: 'ordered' | 'received_by_company' | 'received_by_warehouse' | 'cancelled'; // NEW: Add status to form values
  received_date?: string | null; // NEW: Add received_date to form values
}

// NEW: Interface for suggested insumos in PurchaseAnalysis
export interface InsumoNeeded extends Insumo {
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

// NEW: Interface for UrgentPurchaseRequest
export interface UrgentPurchaseRequest {
  id: string;
  insumo_id: string;
  quantity_requested: number;
  request_date: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  requested_by_user_id: string;
  notes: string | null;
  source_module: string;
  fulfilled_purchase_record_id: string | null; // NEW: Link to the purchase record that fulfilled this request
  created_at: string;
  insistence_count: number; // NEW: Add insistence_count
  rejection_reason: string | null; // NEW: Add rejection_reason
  insumos?: Insumo; // Optional: to fetch related insumo data
}

// NEW: Interface for UrgentPurchaseRequest form values
export interface UrgentPurchaseRequestFormValues {
  insumo_id: string;
  quantity_requested: number;
  notes: string | null;
  source_module?: string; // Default to 'warehouse'
  priority?: 'urgent' | 'high' | 'medium' | 'low'; // Default to 'urgent'
  fulfilled_purchase_record_id?: string | null; // NEW: Allow updating this field
  insistence_count?: number; // NEW: Allow updating this field
  rejection_reason?: string | null; // NEW: Allow updating this field
}

// NEW: Interfaces for Quebrado Report
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
}

export interface QuebradoReportData {
  message: string;
  quebradoData: QuebradoDayDetail[];
  consolidatedInsumos: ConsolidatedInsumo[];
  downloadUrl?: string;
}

// NEW: Interface for Supplier
export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

// NEW: Interface for Supplier form values
export interface SupplierFormValues {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
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
  "PLATO DE FONDO DIETA BLANDA", // Added for clarity
  "SANCOCHADO",
  "FRUTA",
  "ENSALADA",
  "OTROS" // General category for anything not listed
];

export const MENU_DISH_SERVICE_CATEGORIES = [ // NEW: Centralized and renamed
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