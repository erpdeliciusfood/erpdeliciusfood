import React from "react";
import { DailyMenuBreakdown } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface MenuBreakdownListProps {
  breakdown: DailyMenuBreakdown[];
}

const MenuBreakdownList: React.FC<MenuBreakdownListProps> = ({ breakdown }) => {
  return (
    <div className="space-y-6">
      {breakdown.map((dailyBreakdown) => (
        <Card key={dailyBreakdown.date} className="shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {format(parseISO(dailyBreakdown.date), "EEEE, dd 'de' MMMM", { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyBreakdown.mealServicesBreakdown.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {dailyBreakdown.mealServicesBreakdown.map((service) => (
                  <AccordionItem value={service.serviceId} key={service.serviceId}>
                    <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                      {service.serviceName}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Categoría</TableHead>
                              <TableHead>Receta</TableHead>
                              <TableHead className="text-right">Cantidad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {service.categories.flatMap((category) =>
                              category.dishes.map((dish, index) => (
                                <TableRow key={`${dish.platoId}-${index}`}> {/* Corrected from recetaId to platoId */}
                                  {index === 0 && (
                                    <TableCell
                                      rowSpan={category.dishes.length}
                                      className="font-medium align-top"
                                    >
                                      {category.categoryName}
                                    </TableCell>
                                  )}
                                  <TableCell>{dish.recetaNombre}</TableCell>
                                  <TableCell className="text-right">{dish.quantityNeeded}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No hay servicios de comida para este día.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MenuBreakdownList;