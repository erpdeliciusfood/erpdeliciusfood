import React from 'react';
import { QuebradoDayDetail, MEAL_SERVICES_ORDER } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Utensils, Soup, Salad, Fish, Drumstick, Wheat, GlassWater, Cookie } from 'lucide-react';

interface QuebradoAgendaViewProps {
  data: QuebradoDayDetail[];
}

const getServiceIcon = (serviceName: string) => {
  const lowerCaseName = serviceName.toLowerCase();
  if (lowerCaseName.includes('desayuno')) return <Utensils className="h-5 w-5" />;
  if (lowerCaseName.includes('almuerzo')) return <Drumstick className="h-5 w-5" />;
  if (lowerCaseName.includes('cena')) return <Fish className="h-5 w-5" />;
  if (lowerCaseName.includes('sopa')) return <Soup className="h-5 w-5" />;
  if (lowerCaseName.includes('ensalada')) return <Salad className="h-5 w-5" />;
  if (lowerCaseName.includes('bebida') || lowerCaseName.includes('refresco')) return <GlassWater className="h-5 w-5" />;
  if (lowerCaseName.includes('postre')) return <Cookie className="h-5 w-5" />;
  return <Wheat className="h-5 w-5" />;
};

const QuebradoAgendaView: React.FC<QuebradoAgendaViewProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No hay datos de menú planificados para mostrar en la agenda.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {data.map((day) => (
        <Card key={day.date} className="flex flex-col">
          <CardHeader>
            <CardTitle className="capitalize text-xl">{day.dayOfWeek}</CardTitle>
            <p className="text-sm text-muted-foreground">{day.date}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <Accordion type="multiple" className="w-full">
              {day.services
                .sort((a, b) => {
                  const indexA = MEAL_SERVICES_ORDER.indexOf(a.serviceName);
                  const indexB = MEAL_SERVICES_ORDER.indexOf(b.serviceName);
                  return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                })
                .map((service) => (
                <AccordionItem value={service.serviceId} key={service.serviceId}>
                  <AccordionTrigger className="text-lg font-medium">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(service.serviceName)}
                      {service.serviceName}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {service.recipes.length > 0 ? (
                      <div className="space-y-4">
                        {service.recipes.map((recipe) => (
                          <div key={recipe.recipeId} className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold text-base flex justify-between items-center">
                              {recipe.recipeName}
                              <Badge variant="secondary">Raciones: {recipe.dinerCount}</Badge>
                            </h4>
                            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {recipe.insumos.map((insumo) => (
                                <li key={insumo.insumoId}>
                                  {insumo.insumoName}: <span className="font-medium text-foreground">{insumo.quantityNeeded} {insumo.unit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No hay recetas asignadas a este servicio.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuebradoAgendaView;