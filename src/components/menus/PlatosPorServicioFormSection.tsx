import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MealService, MenuFormValues, Receta } from "@/types"; // Changed Plato to Receta

interface PlatosPorServicioFormSectionProps {
  isLoading: boolean;
  availablePlatos: Receta[] | undefined; // Changed type
  availableMealServices: MealService[] | undefined;
}

const DISH_CATEGORIES = [
  "Desayuno / Merienda",
  "Entrada",
  "Sopa / Crema",
  "Ensalada Fría",
  "Ensalada Caliente",
  "Plato de Fondo - Carnes",
  "Plato de Fondo - Aves",
  "Plato de Fondo - Pescados y Mariscos",
  "Plato de Fondo - Pastas y Arroces",
  "Plato de Fondo - Vegetariano / Vegano",
  "Acompañamiento / Guarnición",
  "Postre",
  "Bebida",
  "Dieta Blanda",
  "Otra Opción",
];

const PlatosPorServicioFormSection: React.FC<PlatosPorServicioFormSectionProps> = ({
  isLoading,
  availablePlatos,
  availableMealServices,
}) => {
  const form = useFormContext<MenuFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "platos_por_servicio",
  });

  const platoPlaceholder = () => {
    if (isLoading) return "Cargando recetas..."; // Changed text
    if (!availablePlatos || availablePlatos.length === 0) return "No hay recetas disponibles"; // Changed text
    return "Selecciona una receta"; // Changed text
  };

  const mealServicePlaceholder = () => {
    if (isLoading) return "Cargando servicios...";
    if (!availableMealServices || availableMealServices.length === 0) return "No hay servicios disponibles";
    return "Selecciona un servicio";
  };

  const dishCategoryPlaceholder = () => {
    if (isLoading) return "Cargando categorías...";
    return "Selecciona una categoría";
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Recetas por Servicio</CardTitle> {/* Changed text */}
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col md:flex-row gap-4 items-end border-b pb-4 last:border-b-0 last:pb-0">
            <FormField
              control={form.control}
              name={`platos_por_servicio.${index}.meal_service_id`}
              render={({ field: serviceField }) => (
                <FormItem className="flex-grow w-full md:w-1/3">
                  <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Servicio</FormLabel>
                  <Select
                    onValueChange={serviceField.onChange}
                    defaultValue={serviceField.value}
                    disabled={isLoading || !availableMealServices || availableMealServices.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder={mealServicePlaceholder()} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMealServices?.map((service: MealService) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
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
              name={`platos_por_servicio.${index}.plato_id`}
              render={({ field: platoField }) => (
                <FormItem className="flex-grow w-full md:w-1/3">
                  <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Receta</FormLabel> {/* Changed text */}
                  <Select
                    onValueChange={platoField.onChange}
                    defaultValue={platoField.value}
                    disabled={isLoading || !availablePlatos || availablePlatos.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder={platoPlaceholder()} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePlatos?.map((receta: Receta) => ( // Changed type
                        <SelectItem key={receta.id} value={receta.id}>
                          {receta.nombre}
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
              name={`platos_por_servicio.${index}.dish_category`}
              render={({ field: categoryField }) => (
                <FormItem className="flex-grow w-full md:w-1/3">
                  <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Categoría de Receta</FormLabel> {/* Changed text */}
                  <Select
                    onValueChange={categoryField.onChange}
                    defaultValue={categoryField.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder={dishCategoryPlaceholder()} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DISH_CATEGORIES.map((category) => (
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
              name={`platos_por_servicio.${index}.quantity_needed`}
              render={({ field: quantityField }) => (
                <FormItem className="w-full md:w-1/4">
                  <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Cantidad (Raciones por Servicio)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="Cantidad"
                      {...quantityField}
                      onChange={(e) => quantityField.onChange(parseInt(e.target.value))}
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
          onClick={() => append({ meal_service_id: "", plato_id: "", dish_category: "", quantity_needed: 1 })}
          className="w-full mt-4 px-6 py-3 text-lg"
          disabled={isLoading || !availablePlatos || availablePlatos.length === 0 || !availableMealServices || availableMealServices.length === 0}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Receta a Servicio {/* Changed text */}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlatosPorServicioFormSection;