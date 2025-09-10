import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Insumo, InsumoFormValues } from "@/types";
import { useAddInsumo, useUpdateInsumo } from "@/hooks/useInsumos";
import { Loader2 } from "lucide-react";
import InsumoBasicDetailsFormSection from "./InsumoBasicDetailsFormSection";
import InsumoStockAndCostFormSection from "./InsumoStockAndCostFormSection";
import InsumoSupplierFormSection from "./InsumoSupplierFormSection";

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
};

const InsumoForm: React.FC<InsumoFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddInsumo();
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
      supplier_name: "",
      supplier_phone: "",
      supplier_address: "",
      category: "Otros",
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
        supplier_address: initialData.supplier_address || "",
        category: initialData.category || "Otros",
      });
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
        supplier_name: "",
        supplier_phone: "",
        supplier_address: "",
        category: "Otros",
      });
      setIsConversionFactorEditable(true);
    }
  }, [initialData, form]);

  useEffect(() => {
    if (!initialData && purchaseUnit && baseUnit) {
      const suggestedFactor = predefinedConversions[purchaseUnit]?.[baseUnit];
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
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, insumo: values });
    } else {
      await addMutation.mutateAsync(values);
    }
    onSuccess();
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
          <InsumoSupplierFormSection isLoading={isLoading} />

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