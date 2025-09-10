export interface Insumo {
  id: string;
  user_id: string;
  nombre: string;
  base_unit: string;
  costo_unitario: number;
  stock_quantity: number;
  supplier_name: string | null;
  supplier_phone: string | null;
  supplier_address: string | null;
  last_price_update: string | null;
  purchase_unit: string;
  conversion_factor: number;
  min_stock_level: number;
  category: string;
  created_at: string;
}

export interface InsumoFormValues {
  nombre: string;
  base_unit: string;
  costo_unitario: number;
  stock_quantity: number;
  purchase_unit: string;
  conversion_factor: number;
  min_stock_level: number;
  category: string;
  supplier_name?: string | null; // Made optional to allow undefined
  supplier_phone?: string | null; // Made optional to allow undefined
  supplier_address?: string | null; // Made optional to allow undefined
}

export interface Receta {
  id: string;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  costo_produccion: number;
  created_at: string;
  plato_insumos?: PlatoInsumo[];
}

export interface RecetaFormValues {
  nombre: string;
  descripcion: string | null;
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

export interface ServiceReport {
  id: string;
  user_id: string;
  report_date: string;
  meal_service_id: string;
  tickets_issued: number;
  meals_sold: number;
  additional_services_revenue: number;
  notes: string | null;
  created_at: string;
  meal_services?: MealService;
  service_report_platos?: ServiceReportPlato[];
}

export interface ServiceReportPlato {
  id: string;
  service_report_id: string;
  plato_id: string;
  quantity_sold: number;
  created_at: string;
  platos?: Receta; // Reference to Receta
}

export interface ServiceReportFormValues {
  report_date: string;
  meal_service_id: string;
  tickets_issued: number;
  meals_sold: number;
  additional_services_revenue: number;
  notes: string | null;
  platos_vendidos: { plato_id: string; quantity_sold: number }[];
}

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
  menu_date: string | null;
  event_type_id: string | null;
  description: string | null;
  created_at: string;
  event_types?: EventType;
  menu_platos?: MenuPlato[];
}

export interface MenuPlato {
  id: string;
  menu_id: string;
  plato_id: string;
  meal_service_id: string;
  dish_category: string;
  quantity_needed: number;
  created_at: string;
  platos?: Receta; // Reference to Receta
  meal_services?: MealService;
}

export interface MenuFormValues {
  title: string;
  menu_date: string | null;
  event_type_id: string | null;
  description: string | null;
  platos_por_servicio: {
    meal_service_id: string;
    plato_id: string;
    dish_category: string;
    quantity_needed: number;
  }[];
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  role: 'user' | 'admin';
}

// NEW: Interface for aggregated insumo needs in Warehouse module
export interface AggregatedInsumoNeed {
  insumo_id: string;
  insumo_nombre: string;
  base_unit: string;
  purchase_unit: string;
  conversion_factor: number;
  current_stock_quantity: number;
  total_needed_base_unit: number;
  total_needed_purchase_unit: number;
}

export interface StockMovement {
  id: string;
  user_id: string;
  insumo_id: string;
  movement_type: 'purchase_in' | 'consumption_out' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out'; // NEW: Added daily_prep_out
  quantity_change: number;
  new_stock_quantity: number;
  source_document_id: string | null;
  menu_id?: string | null; // NEW: Added menu_id for daily_prep_out
  notes: string | null;
  created_at: string;
  insumos?: Insumo;
}

export interface StockMovementFormValues {
  insumo_id: string;
  movement_type: 'purchase_in' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out'; // NEW: Added daily_prep_out
  quantity_change?: number;
  total_purchase_amount?: number;
  total_purchase_quantity?: number;
  notes: string | null;
  menu_id?: string | null; // NEW: Added menu_id
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
  unit_cost_at_purchase: number;
  total_amount: number;
  supplier_name_at_purchase: string | null;
  supplier_phone_at_purchase: string | null;
  supplier_address_at_purchase: string | null;
  from_registered_supplier: boolean;
  notes: string | null;
  created_at: string;
  insumos?: Insumo;
}

export interface PurchaseRecordFormValues {
  insumo_id: string;
  purchase_date: string;
  quantity_purchased: number;
  unit_cost_at_purchase: number;
  total_amount: number;
  supplier_name_at_purchase: string | null;
  supplier_phone_at_purchase: string | null;
  supplier_address_at_purchase: string | null;
  from_registered_supplier: boolean;
  notes: string | null;
}