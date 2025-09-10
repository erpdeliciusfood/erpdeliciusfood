import { useState, useEffect } from "react";
import { Loader2, Warehouse as WarehouseIcon, CalendarDays, UtensilsCrossed, CheckCircle2, AlertTriangle } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, formatISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAggregatedInsumoNeeds, useDeductDailyPrepStock } from "@/hooks/useMenuInsumoNeeds";
import { useMenus } from "@/hooks/useMenus";
import { Menu } from "@/types";
import { useSession } from "@/contexts/SessionContext";
import { Navigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Warehouse = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMenuId, setSelectedMenuId] = useState<string | undefined>(undefined);

  const formattedSelectedDate = selectedDate ? formatISO(selectedDate, { representation: 'date' }) : undefined;

  const { data: menusForDate, isLoading: isLoadingMenus, isError: isErrorMenus, error: errorMenus } = useMenus(formattedSelectedDate, formattedSelectedDate);
  const { data: aggregatedNeeds, isLoading: isLoadingNeeds, isError: isErrorNeeds, error: errorNeeds } = useAggregatedInsumoNeeds(selectedMenuId ? formattedSelectedDate : undefined); // Fetch needs only if a menu is selected
  const deductStockMutation = useDeductDailyPrepStock();

  const userRole = session?.user?.user_metadata?.role;

  // Redirect if not admin or warehouse user
  if (isSessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando sesión...</p>
      </div>
    );
  }

  if (!session || (userRole !== 'admin' && userRole !== 'warehouse')) {
    return <Navigate to="/" replace />; // Redirect non-authorized users
  }

  useEffect(() => {
    // Automatically select the first menu if available when date changes
    if (menusForDate && menusForDate.length > 0 && !selectedMenuId) {
      setSelectedMenuId(menusForDate[0].id);
    } else if (!menusForDate || menusForDate.length === 0) {
      setSelectedMenuId(undefined);
    }
  }, [menusForDate, selectedMenuId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedMenuId(undefined); // Reset selected menu when date changes
  };

  const handleDeductStock = async () => {
    if (!selectedMenuId || !aggregatedNeeds) return;

    const insumoNeedsToDeduct = aggregatedNeeds.map(need => ({
      insumo_id: need.insumo_id,
      quantity_to_deduct: need.total_needed_purchase_unit,
      current_stock_quantity: need.current_stock_quantity,
    }));

    try {
      await deductStockMutation.mutateAsync({ menuId: selectedMenuId, insumoNeeds: insumoNeedsToDeduct });
      // Invalidate queries to refresh stock and needs after deduction
      // These are already handled by the mutation's onSuccess
    } catch (error) {
      // Error handling is done in the mutation's onError
    }
  };

  const isLoading = isLoadingMenus || isLoadingNeeds || deductStockMutation.isPending;
  const isError = isErrorMenus || isErrorNeeds || deductStockMutation.isError;
  const error = errorMenus || errorNeeds || deductStockMutation.error;

  const currentMenu = menusForDate?.find(menu => menu.id === selectedMenuId);

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
          <WarehouseIcon className="mr-4 h-10 w-10 text-primary dark:text-primary-foreground" />
          Gestión de Almacén (Preparación Diaria)
        </h1>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal h-12 text-base",
                  !selectedDate && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: es })
                ) : (
                  <span>Selecciona una fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date("1900-01-01") || isLoading}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isError && (
        <div className="text-center py-10 text-red-600 dark:text-red-400">
          <h1 className="text-2xl font-bold mb-4">Error al cargar datos</h1>
          <p className="text-lg">No se pudieron cargar los datos: {error?.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando datos de almacén...</p>
        </div>
      )}

      {!isLoading && !isError && selectedDate && (
        <>
          <Card className="mb-6 shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Menús para el {format(selectedDate, "PPP", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {menusForDate && menusForDate.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-lg text-gray-700 dark:text-gray-300">Selecciona el menú para el cual deseas debitar insumos:</p>
                  <div className="flex flex-wrap gap-3">
                    {menusForDate.map((menu: Menu) => (
                      <Button
                        key={menu.id}
                        variant={selectedMenuId === menu.id ? "default" : "outline"}
                        onClick={() => setSelectedMenuId(menu.id)}
                        className={cn(
                          "px-6 py-3 text-lg",
                          selectedMenuId === menu.id ? "bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary" : "bg-secondary text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary"
                        )}
                      >
                        {menu.title}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-600 dark:text-gray-400">
                  <UtensilsCrossed className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
                  <p className="text-lg">No hay menús planificados para esta fecha.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedMenuId && currentMenu && (
            <Card className="mb-6 shadow-lg dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Insumos Necesarios para "{currentMenu.title}"
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aggregatedNeeds && aggregatedNeeds.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Necesidad (Unidad Base)</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Necesidad (Unidad Compra)</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Actual (Unidad Compra)</TableHead>
                          <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aggregatedNeeds.map((need) => {
                          const hasEnoughStock = need.current_stock_quantity >= need.total_needed_purchase_unit;
                          return (
                            <TableRow key={need.insumo_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{need.insumo_nombre}</TableCell>
                              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                                {need.total_needed_base_unit.toFixed(2)} {need.base_unit}
                              </TableCell>
                              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                                {need.total_needed_purchase_unit.toFixed(2)} {need.purchase_unit}
                              </TableCell>
                              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                                {need.current_stock_quantity.toFixed(2)} {need.purchase_unit}
                              </TableCell>
                              <TableCell className="text-center">
                                {hasEnoughStock ? (
                                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Suficiente
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <AlertTriangle className="h-4 w-4 mr-1" /> Insuficiente
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <div className="flex justify-end mt-6">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="px-8 py-4 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
                            disabled={isLoading || aggregatedNeeds.some(need => need.current_stock_quantity < need.total_needed_purchase_unit)}
                          >
                            Debitar Insumos para Preparación
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="p-6">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Confirmar Débito de Insumos</AlertDialogTitle>
                            <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                              Estás a punto de debitar los insumos necesarios para la preparación del menú "{currentMenu.title}" del stock. Esta acción registrará un movimiento de salida en tu inventario.
                              <br/><br/>
                              ¿Estás seguro de que deseas continuar?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                            <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeductStock}
                              className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                              disabled={deductStockMutation.isPending}
                            >
                              {deductStockMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                              Confirmar Débito
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-600 dark:text-gray-400">
                    <UtensilsCrossed className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
                    <p className="text-lg">No se encontraron insumos necesarios para este menú.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default Warehouse;