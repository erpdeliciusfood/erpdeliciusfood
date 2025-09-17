// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Extract the JWT from the Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized: Missing Authorization header', {
      status: 401,
      headers: corsHeaders,
    });
  }

  const token = authHeader.replace('Bearer ', '');

  // Create a Supabase client with the user's token
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  // Verify the user's session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response('Unauthorized: Invalid user session', {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'Missing startDate or endDate' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use supabaseAdmin to bypass RLS for fetching all necessary data
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch menus for the user within the date range
    const { data: menus, error: menusError } = await supabaseAdmin
      .from('menus')
      .select(`
        id,
        menu_date,
        title,
        menu_type,
        event_types(name),
        menu_platos(
          quantity_needed,
          meal_services(id, name),
          platos(
            id,
            nombre,
            plato_insumos(
              cantidad_necesaria,
              insumos(
                id,
                nombre,
                base_unit,
                purchase_unit,
                conversion_factor,
                stock_quantity,
                min_stock_level
              )
            )
          )
        )
      `)
      .eq('user_id', user.id) // Filter by authenticated user
      .gte('menu_date', startDate)
      .lte('menu_date', endDate)
      .order('menu_date', { ascending: true });

    if (menusError) {
      console.error('Error fetching menus:', menusError);
      return new Response(JSON.stringify({ error: menusError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Structure for the Quebrado report
    const quebradoData: {
      date: string;
      dayOfWeek: string;
      services: {
        serviceId: string;
        serviceName: string;
        recipes: {
          recipeId: string;
          recipeName: string;
          dinerCount: number; // This will be the per-service diner count
          insumos: {
            insumoId: string;
            insumoName: string;
            quantityNeeded: number; // in purchase_unit
            unit: string; // purchase_unit
          }[];
        }[];
      }[];
    }[] = [];

    const allInsumoNeeds: { [insumoId: string]: { insumoName: string; totalQuantity: number; unit: string; services: Set<string>; currentStock: number; minStockLevel: number | null } } = {};

    // Aggregate data
    menus.forEach(menu => {
      const menuDate = menu.menu_date;
      if (!menuDate) return; // Skip if no menu_date

      const dayOfWeek = new Date(menuDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' });

      let dayEntry = quebradoData.find(entry => entry.date === menuDate);
      if (!dayEntry) {
        dayEntry = { date: menuDate, dayOfWeek, services: [] };
        quebradoData.push(dayEntry);
      }

      menu.menu_platos.forEach(menuPlato => {
        const serviceId = menuPlato.meal_services?.id;
        const serviceName = menuPlato.meal_services?.name;
        const recipe = menuPlato.platos;
        const recipeDinerCount = menuPlato.quantity_needed; // Raciones por servicio del menú

        if (!serviceId || !serviceName || !recipe) return;

        let serviceEntry = dayEntry?.services.find(s => s.serviceId === serviceId);
        if (!serviceEntry) {
          serviceEntry = { serviceId, serviceName, recipes: [] };
          dayEntry?.services.push(serviceEntry);
        }

        const insumosForRecipe: {
          insumoId: string;
          insumoName: string;
          quantityNeeded: number;
          unit: string;
        }[] = [];

        recipe.plato_insumos.forEach(platoInsumo => {
          const insumo = platoInsumo.insumos;
          if (!insumo) return;

          // Calculate total insumo needed for this recipe * for this service's diner count
          const totalNeededBaseUnit = platoInsumo.cantidad_necesaria * recipeDinerCount;
          const totalNeededPurchaseUnit = totalNeededBaseUnit / insumo.conversion_factor;

          insumosForRecipe.push({
            insumoId: insumo.id,
            insumoName: insumo.nombre,
            quantityNeeded: parseFloat(totalNeededPurchaseUnit.toFixed(2)),
            unit: insumo.purchase_unit,
          });

          // For consolidated report
          if (!allInsumoNeeds[insumo.id]) {
            allInsumoNeeds[insumo.id] = {
              insumoName: insumo.nombre,
              totalQuantity: 0,
              unit: insumo.purchase_unit,
              services: new Set(),
              currentStock: insumo.stock_quantity, // Capture current stock
              minStockLevel: insumo.min_stock_level, // Capture min stock level
            };
          }
          allInsumoNeeds[insumo.id].totalQuantity += totalNeededPurchaseUnit;
          allInsumoNeeds[insumo.id].services.add(serviceName);
        });

        serviceEntry?.recipes.push({
          recipeId: recipe.id,
          recipeName: recipe.nombre,
          dinerCount: recipeDinerCount,
          insumos: insumosForRecipe,
        });
      });
    });

    const consolidatedInsumos = Object.entries(allInsumoNeeds).map(([insumoId, data]) => ({
      insumoId,
      insumoName: data.insumoName,
      totalQuantity: parseFloat(data.totalQuantity.toFixed(2)),
      unit: data.unit,
      services: Array.from(data.services).sort(),
      currentStock: parseFloat(data.currentStock.toFixed(2)), // Include current stock
      minStockLevel: data.minStockLevel, // Include min stock level
    }));


    const responseBody = {
      message: `Quebrado de menús generado exitosamente.`,
      quebradoData,
      consolidatedInsumos,
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error in generate-quebrado function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});