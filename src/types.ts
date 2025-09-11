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
  min_stock_level: number | null;
  category: string;
  created_at: string;
  pending_reception_quantity: number; // NEW: Stock comprado, pendiente de ingreso al almacén
  pending_delivery_quantity: number; // NEW: Stock en proceso de compra
  last_physical_count_quantity: number; // NEW: Último conteo físico
  last_physical_count_date: string | null; // NEW: Fecha del último conteo físico
  discrepancy_quantity: number; // NEW: Diferencia entre stock_quantity y last_physical_count_quantity
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
  supplier_name?: string | null;
  supplier_phone?: string | null;
  supplier_address?: string | null;
  pending_reception_quantity?: number; // NEW: Optional for form, managed by system
  pending_delivery_quantity?: number; // NEW: Optional for form, managed by system
  last_physical_count_quantity?: number; // NEW: Optional for form, managed by system
  last_physical_count_date?: string | null; // NEW: Optional for form, managed by system
  discrepancy_quantity?: number; // NEW: Optional for form, managed by system
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
  total_needed_base_unit: number; // Added this line
  total_needed_purchase_unit: number;
  missing_quantity: number; // NEW: Quantity missing if stock is insufficient
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
}