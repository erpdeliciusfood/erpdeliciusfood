import { supabase } from "@/integrations/supabase/client";
import { StockMovement, StockMovementFormValues } from "@/types";
import { createStockMovement as createStockMovementInDb } from "./stockMovements"; // Import the stock movement function

// Helper to map DB fields to StockMovement interface fields
const mapDbStockMovementToStockMovement = (dbMovement: any): StockMovement => ({
  id: dbMovement.id,
  insumo_id: dbMovement.insumo_id,
  movement_type: dbMovement.movement_type,
  quantity: dbMovement.quantity_change, // This is the quantity that changed
  movement_date: dbMovement.movement_date,
  notes: dbMovement.notes,
  insumo: {
    id: dbMovement.insumos.id,
    nombre: dbMovement.insumos.nombre,
    base_unit: dbMovement.insumos.unidad_medida,
    costo_unitario: dbMovement.insumos.costo_unitario,
    stock_quantity: dbMovement.insumos.stock_actual,
    min_stock_level: dbMovement.insumos.stock_minimo,
    category: dbMovement.insumos.categoria,
    purchase_unit: dbMovement.insumos.unidad_medida,
    conversion_factor: dbMovement.insumos.conversion_factor || 1,
    pending_reception_quantity: dbMovement.insumos.pending_reception_quantity || 0,
    pending_delivery_quantity: dbMovement.insumos.pending_delivery_quantity || 0,
  },
  user_id: dbMovement.user_id,
  user: dbMovement.users,
  created_at: dbMovement.created_at,
  new_stock_quantity: dbMovement.new_stock_quantity,
});

export const getStockMovements = async (): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from("stock_movements")
    .select(`
      *,
      insumos (id, nombre, unidad_medida, costo_unitario, stock_actual, stock_minimo, categoria, conversion_factor, pending_reception_quantity, pending_delivery_quantity),
      users (id, email)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapDbStockMovementToStockMovement);
};

export const createStockMovement = async (movementData: StockMovementFormValues, userId: string): Promise<StockMovement> => {
  const { insumo_id, movement_type, quantity, notes, movement_date, menu_id } = movementData; // Corrected to use 'quantity' from form

  const { data: newMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      insumo_id,
      movement_type,
      quantity_change: quantity, // Use 'quantity' from form
      movement_date,
      notes,
      user_id: userId,
      menu_id: menu_id,
    })
    .select(`
      *,
      insumos (id, nombre, unidad_medida, costo_unitario, stock_actual, stock_minimo, categoria, conversion_factor, pending_reception_quantity, pending_delivery_quantity),
      users (id, email)
    `)
    .single();
  if (movementError) throw movementError;

  return mapDbStockMovementToStockMovement(newMovement);
};