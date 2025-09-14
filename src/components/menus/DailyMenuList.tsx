import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UtensilsCrossed, CalendarDays, ChevronDown, CheckCircle2 } from "lucide-react";
import { MenuWithRelations, MEAL_SERVICES_ORDER, MenuPlatoWithRelations } from "@/types"; // Changed Menu to MenuWithRelations, removed MenuPlato
import { useDeleteMenu } from "@/hooks/useMenus";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useMealServices } from "@/hooks/useMealServices";
import { Badge } from "@/components/ui/badge";
import { parseISO } from "date-fns"; // Import parseISO

interface DailyMenuListProps {
  menus: MenuWithRelations[]; // Updated type
  onEdit: (menu: MenuWithRelations) => void; // Updated type
}

const DailyMenuList: React.FC<DailyMenuListProps> = ({ menus, onEdit }) => {
  const deleteMutation = useDeleteMenu();
  const { data: _availableMealServices, isLoading: isLoadingMealServices } = useMealServices();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (menus.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay menús registrados para este día.</p>
        <p className="text-md mt-2">Haz clic en "Añadir Menú para este día" para empezar.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Título</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Tipo</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[250px]">Servicios</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menus.map((menu) => {
            const mealServiceStatus: { [key: string]: boolean } = {};
            MEAL_SERVICES_ORDER.forEach(type => {
              mealServiceStatus[type] = false; // Initialize all to false
            });

            menu.menu_platos?.forEach((mp: MenuPlatoWithRelations) => {
              const serviceName = mp.meal_services?.name;
              if (serviceName && MEAL_SERVICES_ORDER.includes(serviceName)) {
                mealServiceStatus[serviceName] = true;
              }
            });

            // Group platos by meal service and then by dish category for detailed display
            const platosGroupedByServiceAndCategory = menu.menu_platos?.reduce((acc: { [serviceName: string]: { [dishCategory: string]: MenuPlatoWithRelations[] } }, mp: MenuPlatoWithRelations) => {
              const serviceName = mp.meal_services?.name || "Sin Servicio";
              const dishCategory = mp.dish_category || "Sin Categoría"; // NEW: Use dish_category
              if (!acc[serviceName]) {
                acc[serviceName] = {};
              }
              if (!acc[serviceName][dishCategory]) {
                acc[serviceName][dishCategory] = [];
              }
              acc[serviceName][dishCategory].push(mp);
              return acc;
            }, {} as { [serviceName: string]: { [dishCategory: string]: MenuPlatoWithRelations[] } });

            return (
              <React.Fragment key={menu.id}>
                <TableRow className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
                  <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[180px]">{menu.title}</TableCell>
                  <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[150px]">
                    {menu.menu_date ? (
                      <span className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Menú Diario
                      </span>
                    ) : menu.event_types ? (
                      <span className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {menu.event_types.name}
                      </span>
                    ) : "N/A"}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-left min-w-[250px]">
                    {isLoadingMealServices ? (
                      <span className="text-sm text-gray-500">Cargando...</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {MEAL_SERVICES_ORDER.map(type => (
                          <Badge
                            key={type}
                            variant={mealServiceStatus[type] ? "default" : "secondary"}
                            className={`capitalize ${mealServiceStatus[type] ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                          >
                            {type}
                            {mealServiceStatus[type] ? <CheckCircle2 className="ml-1 h-3 w-3" /> : <span className="ml-1 text-red-500">✕</span>}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="flex justify-center space-x-2 py-3 px-6 min-w-[150px]">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(menu)}
                      className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el menú <span className="font-semibold">{menu.title}</span> y sus recetas asociadas de nuestros servidores. {/* Changed text */}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                          <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(menu.id)}
                            className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
                {menu.menu_platos && menu.menu_platos.length > 0 && (
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableCell colSpan={4} className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`item-${menu.id}`} className="border-none">
                          <AccordionTrigger className="flex items-center justify-between w-full px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 ease-in-out">
                            Ver Recetas del Menú {/* Changed text */}
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                          </AccordionTrigger>
                          <AccordionContent className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Detalles de Recetas:</h4> {/* Changed text */}
                            {Object.entries(platosGroupedByServiceAndCategory as Record<string, Record<string, MenuPlatoWithRelations[]>> || {}).sort(([serviceA], [serviceB]) => {
                              // Sort services by predefined order
                              const indexA = MEAL_SERVICES_ORDER.indexOf(serviceA);
                              const indexB = MEAL_SERVICES_ORDER.indexOf(serviceB);
                              if (indexA === -1) return 1; // Unknown services last
                              if (indexB === -1) return -1;
                              return indexA - indexB;
                            }).map(([serviceName, dishCategories]) => (
                              <div key={serviceName} className="mb-4 last:mb-0">
                                <h5 className="text-md font-bold text-gray-800 dark:text-gray-200 mb-2 capitalize">{serviceName}</h5>
                                {Object.entries(dishCategories as Record<string, MenuPlatoWithRelations[]>).map(([dishCategory, platos]: [string, MenuPlatoWithRelations[]]) => ( // Explicitly cast dishCategories
                                  <div key={dishCategory} className="ml-4 mb-2 last:mb-0">
                                    <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 capitalize">{dishCategory}:</h6>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                                      {platos?.map((mp: MenuPlatoWithRelations, idx: number) => (
                                        <li key={idx} className="text-base">
                                          <span className="font-medium text-gray-800 dark:text-gray-200">{mp.platos?.nombre || "Receta Desconocida"}</span> {/* Changed text */}
                                          {" "} (Cantidad: {mp.quantity_needed})
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DailyMenuList;