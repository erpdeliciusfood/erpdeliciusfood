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