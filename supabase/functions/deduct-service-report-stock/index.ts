/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
/// <reference types="https://deno.land/std@0.190.0/http/server.d.ts" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0/dist/main/index.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => { // Added explicit type 'Request' for 'req'
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

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch service report platos with nested plato_insumos and insumos
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

    const insumoStockUpdates = new Map<string, { new_stock: number, quantity_consumed: number, base_unit: string }>();
    const consumptionRecords = [];

    for (const srp of serviceReportPlatos) {
      const platos = srp.platos;
      if (platos && platos.plato_insumos) {
        for (const pi of platos.plato_insumos) {
          const insumo = pi.insumos;
          if (insumo) {
            // Calculate total quantity consumed in base_unit for this insumo from this plato
            const quantityConsumedInBaseUnit = pi.cantidad_necesaria * srp.quantity_sold;

            // Update stock calculation
            const currentStockInfo = insumoStockUpdates.get(insumo.id) || {
              new_stock: insumo.stock_quantity,
              quantity_consumed: 0,
              base_unit: insumo.base_unit
            };
            
            // Convert current stock (in purchase_unit) to base_unit for accurate deduction
            const currentStockInBaseUnit = currentStockInfo.new_stock * insumo.conversion_factor;
            const updatedStockInBaseUnit = currentStockInBaseUnit - quantityConsumedInBaseUnit;
            
            // Convert back to purchase_unit for storage
            currentStockInfo.new_stock = updatedStockInBaseUnit / insumo.conversion_factor;
            currentStockInfo.quantity_consumed += quantityConsumedInBaseUnit;
            
            insumoStockUpdates.set(insumo.id, currentStockInfo);
          }
        }
      }
    }

    const updates = [];
    for (const [insumoId, data] of insumoStockUpdates.entries()) {
      updates.push({
        id: insumoId,
        stock_quantity: parseFloat(data.new_stock.toFixed(2)), // Round to 2 decimal places
      });

      consumptionRecords.push({
        user_id: user_id,
        service_report_id: service_report_id,
        insumo_id: insumoId,
        quantity_consumed: parseFloat(data.quantity_consumed.toFixed(2)), // Round to 2 decimal places
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

  } catch (error: unknown) { // Asserted 'error' as 'unknown' and then handled
    console.error('Error in deduct-service-report-stock function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});