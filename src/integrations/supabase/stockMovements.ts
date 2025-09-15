import { supabase } from "@/integrations/supabase/client";
import { StockMovement, StockMovementFormValues } from "@/types";
import { PostgrestError } from "@supabase/supabase-js"; // Import PostgrestError

// Define a local type for the menu data fetched in this specific context
type MenuDetailsForStockMovement = {
  title: string;
  menu_date: string | null;
  event_types: { name: string } | null; // event_types is an object or null, not an array
};

export const getStockMovements = async (): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, insumos(id, nombre, purchase_unit, base_unit, conversion_factor)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createStockMovement = async (
  movementData: StockMovementFormValues // Removed userId from here
): Promise<StockMovement> => {
  const { insumo_id, movement_type, quantity_change, notes, menu_id, user_id } = movementData; // Destructure user_id

  let pendingDeliveryChange = 0;
  let pendingReceptionChange = 0;
  let stockChange = 0;

  if (movement_type === "purchase_in") {
    stockChange = quantity_change;
  } else if (movement_type === "reception_in") {
    pendingReceptionChange = quantity_change;
  } else if (movement_type === "adjustment_in") {
    stockChange = quantity_change;
  } else if (movement_type === "adjustment_out" || movement_type === "daily_prep_out") {
    stockChange = -quantity_change;
  }

  // Call the RPC function to update insumo quantities
  const { data: updatedInsumoArray, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
    insumo_id_param: insumo_id,
    pending_delivery_change: pendingDeliveryChange,
    pending_reception_change: pendingReceptionChange,
    stock_change: stockChange,
  });

  if (updateInsumoError) {
    console.error("RPC Error in update_insumo_quantities for insumo_id:", insumo_id, updateInsumoError);
    throw new Error(`Error updating insumo quantities via RPC: ${updateInsumoError.message}`);
  }
  if (!updatedInsumoArray || updatedInsumoArray.length === 0) {
    console.error("RPC returned no data for insumo_id:", insumo_id, "Data received:", updatedInsumoArray);
    throw new Error(`Failed to retrieve updated insumo data after RPC call for insumo_id: ${insumo_id}.`);
  }

  const updatedInsumo = updatedInsumoArray[0]; // The RPC returns an array, take the first element

  let finalNotes = notes;
  if (movement_type === 'daily_prep_out' && menu_id) {
    // Fetch menu details to include in notes for daily_prep_out
    const { data: menuData, error: menuError } = await supabase
      .from('menus')
      .select('title, menu_date, event_types(name)')
      .eq('id', menu_id)
      .single() as { data: MenuDetailsForStockMovement | null, error: PostgrestError | null }; // Cast the result to the local type

    if (menuError) {
      console.warn(`Could not fetch menu details for menu_id ${menu_id}: ${menuError.message}`);
    } else if (menuData) {
      const menuTitle = menuData.title;
      const menuDate = menuData.menu_date;
      // Access `name` directly from event_types object, which is now correctly typed
      const eventTypeName = menuData.event_types?.name;

      let menuIdentifier = '';
      if (menuDate) {
        menuIdentifier = `del ${new Date(menuDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
      } else if (eventTypeName) {
        menuIdentifier = `para el evento '${eventTypeName}'`;
      }

      finalNotes = `Salida por preparación diaria para el menú '${menuTitle}' ${menuIdentifier}. ${notes || ''}`;
    }
  }

  const { data: newMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      insumo_id,
      movement_type,
      quantity_change: parseFloat(quantity_change.toFixed(2)),
      new_stock_quantity: parseFloat(updatedInsumo.stock_quantity.toFixed(2)), // Use stock_quantity from RPC result
      notes: finalNotes,
      menu_id: menu_id || null,
      user_id: user_id, // Use user_id from movementData
    })
    .select("*, insumos(id, nombre, purchase_unit, base_unit, conversion_factor)")
    .single();

  if (movementError) throw new Error(movementError.message);
  if (!newMovement) throw new Error("Failed to create stock movement.");

  return newMovement;
};