/// <reference lib="deno.ns" />
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeductStockPayload {
  service_report_id: string;
  user_id: string;
}

// @ts-ignore
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service_report_id, user_id } = await req.json() as DeductStockPayload;

    if (!service_report_id || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing service_report_id or user_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Supabase environment variables missing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Create a Supabase client with the service role key to bypass RLS for stock updates
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 1. Revert any previous stock deductions for this report (important for updates)
    const { data: previousConsumptionRecords, error: prevConsumptionError } = await supabaseAdmin
      .from('consumption_records')
      .select('insumo_id, quantity_consumed, insumos(stock_quantity)')
      .eq('service_report_id', service_report_id);

    if (prevConsumptionError) {
      console.error('Error fetching previous consumption records for reversal:', prevConsumptionError);
    } else if (previousConsumptionRecords && previousConsumptionRecords.length > 0) {
      const reversalUpdates = [];
      for (const record of previousConsumptionRecords) {
        const insumo = record.insumos;
        if (insumo) {
          reversalUpdates.push({
            id: insumo.id,
            stock_quantity: insumo.stock_quantity + record.quantity_consumed, // Add back to stock
          });
        }
      }
      if (reversalUpdates.length > 0) {
        const { error: reversalUpdateError } = await supabaseAdmin
          .from('insumos')
          .upsert(reversalUpdates, { onConflict: 'id' });
        if (reversalUpdateError) {
          console.error('Error reverting previous insumo stock:', reversalUpdateError);
        } else {
          console.log('Previous stock successfully reverted for service report:', service_report_id);
        }
      }
      // Delete previous consumption records
      const { error: deleteConsumptionError } = await supabaseAdmin
        .from('consumption_records')
        .delete()
        .eq('service_report_id', service_report_id);
      if (deleteConsumptionError) {
        console.error('Error deleting previous consumption records:', deleteConsumptionError);
      }
    }

    // 2. Fetch the platos sold for the current service report
    const { data: soldPlatos, error: soldPlatosError } = await supabaseAdmin
      .from('service_reports')
      .select(`
        quantity_sold,
        platos (
          plato_insumos (
            cantidad_necesaria,
            insumos (
              id,
              stock_quantity
            )
          )
        )
      `)
      .eq('service_report_id', service_report_id);

    if (soldPlatosError) {
      console.error('Error fetching sold platos for service report:', soldPlatosError);
      return new Response(JSON.stringify({ error: soldPlatosError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!soldPlatos || soldPlatos.length === 0) {
      return new Response(JSON.stringify({ message: 'No sold platos found for this service report, no stock deduction needed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const insumoUpdates: { [insumoId: string]: { id: string; stock_quantity: number } } = {};
    const consumptionRecordsToInsert = [];
    const now = new Date().toISOString(); // Get current timestamp for consumption records

    for (const soldPlato of soldPlatos) {
      const plato = soldPlato.platos;
      if (plato && plato.plato_insumos) {
        for (const platoInsumo of plato.plato_insumos) {
          const insumo = platoInsumo.insumos;
          if (insumo) {
            const totalConsumedQuantity = platoInsumo.cantidad_necesaria * soldPlato.quantity_sold;

            // Aggregate stock quantity updates
            if (!insumoUpdates[insumo.id]) {
              insumoUpdates[insumo.id] = { id: insumo.id, stock_quantity: insumo.stock_quantity };
            }
            insumoUpdates[insumo.id].stock_quantity -= totalConsumedQuantity;

            // Prepare consumption record
            consumptionRecordsToInsert.push({
              user_id: user_id,
              service_report_id: service_report_id,
              insumo_id: insumo.id,
              quantity_consumed: totalConsumedQuantity,
              consumed_at: now, // Add timestamp
            });
          }
        }
      }
    }

    const updatesArray = Object.values(insumoUpdates);

    if (updatesArray.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('insumos')
        .upsert(updatesArray, { onConflict: 'id' });

      if (updateError) {
        console.error('Error updating insumo stock:', updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    if (consumptionRecordsToInsert.length > 0) {
      const { error: consumptionError } = await supabaseAdmin
        .from('consumption_records')
        .insert(consumptionRecordsToInsert);

      if (consumptionError) {
        console.error('Error inserting consumption records:', consumptionError);
      }
    }

    return new Response(JSON.stringify({ message: 'Stock deducted and consumption records created successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Error in deduct-service-report-stock function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});