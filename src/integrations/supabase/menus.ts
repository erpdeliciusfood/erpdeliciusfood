import { supabase } from "@/integrations/supabase/client";
import { Menu, MenuFormValues, Receta } from "@/types"; // Removed unused MenuPlato, MealService, EventType

// Helper to map DB fields to Menu interface fields
const mapDbMenuToMenu = (dbMenu: any): Menu => ({
  id: dbMenu.id,
  date: dbMenu.date,
  meal_service_id: dbMenu.meal_service_id,
  event_type_id: dbMenu.event_type_id,
  meal_service: dbMenu.meal_services, // Assuming 'meal_services' is the joined table
  event_type: dbMenu.event_types, // Assuming 'event_types' is the joined table
  menu_platos: dbMenu.menu_platos?.map((mp: any) => ({
    id: mp.id,
    menu_id: mp.menu_id,
    meal_service_id: mp.meal_service_id, // Ensure this is mapped if it exists in DB
    receta_id: mp.receta_id,
    dish_category: mp.dish_category,
    quantity_needed: mp.quantity_needed,
    receta: {
      id: mp.platos.id,
      nombre: mp.platos.nombre,
      descripcion: mp.platos.descripcion,
      category: mp.platos.categoria, // Map DB field
      tiempo_preparacion: mp.platos.tiempo_preparacion,
      costo_total: mp.platos.costo_total,
      plato_insumos: [], // Not fetching deep insumos here for brevity
    } as Receta,
  })) || [],
  total_cost: dbMenu.total_cost,
  total_servings: dbMenu.total_servings,
  title: dbMenu.title,
  description: dbMenu.description,
});

export const getMenus = async (startDate?: string, endDate?: string): Promise<Menu[]> => {
  let query = supabase
    .from("menus")
    .select(`
      *,
      meal_services (id, name, description, order_index),
      event_types (id, name, description),
      menu_platos (
        *,
        platos (id, nombre, descripcion, categoria, tiempo_preparacion, costo_total)
      )
    `)
    .order("date", { ascending: true });

  if (startDate) {
    query = query.gte("date", startDate);
  }
  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapDbMenuToMenu);
};

export const getMenuById = async (id: string): Promise<Menu> => {
  const { data, error } = await supabase
    .from("menus")
    .select(`
      *,
      meal_services (id, name, description, order_index),
      event_types (id, name, description),
      menu_platos (
        *,
        platos (id, nombre, descripcion, categoria, tiempo_preparacion, costo_total)
      )
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapDbMenuToMenu(data);
};

export const createMenu = async (menu: MenuFormValues): Promise<Menu> => {
  const { platos_por_servicio, menu_type, menu_date, ...menuData } = menu;

  const { data: newMenu, error: menuError } = await supabase
    .from("menus")
    .insert({
      ...menuData,
      date: menu_type === 'daily' ? menu_date : null, // Use 'date' field
      event_type_id: menu_type === 'event' ? menuData.event_type_id : null,
    })
    .select()
    .single();
  if (menuError) throw menuError;

  if (platos_por_servicio && platos_por_servicio.length > 0) {
    const menuPlatosToInsert = platos_por_servicio.map((item: { meal_service_id: string; receta_id: string; dish_category: string; quantity_needed: number; }) => ({ // Typed item
      menu_id: newMenu.id,
      meal_service_id: item.meal_service_id, // Ensure this is passed
      receta_id: item.receta_id,
      dish_category: item.dish_category,
      quantity_needed: item.quantity_needed,
    }));
    const { error: menuPlatoError } = await supabase
      .from("menu_platos")
      .insert(menuPlatosToInsert);
    if (menuPlatoError) throw menuPlatoError;
  }

  return getMenuById(newMenu.id);
};

export const updateMenu = async (id: string, menu: MenuFormValues): Promise<Menu> => {
  const { platos_por_servicio, menu_type, menu_date, ...menuData } = menu;

  const { data: updatedMenu, error: menuError } = await supabase
    .from("menus")
    .update({
      ...menuData,
      date: menu_type === 'daily' ? menu_date : null, // Use 'date' field
      event_type_id: menu_type === 'event' ? menuData.event_type_id : null,
    })
    .eq("id", id)
    .select()
    .single();
  if (menuError) throw menuError;

  // Delete existing menu_platos and insert new ones
  await supabase.from("menu_platos").delete().eq("menu_id", id);

  if (platos_por_servicio && platos_por_servicio.length > 0) {
    const menuPlatosToInsert = platos_por_servicio.map((item: { meal_service_id: string; receta_id: string; dish_category: string; quantity_needed: number; }) => ({ // Typed item
      menu_id: updatedMenu.id,
      meal_service_id: item.meal_service_id, // Ensure this is passed
      receta_id: item.receta_id,
      dish_category: item.dish_category,
      quantity_needed: item.quantity_needed,
    }));
    const { error: menuPlatoError } = await supabase
      .from("menu_platos")
      .insert(menuPlatosToInsert);
    if (menuPlatoError) throw menuPlatoError;
  }

  return getMenuById(updatedMenu.id);
};

export const deleteMenu = async (id: string): Promise<void> => {
  // Delete associated menu_platos first
  await supabase.from("menu_platos").delete().eq("menu_id", id);
  const { error } = await supabase.from("menus").delete().eq("id", id);
  if (error) throw error;
};