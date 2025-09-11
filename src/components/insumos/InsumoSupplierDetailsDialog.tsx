import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Insumo } from "@/types";
import { useUpdateInsumo } from "@/hooks/useInsumos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Loader2 } from "lucide-react";

interface InsumoSupplierDetailsDialogProps {
  insumo: Insumo;
  onClose: () => void;
}

const FormSchema = z.object({
  proveedor_preferido_id: z.string().uuid().nullable().optional(),
});

const InsumoSupplierDetailsDialog: React.FC<InsumoSupplierDetailsDialogProps> = ({ insumo, onClose }) => {
  const updateInsumoMutation = useUpdateInsumo();
  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proveedor_preferido_id: insumo.proveedor_preferido_id || null,
    },
  });

  useEffect(() => {
    form.reset({
      proveedor_preferido_id: insumo.proveedor_preferido_id || null,
    });
  }, [insumo, form]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      await updateInsumoMutation.mutateAsync({
        id: insumo.id,
        updates: {
          proveedor_preferido_id: values.proveedor_preferido_id,
        },
      });
      onClose();
    } catch (error) {
      console.error("Error updating insumo supplier details:", error);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] p-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Detalles del Proveedor de {insumo.nombre}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="proveedor_preferido_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor Preferido</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingSuppliers ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <SelectItem value="">Ninguno</SelectItem>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {insumo.proveedor_preferido && (
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-semibold">Nombre:</span> {insumo.proveedor_preferido.name}
              </p>
              <p>
                <span className="font-semibold">Contacto:</span> {insumo.proveedor_preferido.contact_person || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span> {insumo.proveedor_preferido.phone || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {insumo.proveedor_preferido.email || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Dirección:</span> {insumo.proveedor_preferido.address || "N/A"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateInsumoMutation.isPending || isLoadingSuppliers}>
              {updateInsumoMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default InsumoSupplierDetailsDialog;