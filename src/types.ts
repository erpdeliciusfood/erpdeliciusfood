export interface Insumo {
  id: string;
  user_id: string;
  nombre: string;
  unidad_medida: string;
  costo_unitario: number;
  stock_quantity: number;
  supplier_name: string | null;
  supplier_phone: string | null;
  last_price_update: string | null;
  created_at: string;
}

export interface InsumoFormValues {
  nombre: string;
  unidad_medida: string;
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
  precio_venta: number;
  created_at: string;
  plato_insumos?: PlatoInsumo[];
}

export interface PlatoFormValues {
  nombre: string;
  descripcion: string | null;
  precio_venta: number;
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
  report_date: string; // Date string (e.g., 'YYYY-MM-DD')
  meal_service_id: string;
  tickets_issued: number;
  meals_sold: number;
  additional_services_revenue: number;
  notes: string | null;
  created_at: string;
  meal_services?: MealService; // Optional, for when fetching with relations
  platos_vendidos_data?: ServiceReportPlato[]; // New: For fetching with relations
}

export interface ServiceReportFormValues {
  report_date: string;
  meal_service_id: string;
  tickets_issued: number;
  meals_sold: number;
  additional_services_revenue: number;
  notes: string | null;
  platos_vendidos: { plato_id: string; quantity_sold: number }[]; // New: Array of sold dishes
}

export interface ServiceReportPlato { // New interface
  id: string;
  service_report_id: string;
  plato_id: string;
  quantity_sold: number;
  created_at: string;
  platos?: Plato; // Optional, for when fetching with relations
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
  role: 'user' | 'admin'; // Added role property
}