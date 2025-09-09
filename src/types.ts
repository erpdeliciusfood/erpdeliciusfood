export interface Insumo {
  id: string;
  user_id: string;
  nombre: string;
  base_unit: string; // Renamed from unidad_medida
  purchase_unit: string; // New field
  conversion_factor: number; // New field
  costo_unitario: number;
  stock_quantity: number;
  supplier_name: string | null;
  supplier_phone: string | null;
  last_price_update: string | null;
  created_at: string;
}

export interface InsumoFormValues {
  nombre: string;
  base_unit: string; // Renamed from unidad_medida
  purchase_unit: string; // New field
  conversion_factor: number; // New field
  costo_unitario: number;
  stock_quantity: number;
  supplier_name: string | null;
  supplier_phone: string | null;
}

export interface Plato {
  id: string;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  precio_venta: number; // This will now be a calculated field
  costo_produccion: number; // New: Calculated production cost
  markup_percentage: number; // New: Percentage for profit margin (e.g., 0.3 for 30%)
  created_at: string;
  plato_insumos?: PlatoInsumo[];
}

export interface PlatoFormValues {
  nombre: string;
  descripcion: string | null;
  // precio_venta: number; // Removed: No longer directly input by user
  markup_percentage: number; // New: User inputs this percentage
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
  meal_service_id: string; // Link to the meal service
  tickets_issued: number;
  meals_sold: number; // Total meals sold, can be derived from platos_vendidos_data
  additional_services_revenue: number;
  notes: string | null;
  created_at: string;
  meal_services?: MealService; // Optional, for when fetching with relations
  platos_vendidos_data?: ServiceReportPlato[]; // New: details of platos sold
}

export interface ServiceReportPlato {
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
  // meals_sold: number; // Removed: This will be calculated dynamically
  additional_services_revenue: number;
  notes: string | null;
  platos_vendidos: { plato_id: string; quantity_sold: number }[]; // New: array of sold dishes
}

// New interface for Consumption Records
export interface ConsumptionRecord {
  id: string;
  user_id: string;
  service_report_id: string;
  insumo_id: string;
  quantity_consumed: number;
  consumed_at: string;
  insumos?: Insumo; // Optional, for when fetching with relations
  service_reports?: ServiceReport; // Optional, for when fetching with relations
}

// New interface for Stock Movement Report
export interface StockMovementRecord {
  id: string;
  insumo_id: string;
  insumo_nombre: string;
  purchase_unit: string;
  date: string; // Date of the movement
  type: 'initial' | 'in' | 'out'; // 'initial' for starting stock, 'in' for additions, 'out' for consumption
  quantity: number;
  source_id?: string; // e.g., service_report_id for 'out' movements
  current_stock_after_movement: number; // Stock after this specific movement
}

// Existing interfaces for Menu Management
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
  email?: string; // Added email field
}