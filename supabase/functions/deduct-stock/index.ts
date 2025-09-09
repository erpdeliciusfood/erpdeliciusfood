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
    const { order_id, user_id } = await req.json();

    if (!order_id || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing order_id or user_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch order items with nested plato_insumos and insumos
    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        quantity,
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
      .eq('order_id', order_id);

    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      return new Response(JSON.stringify({ error: orderItemsError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!orderItems || orderItems.length === 0) {
      return new Response(JSON.stringify({ message: 'No order items found for this order.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const updates = [];
    for (const item of orderItems) {
      const platoInsumos = item.platos?.plato_insumos;
      if (platoInsumos) {
        for (const pi of platoInsumos) {
          const insumo = pi.insumos;
          if (insumo) {
            const requiredQuantity = pi.cantidad_necesaria * item.quantity;
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