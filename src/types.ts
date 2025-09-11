import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  updated_at?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  role: 'admin' | 'user';
  first_name?: string; // Added
  last_name?: string;  // Added
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
  proveedor_preferido_id?: string;
  proveedor_preferido?: Supplier;

  // Additional fields used in UI components, assuming they are either direct DB fields
  // or derived/joined fields that are part of the Insumo object for UI convenience.
  purchase_unit: string; // Often same as base_unit, but sometimes different for purchase
  conversion_factor: number;
  supplier_name?: string; // Derived from proveedor_preferido.name
  supplier_phone?: string; // Derived from proveedor_preferido.phone
  supplier_address?: string; // Derived from proveedor_preferido.address
  pending_reception_quantity: number;
  pending_delivery_quantity: number;
  last_physical_count_quantity?: number;
  last_physical_count_date?: string; // YYYY-MM-DD
  discrepancy_quantity?: number;
}

// Form values for Insumo
export interface InsumoFormValues {
  nombre: string;
  base_unit: string;
  costo_unitario: number;
  stock_quantity: number;
  min_stock_level: number;
  category: string;
  purchase_unit: string;
  conversion_factor: number;
  supplier_name?: string;
  supplier_phone?: string;
  supplier_address?: string;
  pending_reception_quantity?: number;
  pending_delivery_quantity?: number;
  last_physical_count_quantity?: number;
  last_physical_count_date?: string;
  discrepancy_quantity?: number;
}

export interface PlatoInsumo {
  id: string;
  receta_id: string; // Changed from plato_id
  insumo_id: string;
  cantidad_necesaria: number;
  insumo: Insumo; // Corrected from insumos
}

export interface Receta { // Renamed from Plato
  id: string;
  nombre: string;
  descripcion: string;
  category: string; // Standardized from categoria
  tiempo_preparacion: number;
  costo_total: number;
  plato_insumos: PlatoInsumo[];
}

// Form values for Receta
export interface RecetaFormValues {
  nombre: string;
  descripcion: string;
  category: string;
  tiempo_preparacion: number;
  costo_total: number;
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
}

export interface Menu {
  id: string;
  date: string; // Formato 'YYYY-MM-DD'
  meal_service_id: string;
  event_type_id?: string;
  meal_service: MealService;
  event_type?: EventType; // Corrected from event_types
  menu_platos: MenuPlato[];
  total_cost: number;
  total_servings: number;

  // Added based on errors
  title: string;
  description?: string;
}

// Form values for Menu
export interface MenuFormValues {
  title: string;
  description?: string;
  menu_type: 'daily' | 'event'; // 'daily' if menu_date is set, 'event' if event_type_id is set
  menu_date?: string | null; // YYYY-MM-DD
  event_type_id?: string | null;
  platos_por_servicio: {
    meal_service_id: string;
    receta_id: string;
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
  notes?: string;
  meal_service: MealService;
  service_report_platos: ServiceReportPlato[]; // Added
}

// Form values for ServiceReport
export interface ServiceReportFormValues {
  report_date: string;
  meal_service_id: string;
  total_servings: number;
  total_revenue: number;
  notes?: string;
  platos_vendidos: {
    receta_id: string;
    quantity_sold: number;
  }[];
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
  notes?: string;
  // supplier: Supplier; // Removed, assuming supplier_name_at_purchase is used
  // purchase_items: PurchaseItem[]; // Removed, assuming single-item purchase records
  received_date?: string; // YYYY-MM-DD
  stock_quantity_updated: boolean; // New field

  // Fields for single-item purchase records (as suggested by errors)
  insumo_id: string;
  insumo: Insumo; // Direct relation to Insumo
  quantity_purchased: number;
  quantity_received: number;
  unit_cost_at_purchase: number;
  supplier_name_at_purchase?: string;
  supplier_phone_at_purchase?: string;
  supplier_address_at_purchase?: string;
  from_registered_supplier: boolean;
}

// Form values for PurchaseRecord (assuming a single item purchase for the form)
export interface PurchaseRecordFormValues {
  insumo_id: string;
  purchase_date: string;
  quantity_purchased: number;
  quantity_received: number;
  unit_cost_at_purchase: number;
  total_amount: number;
  supplier_name_at_purchase?: string;
  supplier_phone_at_purchase?: string;
  supplier_address_at_purchase?: string;
  from_registered_supplier: boolean;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'ordered' | 'received_by_company' | 'received_by_warehouse';
  received_date?: string;
  stock_quantity_updated: boolean;
}

export interface StockMovement {
  id: string;
  insumo_id: string;
  movement_type: 'entry' | 'exit' | 'adjustment' | 'purchase_in' | 'consumption_out' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out' | 'reception_in'; // Updated
  quantity: number; // The quantity that changed
  movement_date: string; // YYYY-MM-DD
  notes?: string;
  insumo: Insumo; // Corrected from insumos
  user_id: string;
  user: User; // Relation to User (from Supabase)
  created_at: string; // Added, common Supabase field
  new_stock_quantity: number; // The stock after this movement
}

// Form values for StockMovement
export interface StockMovementFormValues {
  insumo_id: string;
  movement_type: 'entry' | 'exit' | 'adjustment' | 'purchase_in' | 'consumption_out' | 'adjustment_in' | 'adjustment_out' | 'daily_prep_out' | 'reception_in';
  quantity: number;
  movement_date: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  description?: string;
}

export interface UrgentPurchaseRequest {
  id: string;
  insumo_id: string;
  quantity_requested: number; // Standardized from quantity
  reason: string;
  request_date: string; // YYYY-MM-DD
  status: 'pending' | 'approved' | 'rejected' | 'purchased' | 'fulfilled'; // Updated
  notes?: string;
  insumo: Insumo; // Corrected from insumos
  requested_by_user_id: string;
  requested_by_user: User;
  approved_by_user_id?: string;
  approved_by_user?: User;

  // Added based on errors
  priority: 'high' | 'low' | 'urgent' | 'medium';
  insistence_count?: number;
  rejection_reason?: string;
  fulfilled_purchase_record_id?: string;
}

// Form values for UrgentPurchaseRequest
export interface UrgentPurchaseRequestFormValues {
  insumo_id: string;
  quantity_requested: number;
  reason: string;
  notes?: string | null;
  priority: 'high' | 'low' | 'urgent' | 'medium';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled'; // 'purchased' is an internal status, 'fulfilled' is for UI
  rejection_reason?: string | null;
  fulfilled_purchase_record_id?: string | null;
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
  supplier_id: string;
  supplier_name: string;
  change_date: string;
  notes?: string;
}

export interface InsumoPriceHistory {
  id: string;
  insumo_id: string;
  price: number;
  change_date: string;
  notes?: string;
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
  supplier_name?: string;
  supplier_phone?: string;
  supplier_address?: string;
  quantity_needed_for_period_raw: number;
  quantity_needed_for_period_rounded: number;
  quantity_needed_for_period_rounded_up: boolean;
  current_stock: number;
  purchase_suggestion_raw: number;
  purchase_suggestion_rounded: number;
  reasons: string[];
  estimated_purchase_cost: number;
}

export interface AggregatedInsumoNeed {
  insumoId: string;
  insumoNombre: string;
  baseUnit: string;
  currentStock: number;
  minStockLevel: number;
  quantityNeeded: number;
  status: 'ok' | 'low_stock' | 'critical_stock' | 'over_stock';
  purchaseUnit: string;
  conversionFactor: number;
  costoUnitario: number;
}