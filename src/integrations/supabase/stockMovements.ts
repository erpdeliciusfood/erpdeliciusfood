import { supabase } from "@/integrations/supabase/client";
import { StockMovement, StockMovementFormValues } from "@/types/index";
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
  movementData: StockMovementFormValues
): Promise<StockMovement> => {
  const { insumo_id, movement_type, quantity_change, notes, menu_id, user_id } = movementData;

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
  // Expect a single Insumo object or null, not an array
  const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
    insumo_id_param: insumo_id,
    pending_delivery_change: pendingDeliveryChange,
    pending_reception_change: pendingReceptionChange,
    stock_change: stockChange,
  });

  if (updateInsumoError) {
    throw new Error(`Error updating insumo quantities via RPC: ${updateInsumoError.message}`);
  }
  
  // Check if the RPC returned a valid insumo object
  if (!updatedInsumo) {
    throw new Error(`Failed to retrieve updated insumo data after RPC call for insumo_id: ${insumo_id}. The insumo might not exist or the update failed.`);
  }

  // updatedInsumo is already the single object, no need for [0]

  let finalNotes = notes;
  if (movement_type === 'daily_prep_out' && menu_id) {
    // Fetch menu details to include in notes for daily_prep_out
    const { data: menuData, error: menuError } = await supabase
      .from('menus')
      .select('title, menu_date, event_types(name)')
      .eq('id', menu_id)
      .single() as { data: MenuDetailsForStockMovement | null, error: PostgrestError | null };

    if (menuError) {
      console.warn(`Could not fetch menu details for menu_id ${menu_id}: ${menuError.message}`);
    } else if (menuData) {
      const menuTitle = menuData.title;
      const menuDate = menuData.menu_date;
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
      new_stock_quantity: parseFloat(updatedInsumo.stock_quantity.toFixed(2)),
      notes: finalNotes,
      menu_id: menu_id || null,
      user_id: user_id,
    })
    .select("*, insumos(id, nombre, purchase_unit, base_unit, conversion_factor)")
    .single();

  if (movementError) throw new Error(movementError.message);
  if (!newMovement) throw new Error("Failed to create stock movement.");

  return newMovement;
};

export const getDailyPrepDeductionsForDate = async (date: string, menuIds: string[]): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("id, insumo_id, menu_id, movement_type, quantity_change, created_at, new_stock_quantity, notes, source_document_id, user_id") // Select all fields for StockMovement
    .eq("movement_type", "daily_prep_out")
    .eq("created_at::date", date) // Filter by date part only
    .in("menu_id", menuIds);

  if (error) throw new Error(error.message);
  return data;
};