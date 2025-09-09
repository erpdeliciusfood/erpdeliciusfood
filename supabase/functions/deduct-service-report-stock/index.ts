import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service_report_id, user_id } = await req.json();

    if (!service_report_id || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing service_report_id or user_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: serviceReportPlatos, error: srpError } = await supabaseAdmin
      .from('service_report_platos')
      .select(`
        quantity_sold,
        platos (
          plato_insumos (
            cantidad_necesaria,
            insumos (
              id,
              nombre,
              base_unit,
              stock_quantity,
              conversion_factor
            )
          )
        )
      `)
      .eq('service_report_id', service_report_id);

    if (srpError) {
      console.error('Error fetching service report platos:', srpError);
      return new Response(JSON.stringify({ error: srpError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!serviceReportPlatos || serviceReportPlatos.length === 0) {
      return new Response(JSON.stringify({ message: 'No platos sold found for this service report.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const insumoStockUpdates = new Map<string, { new_stock: number, quantity_consumed_base_unit: number, quantity_deducted_purchase_unit: number, base_unit: string, current_stock_before_deduction: number }>();
    const consumptionRecords = [];

    for (const srp of serviceReportPlatos) {
      const platos = srp.platos;
      if (platos && platos.plato_insumos) {
        for (const pi of platos.plato_insumos) {
          const insumo = pi.insumos;
          if (insumo) {
            const quantityConsumedInBaseUnit = pi.cantidad_necesaria * srp.quantity_sold;
            const quantityDeductedInPurchaseUnit = quantityConsumedInBaseUnit / insumo.conversion_factor;

            const currentData = insumoStockUpdates.get(insumo.id) || {
              new_stock: insumo.stock_quantity, // Initial stock from DB in purchase_unit
              quantity_consumed_base_unit: 0,
              quantity_deducted_purchase_unit: 0,
              base_unit: insumo.base_unit,
              current_stock_before_deduction: insumo.stock_quantity, // Store initial stock for stock_movements
            };
            
            currentData.new_stock -= quantityDeductedInPurchaseUnit;
            currentData.quantity_consumed_base_unit += quantityConsumedInBaseUnit;
            currentData.quantity_deducted_purchase_unit += quantityDeductedInPurchaseUnit;
            
            insumoStockUpdates.set(insumo.id, currentData);
          }
        }
      }
    }

    const updates = [];
    const stockMovements = [];

    for (const [insumoId, data] of insumoStockUpdates.entries()) {
      const finalStock = parseFloat(data.new_stock.toFixed(2));
      updates.push({
        id: insumoId,
        stock_quantity: finalStock,
      });

      // Record in stock_movements
      stockMovements.push({
        user_id: user_id,
        insumo_id: insumoId,
        movement_type: 'consumption_out',
        quantity_change: -parseFloat(data.quantity_deducted_purchase_unit.toFixed(2)), // Negative for deduction
        new_stock_quantity: finalStock,
        source_document_id: service_report_id,
        notes: `Deducción por reporte de servicio ${service_report_id}`,
        created_at: new Date().toISOString(),
      });

      // Record in consumption_records (already existing logic, slightly adjusted for clarity)
      consumptionRecords.push({
        user_id: user_id,
        service_report_id: service_report_id,
        insumo_id: insumoId,
        quantity_consumed: parseFloat(data.quantity_consumed_base_unit.toFixed(2)),
        consumed_at: new Date().toISOString(),
      });
    }

    if (updates.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('insumos')
        .upsert(updates, { onConflict: 'id' });

      if (updateError) {
        console.error('Error updating insumo stock:', updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    if (stockMovements.length > 0) {
      const { error: stockMovementError } = await supabaseAdmin
        .from('stock_movements')
        .insert(stockMovements);

      if (stockMovementError) {
        console.error('Error inserting stock movements:', stockMovementError);
        return new Response(JSON.stringify({ error: stockMovementError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    if (consumptionRecords.length > 0) {
      const { error: consumptionError } = await supabaseAdmin
        .from('consumption_records')
        .insert(consumptionRecords);

      if (consumptionError) {
        console.error('Error inserting consumption records:', consumptionError);
        return new Response(JSON.stringify({ error: consumptionError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    return new Response(JSON.stringify({ message: 'Stock deducted and consumption recorded successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Error in deduct-service-report-stock function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});