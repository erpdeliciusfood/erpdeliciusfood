import { supabase } from "@/integrations/supabase/client";
import { Menu, MenuFormValues, Receta } from "@/types";

// Helper to map DB fields to Menu interface fields
const mapDbMenuToMenu = (dbMenu: any): Menu => ({
  id: dbMenu.id,
  user_id: dbMenu.user_id, // Mapped user_id
  title: dbMenu.title,
  description: dbMenu.description,
  date: dbMenu.menu_date, // Mapped from menu_date in DB
  event_type_id: dbMenu.event_type_id,
  event_type: dbMenu.event_types,
  menu_platos: dbMenu.menu_platos?.map((mp: any) => ({
    id: mp.id,
    menu_id: mp.menu_id,
    meal_service_id: mp.meal_service_id,
    receta_id: mp.receta_id,
    dish_category: mp.dish_category,
    quantity_needed: mp.quantity_needed,
    receta: {
      id: mp.platos.id,
      user_id: mp.platos.user_id, // Añadido user_id
      nombre: mp.platos.nombre,
      descripcion: mp.platos.descripcion,
      category: mp.platos.categoria,
      tiempo_preparacion: mp.platos.tiempo_preparacion,
      costo_total: mp.platos.costo_total,
      plato_insumos: [],
    } as Receta,
    meal_service: mp.meal_services, // Assuming meal_services is joined on menu_platos
  })) || [],
  created_at: dbMenu.created_at, // Mapped created_at
  // Removed: meal_service_id, meal_service, total_cost, total_servings
});

export const getMenus = async (startDate?: string, endDate?: string): Promise<Menu[]> => {
  let query = supabase
    .from("menus")
    .select(`
      *,
      event_types (id, name, description),
      menu_platos (
        *,
        meal_services (id, name, description, order_index),
        platos (id, nombre, descripcion, categoria, tiempo_preparacion, costo_total, user_id)
      )
    `)
    .order("menu_date", { ascending: true }); // Order by menu_date

  if (startDate) {
    query = query.gte("menu_date", startDate);
  }
  if (endDate) {
    query = query.lte("menu_date", endDate);
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
      event_types (id, name, description),
      menu_platos (
        *,
        meal_services (id, name, description, order_index),
        platos (id, nombre, descripcion, categoria, tiempo_preparacion, costo_total, user_id)
      )
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapDbMenuToMenu(data);
};

export const createMenu = async (menu: MenuFormValues): Promise<Menu> => {
  const { platos_por_servicio, menu_type, menu_date, ...menuData } = menu;

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("User not authenticated or session not found.");
  }
  const userId = session.user.id;

  const { data: newMenu, error: menuError } = await supabase
    .from("menus")
    .insert({
      ...menuData,
      user_id: userId, // Add user_id
      menu_date: menu_type === 'daily' ? menu_date : null, // Use 'menu_date' field
      event_type_id: menu_type === 'event' ? menu.event_type_id : null,
    })
    .select()
    .single();
  if (menuError) throw menuError;

  if (platos_por_servicio && platos_por_servicio.length > 0) {
    const menuPlatosToInsert = platos_por_servicio.map((item: { meal_service_id: string; receta_id: string; dish_category: string; quantity_needed: number; }) => ({
      menu_id: newMenu.id,
      meal_service_id: item.meal_service_id,
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
  if (!id) throw new Error("Menu ID is required for update.");

  const { data: updatedMenu, error: menuError } = await supabase
    .from("menus")
    .update({
      ...menuData,
      menu_date: menu_type === 'daily' ? menu_date : null, // Use 'menu_date' field
      event_type_id: menu_type === 'event' ? menu.event_type_id : null,
    })
    .eq("id", id)
    .select()
    .single();
  if (menuError) throw menuError;

  // Delete existing menu_platos and insert new ones
  await supabase.from("menu_platos").delete().eq("menu_id", id);

  if (platos_por_servicio && platos_por_servicio.length > 0) {
    const menuPlatosToInsert = platos_por_servicio.map((item: { meal_service_id: string; receta_id: string; dish_category: string; quantity_needed: number; }) => ({
      menu_id: updatedMenu.id,
      meal_service_id: item.meal_service_id,
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