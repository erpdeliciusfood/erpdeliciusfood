import { supabase } from "@/integrations/supabase/client";
import { AggregatedInsumoNeed } from "@/types";
import { createStockMovement } from "./stockMovements";

// Define interfaces to match the exact structure returned by the Supabase query
interface InsumoFromQuery {
  id: string;
  nombre: string;
  base_unit: string;
  purchase_unit: string;
  conversion_factor: number;
  stock_quantity: number;
}

interface PlatoInsumoFromQuery {
  cantidad_necesaria: number;
  insumos: InsumoFromQuery | null;
}

interface PlatoFromQuery {
  plato_insumos: PlatoInsumoFromQuery[] | null; // Changed to array to match Supabase's return structure
}

interface MenuPlatoFromQuery {
  quantity_needed: number;
  platos: PlatoFromQuery[] | null; // Changed to array to match Supabase's return structure
}

interface MenuFromQuery {
  id: string;
  menu_date: string;
  menu_platos: MenuPlatoFromQuery[] | null;
}

export const getAggregatedInsumoNeedsForDate = async (date: string): Promise<AggregatedInsumoNeed[]> => {
  // Fetch all menus for the given date
  const { data: menus, error: menusError } = await supabase
    .from("menus")
    .select(`
      id,
      menu_date,
      menu_platos (
        quantity_needed,
        platos (
          plato_insumos (
            cantidad_necesaria,
            insumos (
              id,
              nombre,
              base_unit,
              purchase_unit,
              conversion_factor,
              stock_quantity
            )
          )
        )
      )
    `)
    .eq("menu_date", date);

  if (menusError) throw new Error(`Error fetching menus for date: ${menusError.message}`);
  if (!menus || menus.length === 0) return [];

  const aggregatedNeedsMap = new Map<string, AggregatedInsumoNeed>();

  (menus as MenuFromQuery[]).forEach(menu => {
    menu.menu_platos?.forEach(menuPlato => {
      // Iterate over the 'platos' array within each 'menuPlato'
      menuPlato.platos?.forEach(plato => {
        if (plato) {
          plato.plato_insumos?.forEach(platoInsumo => {
            const insumo = platoInsumo.insumos;
            if (insumo) {
              const neededInBaseUnit = platoInsumo.cantidad_necesaria * menuPlato.quantity_needed;

              const currentAggregated = aggregatedNeedsMap.get(insumo.id) || {
                insumo_id: insumo.id,
                insumo_nombre: insumo.nombre,
                base_unit: insumo.base_unit,
                purchase_unit: insumo.purchase_unit,
                conversion_factor: insumo.conversion_factor,
                current_stock_quantity: insumo.stock_quantity,
                total_needed_base_unit: 0,
                total_needed_purchase_unit: 0,
              };

              currentAggregated.total_needed_base_unit += neededInBaseUnit;
              aggregatedNeedsMap.set(insumo.id, currentAggregated);
            }
          });
        }
      });
    });
  });

  // Convert total_needed_base_unit to total_needed_purchase_unit and round up
  const result = Array.from(aggregatedNeedsMap.values()).map(item => {
    const totalNeededPurchaseUnitRaw = item.total_needed_base_unit / item.conversion_factor;
    // Round up to the nearest whole number if there's any decimal, otherwise keep as is.
    // This ensures we always deduct enough, even if it means deducting a bit more than exact.
    const totalNeededPurchaseUnitRounded = totalNeededPurchaseUnitRaw > 0 && totalNeededPurchaseUnitRaw % 1 !== 0
      ? Math.ceil(totalNeededPurchaseUnitRaw)
      : parseFloat(totalNeededPurchaseUnitRaw.toFixed(2)); // Keep 2 decimals if already whole or 0

    return {
      ...item,
      total_needed_purchase_unit: totalNeededPurchaseUnitRounded,
    };
  });

  return result;
};

export const deductDailyPrepStock = async (
  menuId: string,
  insumoNeeds: { insumo_id: string; quantity_to_deduct: number; current_stock_quantity: number }[]
): Promise<void> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  for (const need of insumoNeeds) {
    if (need.quantity_to_deduct > 0) {
      // Create a stock movement for each deduction
      await createStockMovement({
        insumo_id: need.insumo_id,
        movement_type: 'daily_prep_out',
        quantity_change: need.quantity_to_deduct, // This is the quantity to deduct
        notes: `Deducción para preparación de menú diario (Menú ID: ${menuId})`,
        menu_id: menuId, // Link to the menu
      });
    }
  }
};