import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service_report_id, user_id } = await req.json(); // Changed from order_id to service_report_id

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

    // First, we need to revert any previous stock deductions for this report
    // This is crucial for updates to prevent double deduction or incorrect stock.
    // We'll fetch the previous state of insumos related to this report and add back their quantities.
    const { data: previousPlatosVendidos, error: prevPlatosError } = await supabaseAdmin
      .from('service_report_platos')
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

    if (prevPlatosError) {
      console.error('Error fetching previous sold platos for stock reversal:', prevPlatosError);
      // Continue, but log the error. We don't want to block the new deduction if reversal fails.
    } else if (previousPlatosVendidos && previousPlatosVendidos.length > 0) {
      const reversalUpdates = [];
      for (const pv of previousPlatosVendidos) {
        const platoInsumos = pv.platos?.plato_insumos;
        if (platoInsumos) {
          for (const pi of platoInsumos) {
            const insumo = pi.insumos;
            if (insumo) {
              const previouslyDeductedQuantity = pi.cantidad_necesaria * pv.quantity_sold;
              reversalUpdates.push({
                id: insumo.id,
                stock_quantity: insumo.stock_quantity + previouslyDeductedQuantity, // Add back to stock
              });
            }
          }
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
    }

    // Now, fetch the current sold platos for the new deduction
    const { data: currentPlatosVendidos, error: currentPlatosError } = await supabaseAdmin
      .from('service_report_platos')
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

    if (currentPlatosError) {
      console.error('Error fetching current sold platos:', currentPlatosError);
      return new Response(JSON.stringify({ error: currentPlatosError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!currentPlatosVendidos || currentPlatosVendidos.length === 0) {
      return new Response(JSON.stringify({ message: 'No sold platos found for this service report.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const updates = [];
    for (const pv of currentPlatosVendidos) {
      const platoInsumos = pv.platos?.plato_insumos;
      if (platoInsumos) {
        for (const pi of platoInsumos) {
          const insumo = pi.insumos;
          if (insumo) {
            const requiredQuantity = pi.cantidad_necesaria * pv.quantity_sold;
            const newStock = insumo.stock_quantity - requiredQuantity;
            updates.push({
              id: insumo.id,
              stock_quantity: newStock,
            });
          }
        }
      }
    }

    if (updates.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('insumos')
        .upsert(updates, { onConflict: 'id' }); // Use upsert to update existing rows

      if (updateError) {
        console.error('Error updating insumo stock:', updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    return new Response(JSON.stringify({ message: 'Stock deducted successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in deduct-stock function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});