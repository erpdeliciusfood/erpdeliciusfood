export interface Insumo {
  id: string;
  user_id: string;
  nombre: string;
  unidad_medida: string;
  costo_unitario: number;
  created_at: string;
}

export interface InsumoFormValues {
  nombre: string;
  unidad_medida: string;
  costo_unitario: number;
}

export interface Plato {
  id: string;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  precio_venta: number;
  created_at: string;
  plato_insumos?: PlatoInsumo[]; // Optional, for when fetching with relations
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
  insumos?: Insumo; // Optional, for when fetching with relations
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  order_items?: OrderItem[]; // Optional, for when fetching with relations
}

export interface OrderFormValues {
  customer_name: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  items: { plato_id: string; quantity: number; price_at_order: number }[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  plato_id: string;
  quantity: number;
  price_at_order: number;
  created_at: string;
  platos?: Plato; // Optional, for when fetching with relations
}