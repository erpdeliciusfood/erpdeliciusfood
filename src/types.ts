export interface Insumo {
  id: string;
  user_id: string;
  nombre: string;
  base_unit: string;
  costo_unitario: number;
  stock_quantity: number;
  supplier_name: string | null;
  supplier_phone: string | null;
  supplier_address: string | null; // NEW: Added supplier_address
  last_price_update: string | null;
  purchase_unit: string;
  conversion_factor: number;
  min_stock_level: number;
  category: string; // Added
  created_at: string;
}

export interface InsumoFormValues {
  nombre: string;
  base_unit: string;
  costo_unitario: number;
  stock_quantity: number;
  supplier_name: string | null;
  supplier_phone: string | null;
  supplier_address: string | null; // NEW: Added supplier_address
  purchase_unit: string;
  conversion_factor: number;
  min_stock_level: number;
  category: string; // Added
}

export interface Plato {
  id: string;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  // precio_venta: number; // REMOVED
  costo_produccion: number;
  // markup_percentage: number; // REMOVED
  created_at: string;
  plato_insumos?: PlatoInsumo[];
}

export interface PlatoFormValues {
  nombre: string;
  descripcion: string | null;
  // precio_venta: number; // REMOVED
  insumos: { insumo_id: string; cantidad_necesaria: number }[];
}

export interface PlatoInsumo {
  id: string;
  plato_id: string;
  insumo_id: string;
  cantidad_necesaria: number;
  created_at: string;
  insumos?: Insumo;
}

// New interfaces for Service Reports
export interface ServiceReport {
  id: string;
  user_id: string;
  report_date: string; // Date string (e.g., 'YYYY-MM-DD')
  meal_service_id: string;
  tickets_issued: number;
  meals_sold: number;
  additional_services_revenue: number;
  notes: string | null;
  created_at: string;
  meal_services?: MealService; // Optional, for when fetching with relations
  service_report_platos?: ServiceReportPlato[]; // New: Optional, for when fetching with relations
}

export interface ServiceReportPlato { // New interface
  id: string;
  service_report_id: string;
  plato_id: string;
  quantity_sold: number;
  created_at: string;
  platos?: Plato; // Optional, for when fetching with relations
}

export interface ServiceReportFormValues {
  report_date: string;
  meal_service_id: string;
  tickets_issued: number;
  meals_sold: number;
  additional_services_revenue: number;
  notes: string | null;
  platos_vendidos: { plato_id: string; quantity_sold: number }[]; // New: For form submission
}

// New interfaces for Menu Management
export interface MealService {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface EventType {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Menu {
  id: string;
  user_id: string;
  title: string;
  menu_date: string | null; // Date string (e.g., 'YYYY-MM-DD')
  event_type_id: string | null;
  description: string | null;
  created_at: string;
  event_types?: EventType; // Optional, for when fetching with relations
  menu_platos?: MenuPlato[]; // Optional, for when fetching with relations
}

export interface MenuPlato {
  id: string;
  menu_id: string;
  plato_id: string;
  meal_service_id: string;
  dish_category: string; // NEW: Replaced meal_type_id
  quantity_needed: number;
  created_at: string;
  platos?: Plato; // Optional, for when fetching with relations
  meal_services?: MealService; // Optional, for when fetching with relations
}

export interface MenuFormValues {
  title: string;
  menu_date: string | null;
  event_type_id: string | null;
  description: string | null;
  platos_por_servicio: {
    meal_service_id: string;
    plato_id: string;
    dish_category: string; // NEW: Replaced meal_type_id
    quantity_needed: number;
  }[];
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  role: 'user' | 'admin'; // Added role property
}

// New interfaces for Stock Movements
export interface StockMovement {
  id: string;
  user_id: string;
  insumo_id: string;
  movement_type: 'purchase_in' | 'consumption_out' | 'adjustment_in' | 'adjustment_out';
  quantity_change: number;
  new_stock_quantity: number;
  source_document_id: string | null;
  notes: string | null;
  created_at: string;
  insumos?: Insumo; // Optional, for when fetching with relations
}

export interface StockMovementFormValues {
  insumo_id: string;
  movement_type: 'purchase_in' | 'adjustment_in' | 'adjustment_out'; // Consumption_out is handled by Edge Function
  quantity_change: number; // This will be used for adjustments, or derived for purchase_in
  total_purchase_amount?: number; // New: Total amount of the purchase
  total_purchase_quantity?: number; // New: Total quantity purchased
  notes: string | null;
}

// New interfaces for Insumo History
export interface InsumoSupplierHistory {
  id: string;
  insumo_id: string;
  old_supplier_name: string | null;
  new_supplier_name: string | null;
  old_supplier_phone: string | null;
  new_supplier_phone: string | null;
  old_supplier_address: string | null; // NEW: Added old_supplier_address
  new_supplier_address: string | null; // NEW: Added new_supplier_address
  changed_at: string;
}

export interface InsumoPriceHistory {
  id: string;
  insumo_id: string;
  old_costo_unitario: number;
  new_costo_unitario: number;
  changed_at: string;
}