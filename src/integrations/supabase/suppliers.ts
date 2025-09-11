import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types";

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
};

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> => {
  const { data, error } = await supabase
    .from("proveedores")
    .insert(supplier)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateSupplier = async (supplier: Supplier): Promise<Supplier> => {
  const { data, error } = await supabase
    .from("proveedores")
    .update(supplier)
    .eq("id", supplier.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("proveedores")
    .delete()
    .eq("id", id);
  if (error) throw error;
};