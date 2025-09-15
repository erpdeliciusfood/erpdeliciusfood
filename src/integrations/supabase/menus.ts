import { supabase } from "@/integrations/supabase/client";
import { Menu, MenuFormValues } from "@/types/index";

export const getMenus = async (startDate?: string, endDate?: string): Promise<Menu[]> => {
  let query = supabase
    .from("menus")
    .select(`
      *, 
      event_types(*), 
      menu_platos(
        *, 
        platos(
          *, 
          plato_insumos(
            *, 
            insumos(*)
          )
        ), 
        meal_services(*)
      )
    `);

  if (startDate) {
    query = query.gte("menu_date", startDate);
  }
  if (endDate) {
    query = query.lte("menu_date", endDate);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const getMenuById = async (id: string): Promise<Menu | null> => {
  const { data, error } = await supabase
    .from("menus")
    .select(`
      *, 
      event_types(*), 
      menu_platos(
        *, 
        platos(
          *, 
          plato_insumos(
            *, 
            insumos(*)
          )
        ), 
        meal_services(*)
      )
    `)
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(error.message);
  }
  return data;
};

export const createMenu = async (menuData: MenuFormValues): Promise<Menu> => {
  const { title, description, menu_date, event_type_id, menu_type, platos_por_servicio } = menuData;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  const { data: newMenu, error: menuError } = await supabase
    .from("menus")
    .insert({
      user_id: user.id,
      title,
      description,
      menu_date,
      event_type_id,
      menu_type, // NEW: Include menu_type
    })
    .select()
    .single();

  if (menuError) throw new Error(menuError.message);
  if (!newMenu) throw new Error("Failed to create menu.");

  if (platos_por_servicio && platos_por_servicio.length > 0) {
    const menuPlatosToInsert = platos_por_servicio.map((item) => ({
      menu_id: newMenu.id,
      plato_id: item.plato_id,
      meal_service_id: item.meal_service_id,
      dish_category: item.dish_category,
      quantity_needed: item.quantity_needed,
    }));

    const { error: menuPlatoError } = await supabase
      .from("menu_platos")
      .insert(menuPlatosToInsert);

    if (menuPlatoError) {
      throw new Error(`Failed to add platos to menu: ${menuPlatoError.message}`);
    }
  }

  const { data: completeMenu, error: fetchError } = await supabase
    .from("menus")
    .select(`
      *, 
      event_types(*), 
      menu_platos(
        *, 
        platos(
          *, 
          plato_insumos(
            *, 
            insumos(*)
          )
        ), 
        meal_services(*)
      )
    `)
    .eq("id", newMenu.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete menu: ${fetchError.message}`);

  return completeMenu;
};

export const updateMenu = async (id: string, menuData: MenuFormValues): Promise<Menu> => {
  const { title, description, menu_date, event_type_id, menu_type, platos_por_servicio } = menuData;

  const { data: updatedMenu, error: menuError } = await supabase
    .from("menus")
    .update({
      title,
      description,
      menu_date,
      event_type_id,
      menu_type, // NEW: Include menu_type
    })
    .eq("id", id)
    .select()
    .single();

  if (menuError) throw new Error(menuError.message);
  if (!updatedMenu) throw new Error("Failed to update menu.");

  const { error: deleteError } = await supabase
    .from("menu_platos")
    .delete()
    .eq("menu_id", id);

  if (deleteError) throw new Error(`Failed to delete existing platos for menu: ${deleteError.message}`);

  if (platos_por_servicio && platos_por_servicio.length > 0) {
    const menuPlatosToInsert = platos_por_servicio.map((item) => ({
      menu_id: updatedMenu.id,
      plato_id: item.plato_id,
      meal_service_id: item.meal_service_id,
      dish_category: item.dish_category,
      quantity_needed: item.quantity_needed,
    }));

    const { error: menuPlatoError } = await supabase
      .from("menu_platos")
      .insert(menuPlatosToInsert);

    if (menuPlatoError) {
      throw new Error(`Failed to add new platos to menu: ${menuPlatoError.message}`);
    }
  }

  const { data: completeMenu, error: fetchError } = await supabase
    .from("menus")
    .select(`
      *, 
      event_types(*), 
      menu_platos(
        *, 
        platos(
          *, 
          plato_insumos(
            *, 
            insumos(*)
          )
        ), 
        meal_services(*)
      )
    `)
    .eq("id", updatedMenu.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete menu: ${fetchError.message}`);

  return completeMenu;
};

export const deleteMenu = async (id: string): Promise<void> => {
  const { error } = await supabase.from("menus").delete().eq("id", id);
  if (error) throw new Error(error.message);
};