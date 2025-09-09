import { supabase } from "@/integrations/supabase/client";
import { Order, OrderFormValues, OrderItem } from "@/types";

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, platos(*))") // Fetch order_items and nested platos
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, platos(*))")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(error.message);
  }
  return data;
};

export const createOrder = async (orderData: OrderFormValues): Promise<Order> => {
  const { customer_name, status, items } = orderData;

  // Calculate total amount
  const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.price_at_order), 0);

  // Insert the main order
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert({ customer_name, status, total_amount })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!newOrder) throw new Error("Failed to create order.");

  // Insert associated order items
  if (items && items.length > 0) {
    const orderItemsToInsert = items.map((item) => ({
      order_id: newOrder.id,
      plato_id: item.plato_id,
      quantity: item.quantity,
      price_at_order: item.price_at_order,
    }));

    const { error: orderItemError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (orderItemError) {
      throw new Error(`Failed to add items to order: ${orderItemError.message}`);
    }
  }

  // Fetch the complete order with its items for the return value
  const { data: completeOrder, error: fetchError } = await supabase
    .from("orders")
    .select("*, order_items(*, platos(*))")
    .eq("id", newOrder.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete order: ${fetchError.message}`);

  return completeOrder;
};

export const updateOrder = async (id: string, orderData: OrderFormValues): Promise<Order> => {
  const { customer_name, status, items } = orderData;

  // Calculate total amount
  const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.price_at_order), 0);

  // Update the main order
  const { data: updatedOrder, error: orderError } = await supabase
    .from("orders")
    .update({ customer_name, status, total_amount })
    .eq("id", id)
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!updatedOrder) throw new Error("Failed to update order.");

  // Delete existing order_items for this order
  const { error: deleteError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", id);

  if (deleteError) throw new Error(`Failed to delete existing items for order: ${deleteError.message}`);

  // Insert new associated order items
  if (items && items.length > 0) {
    const orderItemsToInsert = items.map((item) => ({
      order_id: updatedOrder.id,
      plato_id: item.plato_id,
      quantity: item.quantity,
      price_at_order: item.price_at_order,
    }));

    const { error: orderItemError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (orderItemError) {
      throw new Error(`Failed to add new items to order: ${orderItemError.message}`);
    }
  }

  // Fetch the complete order with its items for the return value
  const { data: completeOrder, error: fetchError } = await supabase
    .from("orders")
    .select("*, order_items(*, platos(*))")
    .eq("id", updatedOrder.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete order: ${fetchError.message}`);

  return completeOrder;
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
};