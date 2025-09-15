import { createClient } from "@/integrations/supabase/client";
import { StockMovementFormValues } from "@/types";

const supabase = createClient();

export async function createStockMovement(data: StockMovementFormValues) {
  const { insumo_id, movement_type, quantity_change, notes, menu_id } = data;

  // Insert into stock_movements table
  const { data: stockMovement, error: stockMovementError } = await supabase
    .from('stock_movements')
    .insert({
      user_id: data.user_id,
      insumo_id,
      movement_type,
      quantity_change,
      notes,
      menu_id,
      // new_stock_quantity will be calculated by the trigger/function
    })
    .select()
    .single();

  if (stockMovementError) {
    console.error("Error creating stock movement:", stockMovementError);
    return { data: null, error: stockMovementError };
  }

  // Call the RPC function to update insumo quantities
  const { error: rpcError } = await supabase.rpc('update_insumo_quantities', { // Removed updatedInsumo
    insumo_id_param: insumo_id,
    stock_change: quantity_change, // quantity_change is already negative for deductions
  });

  if (rpcError) {
    console.error("Error updating insumo quantities via RPC:", rpcError);
    // Optionally, you might want to revert the stock movement if the RPC fails
    return { data: null, error: rpcError };
  }

  return { data: stockMovement, error: null };
}