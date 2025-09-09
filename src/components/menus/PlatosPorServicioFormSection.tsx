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
import { MealService, MealType, MenuFormValues, Plato } from "@/types";

interface PlatosPorServicioFormSectionProps {
  isLoading: boolean;
  availablePlatos: Plato[] | undefined;
  availableMealServices: MealService[] | undefined;
  availableMealTypes: MealType[] | undefined;
}

const PlatosPorServicioFormSection: React.FC<PlatosPorServicioFormSectionProps> = ({
  isLoading,
  availablePlatos,
  availableMealServices,
  availableMealTypes,
}) => {
  const form = useFormContext<MenuFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "platos_por_servicio",
  });

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Platos por Servicio</CardTitle>
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
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Selecciona un servicio" />
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
                  <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Plato</FormLabel>
                  <Select
                    onValueChange={platoField.onChange}
                    defaultValue={platoField.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Selecciona un plato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePlatos?.map((plato: Plato) => (
                        <SelectItem key={plato.id} value={plato.id}>
                          {plato.nombre}
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
              name={`platos_por_servicio.${index}.meal_type_id`}
              render={({ field: mealTypeField }) => (
                <FormItem className="flex-grow w-full md:w-1/3">
                  <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Tipo de Plato</FormLabel>
                  <Select
                    onValueChange={mealTypeField.onChange}
                    defaultValue={mealTypeField.value || ""}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Selecciona tipo de plato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMealTypes?.map((mealType: MealType) => (
                        <SelectItem key={mealType.id} value={mealType.id}>
                          {mealType.name}
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
                  <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Cantidad</FormLabel>
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
          onClick={() => append({ meal_service_id: "", plato_id: "", meal_type_id: null, quantity_needed: 1 })}
          className="w-full mt-4 px-6 py-3 text-lg"
          disabled={isLoading}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Plato a Servicio
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlatosPorServicioFormSection;