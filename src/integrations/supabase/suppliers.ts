import { supabase } from "@/integrations/supabase/client";
import { Supplier, SupplierFormValues } from "@/types";

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const createSupplier = async (supplier: SupplierFormValues): Promise<Supplier> => {
  const { data, error } = await supabase
    .from("proveedores")
    .insert(supplier)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateSupplier = async (id: string, supplier: SupplierFormValues): Promise<Supplier> => {
  const { data, error } = await supabase
    .from("proveedores")
    .update(supplier)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("proveedores")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};