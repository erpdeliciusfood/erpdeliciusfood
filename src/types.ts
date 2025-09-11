import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  updated_at?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  role: 'admin' | 'user';
  first_name?: string | null; // Added
  last_name?: string | null;  // Added
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Insumo {
  id: string;
  nombre: string;
  base_unit: string; // Standardized from unidad_medida
  costo_unitario: number;
  stock_quantity: number; // Standardized from stock_actual
  min_stock_level: number; // Standardized from stock_minimo
  category: string; // Standardized from categoria
  proveedor_preferido_id?: string | null; // Now a foreign key
  proveedor_preferido?: Supplier | null; // Joined supplier object

  // Additional fields used in UI components, assuming they are either direct DB fields
  // or derived/joined fields that are part of the Insumo object for UI convenience.
  purchase_unit: string; // Often same as base_unit, but sometimes different for purchase
  conversion_factor: number;
  // supplier_name, supplier_phone, supplier_address are now derived from proveedor_preferido
  pending_reception_quantity: number;
  pending_delivery_quantity: number;
  last_physical_count_quantity?: number | null;
  last_physical_count_date?: string | null; // YYYY-MM-DD
  discrepancy_quantity?: number | null;
}

// Form values for Insumo
export interface InsumoFormValues {
  id?: string; // Added for updates
  nombre: string;
  base_unit: string;
  costo_unitario: number;
  stock_quantity: number;
  min_stock_level: number;
  category: string;
  purchase_unit: string;
  conversion_factor: number;
  proveedor_preferido_id?: string | null; // Now a foreign key
  pending_reception_quantity?: number;
  pending_delivery_quantity?: number;
  last_physical_count_quantity?: number | null;
  last_physical_count_date?: string | null;
  discrepancy_quantity?: number | null;
}

export interface PlatoInsumo {
  id: string;
  plato_id: string; // Changed from receta_id to plato_id to match DB
  insumo_id: string;
  cantidad_necesaria: number;
  insumo: Insumo; // Corrected from insumos
}

export interface Receta { // Renamed from Plato
  id: string;
  user_id: string; // Added
  nombre: string;
  descripcion: string;
  category: string; // Standardized from categoria
  tiempo_preparacion: number; // This column will be added to DB
  costo_total: number; // This column will be renamed from costo_produccion in DB
  plato_insumos: PlatoInsumo[];
}

// Form values for Receta
export interface RecetaFormValues {
  id?: string; // Added for updates
  nombre: string;
  descripcion: string;
  category: string;
  // Removed tiempo_preparacion and costo_total as they are not directly from the form
  insumos: {
    insumo_id: string;
    cantidad_necesaria: number;
  }[];
}

export interface EventType {
  id: string;
  name: string;
  description?: string;
}

export interface MealService {
  id: string;
  name: string;
  description?: string;
  order_index: number; // Para ordenar los servicios de comida (ej. Desayuno, Almuerzo, Cena)
}

export interface MenuPlato {
  id: string;
  menu_id: string;
  meal_service_id: string; // Added, as per MenuFormValues structure
  receta_id: string; // Changed from plato_id
  dish_category: string; // Ej: "Entrada", "Plato de Fondo", "Postre"
  quantity_needed: number;
  receta: Receta; // Changed from plato
  meal_service?: MealService;
}

export interface Menu {
  id: string;
  user_id: string; // Added
  title: string;
  description?: string | null;
  date: string | null; // Formato 'YYYY-MM-DD', can be null for event menus (mapped from menu_date in DB)
  event_type_id?: string | null;
  event_type?: EventType | null; // Corrected from event_types
  menu_platos: MenuPlato[];
  created_at: string; // Added
  // Removed: meal_service_id: string;
  // Removed: meal_service: MealService;
  // Removed: total_cost: number;
  // Removed: total_servings: number;
}

// Form values for Menu
export interface MenuFormValues {
  id?: string; // Added for updates
  title: string;
  description?: string | null;
  menu_type: 'daily' | 'event'; // 'daily' if menu_date is set, 'event' if event_type_id is set
  menu_date?: string | null; // YYYY-MM-DD
  event_type_id?: string | null;
  platos_por_servicio: {
    meal_service_id: string;
    receta_id: string; // Changed from plato_id
    dish_category: string;
    quantity_needed: number;
  }[];
}

export interface ServiceReportPlato { // Added
  id: string;
  service_report_id: string;
  receta_id: string; // Changed from plato_id
  quantity_sold: number;
  receta: Receta; // Changed from plato
}

export interface ServiceReport {
  id: string;
  report_date: string; // YYYY-MM-DD
  meal_service_id: string;
  total_servings: number;
  total_revenue: number;
  notes?: string | null;
  meal_service: MealService;
  service_report_platos: ServiceReportPlato[]; // Added

  // Added based on errors
  tickets_issued?: number;
  meals_sold?: number;
  additional_services_revenue?: number;
}

// Form values for ServiceReport
export interface ServiceReportFormValues {
  id?: string; // Added for updates
  report_date: string;
  meal_service_id: string;
  notes?: string | null;
  platos_vendidos: {
    receta_id: string; // Changed from plato_id
    quantity_sold: number;
  }[];
  tickets_issued: number; // Added
  meals_sold: number; // Added
  additional_services_revenue: number; // Added
}

// PurchaseItem is now likely unused or for a different context if PurchaseRecord is single-item.
// Keeping it defined for completeness, but it's not part of PurchaseRecord anymore.
export interface PurchaseItem {
  id: string;
  purchase_record_id: string;
  insumo_id: string;
  quantity: number;
  unit_price: number;
  insumo: Insumo; // Relation to Insumo
}

export interface PurchaseRecord {
  id: string;
  // supplier_id: string; // Removed, assuming supplier_name_at_purchase is used
  purchase_date: string; // YYYY-MM-DD
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'ordered' | 'received_by_company' | 'received_by_warehouse'; // Updated
  notes?: string | null;
  // supplier: Supplier; // Removed, assuming supplier_name_at_purchase is used
  // purchase_items: PurchaseItem[]; // Removed, assuming single-item purchase records
  received_date?: string | null; // YYYY-MM-DD
  stock_quantity_updated: boolean; // New field

  // Fields for single-item purchase records (as suggested by errors)
  insumo_id: string;
  insumo: Insumo; // Direct relation to Insumo (corrected from insumos)
  quantity_purchased: number;
  quantity_received: number;
  unit_cost_at_purchase: number;
  supplier_name_at_purchase?: string | null;
  supplier_phone_at_purchase?: string | null;
  supplier_address_at_purchase?: string | null;
  from_registered_supplier: boolean;
}

// Form values for PurchaseRecord (assuming a single item purchase for the form)
export interface PurchaseRecordFormValues {
  id?: string; // Added for updates
  insumo_id: string;
  purchase_date: string;
  quantity_purchased: number;
  quantity_received: number;
  unit_cost_at_purchase: number;
  total_amount: number;
  supplier_name_at_purchase?: string | null;
  supplier_phone_at_purchase?: string | null;
  supplier_address_at_purchase?: string | null;
  from_registered_supplier: boolean;
  notes?: string | null;
  status: 'pending' | 'completed' | 'cancelled' | 'ordered' | 'received_by_company' | 'received_by_warehouse';
  received_date?: string | null;
}

export interface StockMovement {
  id: string;
  insumo_id: string;
  movement_type: 'entry' | 'exit' | 'adjustment' | 'purchase_in' | 'consumption_out' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out' | 'reception_in'; // Updated
  quantity: number; // The quantity that changed
  movement_date: string; // YYYY-MM-DD
  notes?: string | null;
  insumo: Insumo; // Corrected from insumos
  user_id: string;
  user: User; // Relation to User (from Supabase)
  created_at: string; // Added, common Supabase field
  new_stock_quantity: number; // The stock after this movement
}

// Form values for StockMovement
export interface StockMovementFormValues {
  id?: string; // Added for updates
  insumo_id: string;
  movement_type: 'entry' | 'exit' | 'adjustment' | 'purchase_in' | 'consumption_out' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out' | 'reception_in';
  quantity: number;
  movement_date: string;
  notes?: string | null;
  // Added based on errors, assuming these are temporary form fields for specific movement types
  quantity_change?: number;
  total_purchase_amount?: number;
  total_purchase_quantity?: number;
  menu_id?: string;
}

export interface UrgentPurchaseRequest {
  id: string;
  insumo_id: string;
  quantity_requested: number; // Standardized from quantity
  reason: string;
  request_date: string; // YYYY-MM-DD
  status: 'pending' | 'approved' | 'rejected' | 'purchased' | 'fulfilled'; // Updated
  notes?: string | null;
  insumo: Insumo; // Corrected from insumos
  requested_by_user_id: string;
  requested_by_user: User;
  approved_by_user_id?: string | null;
  approved_by_user?: User | null;

  // Added based on errors
  priority: 'high' | 'low' | 'urgent' | 'medium';
  insistence_count?: number | null;
  rejection_reason?: string | null;
  fulfilled_purchase_record_id?: string | null;
}

// Form values for UrgentPurchaseRequest
export interface UrgentPurchaseRequestFormValues {
  id?: string; // Added for updates
  insumo_id: string;
  quantity_requested: number;
  reason: string;
  notes?: string | null;
  priority: 'high' | 'low' | 'urgent' | 'medium';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'purchased'; // 'purchased' is an internal status, 'fulfilled' is for UI
  rejection_reason?: string | null;
  source_module?: string; // Added
}

// NEW INTERFACES FOR MENU BREAKDOWN (updated platoId/platoNombre to recetaId/recetaNombre)
export interface DishDetail {
  recetaId: string; // Changed from platoId
  recetaNombre: string; // Changed from platoNombre
  quantityNeeded: number;
}

export interface DishCategoryBreakdown {
  categoryName: string;
  dishes: DishDetail[];
}

export interface MealServiceBreakdown {
  serviceId: string;
  serviceName: string;
  serviceOrderIndex: number;
  categories: DishCategoryBreakdown[];
}

export interface DailyMenuBreakdown {
  date: string; // "YYYY-MM-DD"
  mealServicesBreakdown: MealServiceBreakdown[];
}

// Other types that were missing
export interface InsumoSupplierHistory {
  id: string;
  insumo_id: string;
  supplier_id: string; // This field might become redundant if we only track changes to proveedor_preferido_id
  supplier_name: string;
  change_date: string; // Corrected from changed_at
  notes?: string;
  old_supplier_name?: string | null; // Added
  new_supplier_name?: string | null; // Added
  old_supplier_address?: string | null; // Added
  new_supplier_address?: string | null; // Added
}

export interface InsumoPriceHistory {
  id: string;
  insumo_id: string;
  price: number;
  change_date: string; // Corrected from changed_at
  notes?: string;
  old_costo_unitario?: number; // Added
  new_costo_unitario?: number; // Added
}

export interface InsumoNeeded {
  id: string;
  nombre: string;
  base_unit: string;
  costo_unitario: number;
  stock_quantity: number;
  min_stock_level: number;
  category: string;
  purchase_unit: string;
  conversion_factor: number;
  proveedor_preferido?: Supplier | null; // ADDED
  quantity_needed_for_period_raw: number;
  quantity_needed_for_period_rounded: number;
  quantity_needed_for_period_rounded_up: boolean; // Added
  current_stock: number;
  purchase_suggestion_raw: number;
  purchase_suggestion_rounded: number;
  purchase_suggestion_rounded_up: boolean; // Added
  reasons: string[];
  reason_for_purchase_suggestion: 'menu_demand' | 'min_stock_level' | 'both' | 'zero_stock_alert'; // Changed to required
  estimated_purchase_cost: number;
  pending_reception_quantity: number; // Changed to required
  pending_delivery_quantity: number; // Changed to required
}

export interface AggregatedInsumoNeed {
  insumoId: string; // Standardized
  insumoNombre: string; // Standardized
  baseUnit: string; // Standardized
  currentStock: number; // Standardized
  minStockLevel: number; // Standardized
  quantityNeeded: number; // Standardized
  status: 'ok' | 'low_stock' | 'critical_stock' | 'over_stock';
  purchaseUnit: string; // Standardized
  conversionFactor: number;
  costoUnitario: number;
  totalNeededBaseUnit: number; // Standardized
  totalNeededPurchaseUnit: number; // Standardized
  missingQuantity: number; // Standardized
}