import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Insumo, InsumoFormValues } from "@/types";
import { useAddInsumo, useUpdateInsumo } from "@/hooks/useInsumos";
import { Loader2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    if (!val) return true; // Allow null or empty string
    // Regex for +51 followed by 9 digits
    return /^\+51\d{9}$/.test(val);
  }, {
    message: "El teléfono debe empezar con +51 y tener 9 dígitos (ej. +51987654321).",
  }),
  supplier_address: z.string().max(255, { // NEW: Added supplier_address to schema
    message: "La dirección del proveedor no debe exceder los 255 caracteres.",
  }).nullable(),
  category: z.string().min(1, {
    message: "Debe seleccionar una categoría.",
  }), // Added category to schema
});

interface InsumoFormProps {
  initialData?: Insumo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const UNIDADES_BASE = [
  "g", "ml", "unidad", "cucharadita", "cucharada", "taza", "onza", "libra"
];

const UNIDADES_COMPRA = [
  "kg", "litro", "unidad", "atado", "manojo", "caja", "paquete", "botella", "lata", "saco", "galón"
];

const INSUMO_CATEGORIES = [
  "Cereales y Legumbres",
  "Proteínas (Carnes, Aves, Pescados)",
  "Lácteos y Huevos",
  "Verduras y Hortalizas",
  "Frutas",
  "Grasas y Aceites",
  "Condimentos y Especias",
  "Panadería y Pastelería",
  "Bebidas",
  "Otros",
];

// Predefined common conversions (Purchase Unit to Base Unit)
const predefinedConversions: { [purchaseUnit: string]: { [baseUnit: string]: number } } = {
  "kg": { "g": 1000 },
  "litro": { "ml": 1000 },
  "unidad": { "unidad": 1 },
  // Add more common conversions here if needed, e.g., for US customary units
  // "galón": { "ml": 3785.41, "litro": 3.78541 },
  // "libra": { "g": 453.592, "onza": 16 },
};

const InsumoForm: React.FC<InsumoFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddInsumo();
  const updateMutation = useUpdateInsumo();
  const [isConversionFactorEditable, setIsConversionFactorEditable] = useState(true);
  // Removed isCostoUnitarioEditable state

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
      supplier_address: "", // NEW: Default value for new field
      category: "Otros", // Default category
    },
  });

  const purchaseUnit = form.watch("purchase_unit");
  const baseUnit = form.watch("base_unit");

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
        supplier_address: initialData.supplier_address || "", // NEW: Set initial value
        category: initialData.category || "Otros", // Set initial category
      });
      setIsConversionFactorEditable(true); // Always editable when editing an existing item
      // Removed setIsCostoUnitarioEditable(false);
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
        supplier_address: "", // NEW: Default value for new field
        category: "Otros", // Default category for new items
      });
      setIsConversionFactorEditable(true); // Editable by default for new items
      // Removed setIsCostoUnitarioEditable(true);
    }
  }, [initialData, form]);

  // Effect to suggest conversion factor based on selected units
  useEffect(() => {
    if (!initialData && purchaseUnit && baseUnit) { // Only suggest for new items
      const suggestedFactor = predefinedConversions[purchaseUnit]?.[baseUnit];
      if (suggestedFactor !== undefined) {
        form.setValue("conversion_factor", suggestedFactor, { shouldValidate: true });
        setIsConversionFactorEditable(false); // Disable if a suggestion is found
      } else if (purchaseUnit === baseUnit) {
        form.setValue("conversion_factor", 1.0, { shouldValidate: true });
        setIsConversionFactorEditable(false); // Disable if units are the same
      } else {
        // For non-standard or unknown conversions, keep current value or default to 1.0 if it's 0
        if (form.getValues("conversion_factor") === 0) {
          form.setValue("conversion_factor", 1.0, { shouldValidate: true });
        }
        setIsConversionFactorEditable(true); // Enable if no suggestion or different units
      }
    } else if (initialData) {
      setIsConversionFactorEditable(true); // Always editable when editing existing data
    }
  }, [purchaseUnit, baseUnit, form, initialData]);


  const onSubmit = async (values: InsumoFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, insumo: values });
    } else {
      await addMutation.mutateAsync(values);
    }
    onSuccess();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Insumo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Papa Amarilla"
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
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Categoría</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INSUMO_CATEGORIES.map((category) => (
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
          name="base_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Unidad Base (para recetas)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona una unidad base" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UNIDADES_BASE.map((unidad) => (
                    <SelectItem key={unidad} value={unidad}>
                      {unidad}
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
          name="purchase_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Unidad de Compra (al proveedor)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona una unidad de compra" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UNIDADES_COMPRA.map((unidad) => (
                    <SelectItem key={unidad} value={unidad}>
                      {unidad}
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
          name="conversion_factor"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Factor de Conversión (Unidad de Compra a Unidad Base)
                </FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-base p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Factor de Conversión</p>
                      <p className="text-gray-700 dark:text-gray-300">Indica cuántas unidades base (receta) hay en una unidad de compra (proveedor).</p>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-800 dark:text-gray-200">Ejemplo:</span> Si 1 kg (compra) = 1000 g (base), el factor es 1000.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {!isConversionFactorEditable && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConversionFactorEditable(true)}
                    className="ml-auto h-8 text-sm"
                    disabled={isLoading}
                  >
                    Editar
                  </Button>
                )}
              </div>
              <FormControl>
                <Input
                  type="number"
                  step="0.001"
                  placeholder="Ej. 1000 (si 1kg = 1000g)"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  className="h-12 text-base"
                  disabled={isLoading || !isConversionFactorEditable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="costo_unitario"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Costo Unitario (S/ por Unidad de Compra)</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-base p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                      <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Costo Unitario</p>
                      <p className="text-gray-700 dark:text-gray-300">Este costo se actualiza automáticamente al registrar una "Entrada por Compra" en Movimientos de Stock.</p>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-800 dark:text-gray-200">Nota:</span> Puedes editarlo manualmente si es necesario.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Removed conditional "Editar" button for costo_unitario */}
              </div>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ej. 2.50"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  className="h-12 text-base"
                  disabled={isLoading} // Always enabled, only disabled by overall form loading state
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad en Stock (en Unidad de Compra)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  placeholder="Ej. 100"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
          name="min_stock_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nivel Mínimo de Stock (en Unidad de Compra)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  placeholder="Ej. 10"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
          name="supplier_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Proveedor (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Distribuidora La Huerta"
                  {...field}
                  value={field.value || ""}
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
          name="supplier_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Teléfono del Proveedor (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. +51987654321"
                  {...field}
                  value={field.value || ""}
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
          name="supplier_address" // NEW: Added supplier_address field
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Dirección del Proveedor (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Av. Los Girasoles 123, Lima"
                  {...field}
                  value={field.value || ""}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
  );
};

export default InsumoForm;