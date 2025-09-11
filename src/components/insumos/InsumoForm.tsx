import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Insumo, InsumoFormValues } from "@/types";
import { useCreateInsumo, useUpdateInsumo } from "@/hooks/useInsumos";
import { Loader2 } from "lucide-react";
import InsumoBasicDetailsFormSection from "./InsumoBasicDetailsFormSection";
import InsumoStockAndCostFormSection from "./InsumoStockAndCostFormSection";

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
  category: z.string().min(1, {
    message: "Debe seleccionar una categoría.",
  }),
  // Removed system-managed stock fields from direct form input
  // pending_reception_quantity: z.coerce.number().optional(),
  // pending_delivery_quantity: z.coerce.number().optional(),
  // last_physical_count_quantity: z.coerce.number().optional(),
  // last_physical_count_date: z.string().nullable().optional(),
  // discrepancy_quantity: z.coerce.number().optional(),
});

interface InsumoFormProps {
  initialData?: InsumoFormValues | null;
  onSuccess: (newInsumo: Insumo) => Promise<void> | void; // Adjusted type to accept Promise<void> and ensure newInsumo is always provided
  onCancel: () => void;
}

const UNIDADES_BASE = [
  "g", "ml", "unidad", "cucharadita", "cucharada", "taza", "onza", "libra"
];

const UNIDADES_COMPRA = [
  "kg", "litro", "unidad", "atado", "manojo", "caja", "paquete", "botella", "lata", "saco", "galón"
];

const INSUMO_CATEGORIES = [
  "Cereales",
  "Legumbres",
  "Carbohidrato / Cereales",
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
};

const InsumoForm: React.FC<InsumoFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useCreateInsumo();
  const updateMutation = useUpdateInsumo();
  const [isConversionFactorEditable, setIsConversionFactorEditable] = useState(true);

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
      category: "Otros",
      // Set default values for system-managed fields to ensure they are always numbers/null
      pending_reception_quantity: 0,
      pending_delivery_quantity: 0,
      last_physical_count_quantity: 0,
      last_physical_count_date: null,
      discrepancy_quantity: 0,
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
        category: initialData.category || "Otros",
        // Ensure system-managed fields are passed from initialData if available, otherwise default
        pending_reception_quantity: initialData.pending_reception_quantity ?? 0,
        pending_delivery_quantity: initialData.pending_delivery_quantity ?? 0,
        last_physical_count_quantity: initialData.last_physical_count_quantity ?? 0,
        last_physical_count_date: initialData.last_physical_count_date || null,
        discrepancy_quantity: initialData.discrepancy_quantity ?? 0,
      });
      // When editing an existing insumo, the conversion factor should always be editable by default.
      setIsConversionFactorEditable(true);
    } else {
      form.reset({
        nombre: "",
        base_unit: "",
        purchase_unit: "",
        conversion_factor: 1.0,
        costo_unitario: 0,
        stock_quantity: 0,
        min_stock_level: 0,
        category: "Otros",
        // Reset system-managed fields to their defaults for new forms
        pending_reception_quantity: 0,
        pending_delivery_quantity: 0,
        last_physical_count_quantity: 0,
        last_physical_count_date: null,
        discrepancy_quantity: 0,
      });
      setIsConversionFactorEditable(true);
    }
  }, [initialData, form]);

  useEffect(() => {
    // Check if it's a new insumo being created (either completely new or pre-filled from search)
    const isNewInsumoBeingCreated = !initialData || !(initialData as Insumo).id;

    if (isNewInsumoBeingCreated && purchaseUnit && baseUnit) {
      const suggestedFactor = predefinedConversions[purchaseUnit]?.[baseUnit];
      if (suggestedFactor !== undefined) {
        form.setValue("conversion_factor", suggestedFactor, { shouldValidate: true });
        setIsConversionFactorEditable(false);
      } else if (purchaseUnit === baseUnit) {
        form.setValue("conversion_factor", 1.0, { shouldValidate: true });
        setIsConversionFactorEditable(false);
      } else {
        // If no predefined conversion and units are different, allow editing
        if (form.getValues("conversion_factor") === 0) {
          form.setValue("conversion_factor", 1.0, { shouldValidate: true });
        }
        setIsConversionFactorEditable(true);
      }
    } else if (initialData && (initialData as Insumo).id) {
      // When editing an existing insumo, the conversion factor should always be editable by default.
      setIsConversionFactorEditable(true);
    }
  }, [purchaseUnit, baseUnit, form, initialData]);

  const onSubmit = async (values: InsumoFormValues) => {
    if (initialData && (initialData as Insumo).id) {
      await updateMutation.mutateAsync({ id: (initialData as Insumo).id, updates: values });
      onSuccess(values as Insumo);
    } else {
      const newInsumo = await addMutation.mutateAsync(values);
      onSuccess(newInsumo);
    }
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
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
              {initialData && (initialData as Insumo).id ? "Guardar Cambios" : "Añadir Insumo"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default InsumoForm;