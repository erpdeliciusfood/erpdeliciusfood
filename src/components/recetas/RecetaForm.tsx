import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receta, RecetaFormValues, Insumo, InsumoFormValues, RECETA_CATEGORIES, PlatoInsumoWithRelations } from "@/types"; // Import RECETA_CATEGORIES, PlatoInsumoWithRelations
import { useAddReceta, useUpdateReceta } from "@/hooks/useRecetas";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2, PlusCircle, Trash2, Edit } from "lucide-react"; // Added Edit icon
import SearchableInsumoSelect from "./SearchableInsumoSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InsumoForm from "@/components/insumos/InsumoForm"; // Import InsumoForm
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El nombre no debe exceder los 100 caracteres.",
  }),
  descripcion: z.string().max(500, {
    message: "La descripción no debe exceder los 500 caracteres.",
  }).nullable(),
  category: z.string().min(1, { // NEW: Category field
    message: "Debe seleccionar una categoría para la receta.",
  }),
  insumos: z.array(
    z.object({
      insumo_id: z.string().min(1, { message: "Debe seleccionar un insumo." }),
      cantidad_necesaria: z.coerce.number().min(0.01, {
        message: "La cantidad debe ser mayor a 0.",
      }).max(99999.99, {
        message: "La cantidad no debe exceder 99999.99.",
      }),
    })
  ).min(1, { message: "Debe añadir al menos un insumo a la receta." }),
});

interface RecetaFormProps {
  initialData?: Receta | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const RecetaForm: React.FC<RecetaFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddReceta();
  const updateMutation = useUpdateReceta();
  const { data: availableInsumosData, isLoading: isLoadingInsumos, refetch: refetchInsumos } = useInsumos(undefined, undefined, 1, 9999);

  const [isCreateInsumoFormOpen, setIsCreateInsumoFormOpen] = useState(false);
  const [isEditInsumoFormOpen, setIsEditInsumoFormOpen] = useState(false); // NEW: State for editing insumo
  const [newInsumoSearchTerm, setNewInsumoSearchTerm] = useState("");
  const [insumoToEdit, setInsumoToEdit] = useState<Insumo | null>(null); // NEW: State for insumo being edited
  const [currentInsumoFieldIndex, setCurrentInsumoFieldIndex] = useState<number | null>(null);

  const form = useForm<RecetaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      category: "PLATO DE FONDO", // NEW: Default category
      insumos: [{ insumo_id: "", cantidad_necesaria: 0 }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "insumos",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nombre: initialData.nombre,
        descripcion: initialData.descripcion || "",
        category: initialData.category || "PLATO DE FONDO", // NEW: Set initial category
        insumos: initialData.plato_insumos?.map((pi: PlatoInsumoWithRelations) => ({
          insumo_id: pi.insumo_id,
          cantidad_necesaria: pi.cantidad_necesaria,
        })) || [{ insumo_id: "", cantidad_necesaria: 0 }],
      });
    } else {
      form.reset({
        nombre: "",
        descripcion: "",
        category: "PLATO DE FONDO", // NEW: Default category
        insumos: [{ insumo_id: "", cantidad_necesaria: 0 }],
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: RecetaFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, plato: values });
    } else {
      await addMutation.mutateAsync(values);
    }
    onSuccess();
  };

  const handleAddNewInsumo = (searchTerm: string, index: number) => {
    setNewInsumoSearchTerm(searchTerm);
    setCurrentInsumoFieldIndex(index);
    setIsCreateInsumoFormOpen(true);
  };

  const handleEditInsumo = (insumoId: string, index: number) => { // NEW: Handler for editing insumo
    const foundInsumo = availableInsumosData?.data.find(i => i.id === insumoId);
    if (foundInsumo) {
      setInsumoToEdit(foundInsumo);
      setCurrentInsumoFieldIndex(index);
      setIsEditInsumoFormOpen(true);
    } else {
      // Handle case where insumo is not found (e.g., show error toast)
      console.error("Insumo no encontrado para editar:", insumoId);
    }
  };

  const handleInsumoFormSuccess = async (newOrUpdatedInsumo: Insumo) => {
    setIsCreateInsumoFormOpen(false);
    setIsEditInsumoFormOpen(false); // Close edit dialog too
    setNewInsumoSearchTerm("");
    setInsumoToEdit(null); // Clear insumo being edited
    await refetchInsumos(); // Refetch insumos to include the new/updated one

    if (currentInsumoFieldIndex !== null) {
      // If it was a new insumo, set its ID in the form field
      if (!initialData || !initialData.plato_insumos?.some((pi: PlatoInsumoWithRelations) => pi.insumo_id === newOrUpdatedInsumo.id)) {
        update(currentInsumoFieldIndex, {
          ...fields[currentInsumoFieldIndex],
          insumo_id: newOrUpdatedInsumo.id, // Set the newly created insumo's ID
        });
      }
      setCurrentInsumoFieldIndex(null);
    }
  };

  const handleInsumoFormCancel = () => {
    setIsCreateInsumoFormOpen(false);
    setIsEditInsumoFormOpen(false); // Close edit dialog too
    setNewInsumoSearchTerm("");
    setInsumoToEdit(null); // Clear insumo being edited
    setCurrentInsumoFieldIndex(null);
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingInsumos;

  // Map Insumo to InsumoFormValues for the edit form
  const mappedInsumoToEdit: InsumoFormValues | null = insumoToEdit
    ? {
        ...insumoToEdit,
        min_stock_level: insumoToEdit.min_stock_level ?? 0, // Ensure it's a number
      }
    : null;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre de la Receta</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Lomo Saltado"
                    {...field}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Categoría de la Receta</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RECETA_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej. Jugoso lomo fino salteado con cebolla y tomate..."
                    {...field}
                    value={field.value || ""}
                    className="min-h-[80px] text-base"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Insumos de la Receta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-end border-b pb-4 last:border-b-0 last:pb-0">
                  <FormField
                    control={form.control}
                    name={`insumos.${index}.insumo_id`}
                    render={({ field: insumoField }) => (
                      <FormItem className="flex-grow w-full">
                        <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Insumo</FormLabel>
                        <div className="flex items-center space-x-2"> {/* NEW: Wrapper for select and edit button */}
                          <SearchableInsumoSelect
                            value={insumoField.value}
                            onChange={insumoField.onChange}
                            disabled={isLoading || isLoadingInsumos}
                            availableInsumos={availableInsumosData?.data}
                            onAddNewInsumo={(searchTerm: string) => handleAddNewInsumo(searchTerm, index)}
                          />
                          {insumoField.value && ( // Show edit button only if an insumo is selected
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditInsumo(insumoField.value, index)}
                              className="h-12 w-12 flex-shrink-0"
                              disabled={isLoading}
                            >
                              <Edit className="h-5 w-5 text-blue-600" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`insumos.${index}.cantidad_necesaria`}
                    render={({ field: cantidadField }) => (
                      <FormItem className="w-full md:w-1/3">
                        <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Cantidad</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Cantidad"
                            {...cantidadField}
                            onChange={(e) => cantidadField.onChange(parseFloat(e.target.value))}
                            className="h-12 text-base"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-10 w-10 flex-shrink-0"
                    disabled={isLoading || fields.length === 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ insumo_id: "", cantidad_necesaria: 0 })}
                className="w-full mt-4 px-6 py-3 text-lg"
                disabled={isLoading}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Añadir Insumo
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 py-3 text-lg"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {initialData ? "Guardar Cambios" : "Añadir Receta"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Dialog for creating a new Insumo */}
      <Dialog open={isCreateInsumoFormOpen} onOpenChange={setIsCreateInsumoFormOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Crear Nuevo Insumo
            </DialogTitle>
          </DialogHeader>
          <InsumoForm
            initialData={{
              nombre: newInsumoSearchTerm,
              base_unit: "",
              purchase_unit: "",
              conversion_factor: 1,
              costo_unitario: 0,
              stock_quantity: 0,
              min_stock_level: 0,
              category: "Otros",
            }}
            onSuccess={handleInsumoFormSuccess}
            onCancel={handleInsumoFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for editing an existing Insumo */}
      <Dialog open={isEditInsumoFormOpen} onOpenChange={setIsEditInsumoFormOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Editar Insumo
            </DialogTitle>
          </DialogHeader>
          {mappedInsumoToEdit && (
            <InsumoForm
              initialData={mappedInsumoToEdit} // Pass the mapped InsumoFormValues object for editing
              onSuccess={handleInsumoFormSuccess}
              onCancel={handleInsumoFormCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecetaForm;