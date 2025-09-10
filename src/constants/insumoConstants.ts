export const INSUMO_CATEGORIES = [
  "Cereales y Legumbres",
  "Proteínas (Carnes, Aves, Pescados)",
  "Lácteos y Huevos",
  "Verduras y Hortalizas",
  "Frutas",
  "Grasas y Aceites",
  "Condimentos y Especias",
  "Panadería y Pastelería",
  "Bebidas",
  "Otros",
];

export const UNIDADES_BASE = [
  "g", "ml", "unidad", "cucharadita", "cucharada", "taza", "onza", "libra"
];

export const UNIDADES_COMPRA = [
  "kg", "litro", "unidad", "atado", "manojo", "caja", "paquete", "botella", "lata", "saco", "galón"
];

// Predefined common conversions (Purchase Unit to Base Unit)
export const PREDEFINED_CONVERSIONS: { [purchaseUnit: string]: { [baseUnit: string]: number } } = {
  "kg": { "g": 1000 },
  "litro": { "ml": 1000 },
  "unidad": { "unidad": 1 },
};