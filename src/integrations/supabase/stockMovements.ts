import { supabase } from "@/integrations/supabase/client";
import { StockMovementRecord, Insumo } from "@/types"; // Removed ConsumptionRecord
import { format, parseISO } from "date-fns";

export const getStockMovements = async (startDate: string, endDate: string): Promise<StockMovementRecord[]> => {
  // Fetch all insumos to get their initial stock and purchase units
  const { data: insumosData, error: insumosError } = await supabase
    .from("insumos")
    .select("id, nombre, stock_quantity, purchase_unit, created_at");

  if (insumosError) throw new Error(`Error fetching insumos: ${insumosError.message}`);

  // insumosMap was declared but its value was never read. Removed.
  // const insumosMap = new Map<string, Insumo>(insumosData.map(insumo => [insumo.id, insumo as Insumo]));

  // Fetch consumption records within the date range
  const { data: consumptionRecords, error: consumptionError } = await supabase
    .from("consumption_records")
    .select("id, insumo_id, quantity_consumed, consumed_at, service_report_id")
    .gte("consumed_at", startDate)
    .lte("consumed_at", endDate)
    .order("consumed_at", { ascending: true });

  if (consumptionError) throw new Error(`Error fetching consumption records: ${consumptionError.message}`);

  const movements: StockMovementRecord[] = [];

  // For each insumo, determine its stock at the start_date and then apply movements
  insumosData.forEach(insumo => {
    const insumoId = insumo.id;
    const insumoNombre = insumo.nombre;
    const purchaseUnit = insumo.purchase_unit;

    let effectiveInitialStock = insumo.stock_quantity; // Current stock
    // insumoCreatedAt was declared but its value was never read. Removed.
    // const insumoCreatedAt = parseISO(insumo.created_at);
    const periodStartDate = parseISO(startDate);

    // Reverse-apply consumption records that happened *before* periodStartDate
    // but *after* insumo creation to get the stock at periodStartDate.
    const consumptionBeforePeriod = consumptionRecords.filter(
      cr => cr.insumo_id === insumoId && parseISO(cr.consumed_at) < periodStartDate
    );

    consumptionBeforePeriod.forEach(cr => {
      effectiveInitialStock += cr.quantity_consumed; // Add back consumed quantity
    });

    // Add initial stock record if it's relevant (i.e., not zero)
    if (effectiveInitialStock !== 0) {
      movements.push({
        id: `initial-${insumoId}-${startDate}`,
        insumo_id: insumoId,
        insumo_nombre: insumoNombre,
        purchase_unit: purchaseUnit,
        date: startDate,
        type: 'initial',
        quantity: effectiveInitialStock,
        current_stock_after_movement: effectiveInitialStock, // This is the stock at the start of the day
      });
    }

    // Apply consumption records within the period
    let currentStockForInsumo = effectiveInitialStock; // Start with the calculated initial stock

    consumptionRecords
      .filter(cr => cr.insumo_id === insumoId && parseISO(cr.consumed_at) >= periodStartDate)
      .sort((a, b) => parseISO(a.consumed_at).getTime() - parseISO(b.consumed_at).getTime())
      .forEach(cr => {
        currentStockForInsumo -= cr.quantity_consumed;
        movements.push({
          id: cr.id,
          insumo_id: insumoId,
          insumo_nombre: insumoNombre,
          purchase_unit: purchaseUnit,
          date: format(parseISO(cr.consumed_at), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), // Keep full timestamp for sorting
          type: 'out',
          quantity: cr.quantity_consumed,
          source_id: cr.service_report_id,
          current_stock_after_movement: currentStockForInsumo,
        });
      });
  });

  // Sort all movements by date, then by type (initial, in, out)
  movements.sort((a, b) => {
    const dateA = parseISO(a.date).getTime();
    const dateB = parseISO(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;

    // Secondary sort by type: initial, in, out
    const typeOrder = { 'initial': 0, 'in': 1, 'out': 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });

  return movements;
};