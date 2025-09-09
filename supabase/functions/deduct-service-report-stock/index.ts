// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore
serve(async (req: Request) => { // Explicitly type req as Request
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

    // Create a Supabase client with the service role key to bypass RLS for stock updates
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Fetch the Service Report details
    const { data: serviceReport, error: serviceReportError } = await supabaseAdmin
      .from('service_reports')
      .select('menu_id, meals_sold')
      .eq('id', service_report_id)
      .single();

    if (serviceReportError) {
      console.error('Error fetching service report:', serviceReportError);
      return new Response(JSON.stringify({ error: serviceReportError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!serviceReport) {
      return new Response(JSON.stringify({ message: 'Service report not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const { menu_id, meals_sold } = serviceReport;

    if (meals_sold <= 0) {
      return new Response(JSON.stringify({ message: 'No meals sold, no stock deduction needed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. Fetch the Menu and its associated platos and insumos
    const { data: menu, error: menuError } = await supabaseAdmin
      .from('menus')
      .select(`
        menu_platos (
          quantity_needed,
          platos (
            plato_insumos (
              cantidad_necesaria,
              insumos (
                id,
                stock_quantity
              )
            )
          )
        )
      `)
      .eq('id', menu_id)
      .single();

    if (menuError) {
      console.error('Error fetching menu details:', menuError);
      return new Response(JSON.stringify({ error: menuError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!menu || !menu.menu_platos || menu.menu_platos.length === 0) {
      return new Response(JSON.stringify({ message: 'No platos found for this menu, no stock deduction needed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const insumoConsumption: { [insumoId: string]: number } = {};
    const insumoCurrentStock: { [insumoId: string]: number } = {};

    // Calculate total insumo consumption for the meals sold
    for (const menuPlato of menu.menu_platos) {
      const plato = menuPlato.platos;
      if (plato && plato.plato_insumos) {
        for (const platoInsumo of plato.plato_insumos) {
          const insumo = platoInsumo.insumos;
          if (insumo) {
            const consumedQuantity = (platoInsumo.cantidad_necesaria * menuPlato.quantity_needed * meals_sold);
            insumoConsumption[insumo.id] = (insumoConsumption[insumo.id] || 0) + consumedQuantity;
            insumoCurrentStock[insumo.id] = insumo.stock_quantity; // Store current stock
          }
        }
      }
    }

    const updates = [];
    const consumptionRecords = [];

    for (const insumoId in insumoConsumption) {
      const quantityToDeduct = insumoConsumption[insumoId];
      const currentStock = insumoCurrentStock[insumoId];
      const newStock = currentStock - quantityToDeduct;

      updates.push({
        id: insumoId,
        stock_quantity: newStock,
      });

      consumptionRecords.push({
        user_id: user_id, // Pass user_id to consumption record
        service_report_id: service_report_id,
        insumo_id: insumoId,
        quantity_consumed: quantityToDeduct,
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
        // This error is not critical enough to roll back stock, but should be logged
      }
    }

    return new Response(JSON.stringify({ message: 'Stock deducted and consumption records created successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) { // Explicitly type error as unknown
    console.error('Error in deduct-service-report-stock function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }), { // Type guard for error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});