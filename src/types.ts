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