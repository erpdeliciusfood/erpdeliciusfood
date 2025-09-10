import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Insumo, InsumoFormValues } from "@/types";
import { useAddInsumo, useUpdateInsumo, useInsumos } from "@/hooks/useInsumos"; // Import useInsumos
import { Loader2, Search, AlertTriangle } from "lucide-react";
import InsumoBasicDetailsFormSection from "./InsumoBasicDetailsFormSection";
import InsumoStockAndCostFormSection from "./InsumoStockAndCostFormSection";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn, normalizeString } from "@/lib/utils"; // Import normalizeString
import { showSuccess, showError } from "@/utils/toast";
import { INSUMO_CATEGORIES, UNIDADES_BASE, UNIDADES_COMPRA, PREDEFINED_CONVERSIONS } from "@/constants/insumoConstants"; // Import constants

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(50, {
    message: "El nombre no debe exceder los 50 caracteres.",
  }),
  base_unit: z.string().min(1, {
    message: "Debe seleccionar una unidad base.",
  }),
  purchase_unit: z.string().min(1, {
    message: "Debe seleccionar una unidad de compra.",
  }),
  conversion_factor: z.coerce.number().min(0.001, {
    message: "El factor de conversión debe ser mayor a 0.",
  }).max(1000000, {
    message: "El factor de conversión no debe exceder 1,000,000.",
  }),
  costo_unitario: z.coerce.number().min(0.01, {
    message: "El costo unitario debe ser mayor a 0.",
  }).max(99999.99, {
    message: "El costo unitario no debe exceder 99999.99.",
  }),
  stock_quantity: z.coerce.number().min(0, {
    message: "La cantidad de stock no puede ser negativa.",
  }).max(999999, {
    message: "La cantidad de stock no debe exceder 999999.",
  }),
  min_stock_level: z.coerce.number().min(0, {
    message: "El nivel mínimo de stock no puede ser negativo.",
  }).max(999999, {
    message: "El nivel mínimo de stock no debe exceder 999999.",
  }),
  supplier_name: z.string().max(100, {
    message: "El nombre del proveedor no debe exceder los 100 caracteres.",
  }).nullable(),
  supplier_phone: z.string().nullable().refine((val) => {
    if (!val) return true;
    return /^\+51\d{9}$/.test(val);
  }, {
    message: "El teléfono debe empezar con +51 y tener 9 dígitos (ej. +51987654321).",
  }),
  supplier_address: z.string().max(255, {
    message: "La dirección del proveedor no debe exceder los 255 caracteres.",
  }).nullable(),
  category: z.string().min(1, {
    message: "Debe seleccionar una categoría.",
  }),
});

interface InsumoFormProps {
  initialData?: Insumo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const InsumoForm: React.FC<InsumoFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddInsumo();
  const updateMutation = useUpdateInsumo();
  const [isConversionFactorEditable, setIsConversionFactorEditable] = useState(true);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allInsumos, isLoading: isLoadingAllInsumos } = useInsumos(); // Fetch all insumos for suggestions

  const form = useForm<InsumoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      base_unit: "",
      purchase_unit: "",
      conversion_factor: 1.0,
      costo_unitario: 0,
      stock_quantity: 0,
      min_stock_level: 0,
      supplier_name: "",
      supplier_phone: "",
      supplier_address: "",
      category: "Otros",
    },
  });

  const purchaseUnit = form.watch("purchase_unit");
  const baseUnit = form.watch("base_unit");
  const currentNombre = form.watch("nombre");

  useEffect(() => {
    if (initialData) {
      form.reset({
        nombre: initialData.nombre,
        base_unit: initialData.base_unit,
        purchase_unit: initialData.purchase_unit,
        conversion_factor: initialData.conversion_factor,
        costo_unitario: initialData.costo_unitario,
        stock_quantity: initialData.stock_quantity,
        min_stock_level: initialData.min_stock_level,
        supplier_name: initialData.supplier_name || "",
        supplier_phone: initialData.supplier_phone || "",
        supplier_address: initialData.supplier_address || "",
        category: initialData.category || "Otros",
      });
      setIsConversionFactorEditable(true);
      setSearchTerm(initialData.nombre); // Set search term to initial data name
    } else {
      form.reset({
        nombre: "",
        base_unit: "",
        purchase_unit: "",
        conversion_factor: 1.0,
        costo_unitario: 0,
        stock_quantity: 0,
        min_stock_level: 0,
        supplier_name: "",
        supplier_phone: "",
        supplier_address: "",
        category: "Otros",
      });
      setIsConversionFactorEditable(true);
      setSearchTerm("");
    }
  }, [initialData, form]);

  useEffect(() => {
    if (!initialData && purchaseUnit && baseUnit) {
      const suggestedFactor = PREDEFINED_CONVERSIONS[purchaseUnit]?.[baseUnit];
      if (suggestedFactor !== undefined) {
        form.setValue("conversion_factor", suggestedFactor, { shouldValidate: true });
        setIsConversionFactorEditable(false);
      } else if (purchaseUnit === baseUnit) {
        form.setValue("conversion_factor", 1.0, { shouldValidate: true });
        setIsConversionFactorEditable(false);
      } else {
        if (form.getValues("conversion_factor") === 0) {
          form.setValue("conversion_factor", 1.0, { shouldValidate: true });
        }
        setIsConversionFactorEditable(true);
      }
    } else if (initialData) {
      setIsConversionFactorEditable(true);
    }
  }, [purchaseUnit, baseUnit, form, initialData]);

  const onSubmit = async (values: InsumoFormValues) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, insumo: values });
      } else {
        await addMutation.mutateAsync(values);
      }
      onSuccess();
    } catch (error: any) {
      showError(`Error al guardar insumo: ${error.message}`);
    }
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingAllInsumos;

  const filteredInsumos = allInsumos?.filter(insumo =>
    normalizeString(insumo.nombre).includes(normalizeString(searchTerm))
  ).slice(0, 10); // Limit suggestions to 10

  const isSimilarInsumoFound = filteredInsumos && filteredInsumos.some(
    insumo => normalizeString(insumo.nombre) === normalizeString(currentNombre) && insumo.id !== initialData?.id
  );

  const handleSelectInsumo = (selectedInsumo: Insumo) => {
    form.reset({
      nombre: selectedInsumo.nombre,
      base_unit: selectedInsumo.base_unit,
      purchase_unit: selectedInsumo.purchase_unit,
      conversion_factor: selectedInsumo.conversion_factor,
      costo_unitario: selectedInsumo.costo_unitario,
      stock_quantity: selectedInsumo.stock_quantity,
      min_stock_level: selectedInsumo.min_stock_level,
      supplier_name: selectedInsumo.supplier_name || "",
      supplier_phone: selectedInsumo.supplier_phone || "",
      supplier_address: selectedInsumo.supplier_address || "",
      category: selectedInsumo.category || "Otros",
    });
    setSearchTerm(selectedInsumo.nombre);
    setOpenCombobox(false);
    showSuccess(`Formulario pre-llenado con datos de "${selectedInsumo.nombre}".`);
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Insumo</FormLabel>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between h-12 text-base",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value
                          ? allInsumos?.find((insumo) => insumo.nombre === field.value)?.nombre
                          : "Selecciona o escribe un insumo..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar insumo..."
                        value={searchTerm}
                        onValueChange={(value) => {
                          setSearchTerm(value);
                          field.onChange(value); // Update form field as well
                        }}
                        disabled={isLoading}
                      />
                      <CommandList>
                        {isLoadingAllInsumos ? (
                          <CommandEmpty>
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="mt-2">Cargando insumos...</p>
                          </CommandEmpty>
                        ) : filteredInsumos && filteredInsumos.length > 0 ? (
                          <CommandGroup>
                            {filteredInsumos.map((insumo) => (
                              <CommandItem
                                value={insumo.nombre}
                                key={insumo.id}
                                onSelect={() => handleSelectInsumo(insumo)}
                              >
                                {insumo.nombre}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : (
                          <CommandEmpty>No se encontraron insumos.</CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
                {currentNombre && !initialData && !isSimilarInsumoFound && filteredInsumos && filteredInsumos.length > 0 && (
                  <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <p>Ya existe un insumo similar. ¿Deseas crear "{currentNombre}" como uno nuevo o usar una de las sugerencias?</p>
                  </div>
                )}
              </FormItem>
            )}
          />

          <InsumoBasicDetailsFormSection
            isLoading={isLoading}
            isConversionFactorEditable={isConversionFactorEditable}
            setIsConversionFactorEditable={setIsConversionFactorEditable}
            UNIDADES_BASE={UNIDADES_BASE}
            UNIDADES_COMPRA={UNIDADES_COMPRA}
            INSUMO_CATEGORIES={INSUMO_CATEGORIES}
          />
          <InsumoStockAndCostFormSection isLoading={isLoading} />

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
              {initialData ? "Guardar Cambios" : "Añadir Insumo"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default InsumoForm;