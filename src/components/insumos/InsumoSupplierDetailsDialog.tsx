import React, { useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Insumo, InsumoSupplierHistory, InsumoPriceHistory } from "@/types"; // Imported new types
import { useUpdateInsumo, useInsumoSupplierHistory, useInsumoPriceHistory } from "@/hooks/useInsumos";
import { Loader2, Building2, DollarSign, History } from "lucide-react"; // Removed Phone icon
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";

const supplierFormSchema = z.object({
  supplier_name: z.string().max(100, {
    message: "El nombre del proveedor no debe exceder los 100 caracteres.",
  }).nullable(),
  supplier_phone: z.string().max(20, {
    message: "El teléfono del proveedor no debe exceder los 20 caracteres.",
  }).nullable(),
});

interface InsumoSupplierDetailsDialogProps {
  insumo: Insumo;
  onClose: () => void;
}

const InsumoSupplierDetailsDialog: React.FC<InsumoSupplierDetailsDialogProps> = ({ insumo, onClose }) => {
  const updateInsumoMutation = useUpdateInsumo();
  const { data: supplierHistory, isLoading: isLoadingSupplierHistory } = useInsumoSupplierHistory(insumo.id);
  const { data: priceHistory, isLoading: isLoadingPriceHistory } = useInsumoPriceHistory(insumo.id);

  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      supplier_name: insumo.supplier_name || "",
      supplier_phone: insumo.supplier_phone || "",
    },
  });

  useEffect(() => {
    form.reset({
      supplier_name: insumo.supplier_name || "",
      supplier_phone: insumo.supplier_phone || "",
    });
  }, [insumo, form]);

  const onSubmit = async (values: z.infer<typeof supplierFormSchema>) => {
    try {
      await updateInsumoMutation.mutateAsync({
        id: insumo.id,
        insumo: {
          ...insumo, // Keep existing insumo data
          supplier_name: values.supplier_name,
          supplier_phone: values.supplier_phone,
        },
      });
      showSuccess("Datos del proveedor actualizados exitosamente.");
      onClose(); // Close dialog on success
    } catch (error: any) {
      showError(`Error al actualizar el proveedor: ${error.message}`);
    }
  };

  const isUpdating = updateInsumoMutation.isPending;

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Detalles del Proveedor y Historial de {insumo.nombre}
        </DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="current-supplier" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current-supplier" className="text-base">Proveedor Actual</TabsTrigger>
          <TabsTrigger value="history" className="text-base">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="current-supplier" className="mt-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="supplier_name" className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Proveedor</Label>
              <Input
                id="supplier_name"
                placeholder="Nombre del proveedor"
                {...form.register("supplier_name")}
                className="h-10 text-base mt-1"
                disabled={isUpdating}
              />
              {form.formState.errors.supplier_name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.supplier_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="supplier_phone" className="text-base font-semibold text-gray-800 dark:text-gray-200">Teléfono del Proveedor</Label>
              <Input
                id="supplier_phone"
                placeholder="Teléfono del proveedor"
                {...form.register("supplier_phone")}
                className="h-10 text-base mt-1"
                disabled={isUpdating}
              />
              {form.formState.errors.supplier_phone && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.supplier_phone.message}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <History className="mr-2 h-5 w-5" /> Historial de Proveedores y Precios
          </h3>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
              <Building2 className="mr-2 h-4 w-4" /> Cambios de Proveedor
            </h4>
            {isLoadingSupplierHistory ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-foreground" />
              </div>
            ) : supplierHistory && supplierHistory.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Fecha</TableHead>
                      <TableHead className="text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Proveedor Anterior</TableHead>
                      <TableHead className="text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Proveedor Nuevo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierHistory.map((entry: InsumoSupplierHistory) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                          {format(new Date(entry.changed_at), "PPP HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">{entry.old_supplier_name || "N/A"}</TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">{entry.new_supplier_name || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">No hay historial de cambios de proveedor.</p>
            )}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
              <DollarSign className="mr-2 h-4 w-4" /> Historial de Precios
            </h4>
            {isLoadingPriceHistory ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-foreground" />
              </div>
            ) : priceHistory && priceHistory.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Fecha</TableHead>
                      <TableHead className="text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Costo Anterior (S/)</TableHead>
                      <TableHead className="text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Costo Nuevo (S/)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceHistory.map((entry: InsumoPriceHistory) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                          {format(new Date(entry.changed_at), "PPP HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-700 dark:text-gray-300">S/ {entry.old_costo_unitario.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-sm text-gray-700 dark:text-gray-300">S/ {entry.new_costo_unitario.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">No hay historial de cambios de precio.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};

export default InsumoSupplierDetailsDialog;