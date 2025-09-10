import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InsumoFormValues } from "@/types";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface InsumoBasicDetailsFormSectionProps {
  isLoading: boolean;
  isConversionFactorEditable: boolean;
  setIsConversionFactorEditable: (editable: boolean) => void;
  UNIDADES_BASE: string[];
  UNIDADES_COMPRA: string[];
  INSUMO_CATEGORIES: string[];
}

const InsumoBasicDetailsFormSection: React.FC<InsumoBasicDetailsFormSectionProps> = ({
  isLoading,
  isConversionFactorEditable,
  setIsConversionFactorEditable,
  UNIDADES_BASE,
  UNIDADES_COMPRA,
  INSUMO_CATEGORIES,
}) => {
  const form = useFormContext<InsumoFormValues>();

  return (
    <>
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
    </>
  );
};

export default InsumoBasicDetailsFormSection;