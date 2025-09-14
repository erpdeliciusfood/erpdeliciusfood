"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UtensilsCrossed, Edit, Save, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useServiceReports, useUpdateServiceReport } from "@/hooks/useServiceReports";
import { useMealServices } from "@/hooks/useMealServices";
import { ServiceReportWithRelations, ServiceReportFormValues, ServiceReportPlatoWithRelations } from "@/types"; // Updated import
import { showSuccess, showError } from "@/utils/toast";

interface RationAccountingReportProps {
  startDate: Date;
  endDate: Date;
}

const RationAccountingReport: React.FC<RationAccountingReportProps> = ({ startDate, endDate }) => {
  const { data: serviceReports, isLoading, isError, error } = useServiceReports();
  const { data: mealServices, isLoading: isLoadingMealServices } = useMealServices();
  const updateServiceReportMutation = useUpdateServiceReport();

  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editedTicketsIssued, setEditedTicketsIssued] = useState<number>(0);
  const [editedMealsSold, setEditedMealsSold] = useState<number>(0);

  const filteredReports = serviceReports?.filter(report =>
    report.report_date &&
    parseISO(report.report_date) >= startDate &&
    parseISO(report.report_date) <= endDate
  ).sort((a, b) => parseISO(b.report_date).getTime() - parseISO(a.report_date).getTime());

  useEffect(() => {
    if (editingReportId && filteredReports) {
      const currentReport = filteredReports.find(r => r.id === editingReportId);
      if (currentReport) {
        setEditedTicketsIssued(currentReport.tickets_issued);
        setEditedMealsSold(currentReport.meals_sold);
      }
    }
  }, [editingReportId, filteredReports]);

  const handleEditClick = (report: ServiceReportWithRelations) => { // Updated type
    setEditingReportId(report.id);
    setEditedTicketsIssued(report.tickets_issued);
    setEditedMealsSold(report.meals_sold);
  };

  const handleSaveClick = async (report: ServiceReportWithRelations) => { // Updated type
    if (editedMealsSold < 0 || editedTicketsIssued < 0) {
      showError("Las cantidades no pueden ser negativas.");
      return;
    }
    if (editedMealsSold > editedTicketsIssued) {
      showError("Las colaciones vendidas no pueden ser mayores que los tickets emitidos.");
      return;
    }

    try {
      const updatedReportData: ServiceReportFormValues = {
        report_date: report.report_date,
        meal_service_id: report.meal_service_id,
        tickets_issued: editedTicketsIssued,
        meals_sold: editedMealsSold,
        additional_services_revenue: report.additional_services_revenue,
        notes: report.notes,
        menu_id: report.menu_id, // Ensure menu_id is passed
        platos_vendidos: report.service_report_platos?.map((srp: ServiceReportPlatoWithRelations) => ({
          plato_id: srp.plato_id,
          quantity_sold: srp.quantity_sold,
        })) || [],
      };

      await updateServiceReportMutation.mutateAsync({
        id: report.id,
        report: updatedReportData,
      });
      showSuccess("Raciones actualizadas exitosamente.");
      setEditingReportId(null);
    } catch (err: any) {
      showError(`Error al guardar las raciones: ${err.message}`);
    }
  };

  const handleCancelClick = () => {
    setEditingReportId(null);
  };

  if (isLoading || isLoadingMealServices) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Contabilidad de Raciones
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando reportes de raciones...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Contabilidad de Raciones
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10 text-red-600 dark:text-red-400">
          <h1 className="text-2xl font-bold mb-4">Error al cargar datos</h1>
          <p className="text-lg">No se pudieron cargar los reportes de servicio: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!filteredReports || filteredReports.length === 0) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Contabilidad de Raciones
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6 text-gray-600 dark:text-gray-400">
          <UtensilsCrossed className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
          <p className="text-lg">No hay reportes de servicio para el período seleccionado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Contabilidad de Raciones ({format(startDate, "PPP", { locale: es })} - {format(endDate, "PPP", { locale: es })})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 min-w-[120px]">Fecha</TableHead>
                <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">Servicio</TableHead>
                <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 min-w-[200px]">Menú Asociado</TableHead> {/* Adjusted min-width */}
                <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 min-w-[120px]">Tickets Emitidos</TableHead>
                <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 min-w-[120px]">Colaciones Vendidas</TableHead>
                <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map(report => (
                <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="text-base text-gray-800 dark:text-gray-200">
                    {format(parseISO(report.report_date), "PPP", { locale: es })}
                  </TableCell>
                  <TableCell className="text-base text-gray-700 dark:text-gray-300">
                    {mealServices?.find(s => s.id === report.meal_service_id)?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-base text-gray-700 dark:text-gray-300">
                    {report.menus ? (
                      <div className="flex flex-col">
                        <span className="font-semibold">{report.menus.title}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {report.menus.menu_date ? format(parseISO(report.menus.menu_date), "PPP", { locale: es }) : report.menus.event_types?.name || "Sin Fecha"}
                        </span>
                      </div>
                    ) : "N/A"}
                  </TableCell>
                  <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                    {editingReportId === report.id ? (
                      <Input
                        type="number"
                        value={editedTicketsIssued}
                        onChange={(e) => setEditedTicketsIssued(parseInt(e.target.value))}
                        className="w-24 text-right h-8"
                        min="0"
                      />
                    ) : (
                      report.tickets_issued
                    )}
                  </TableCell>
                  <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                    {editingReportId === report.id ? (
                      <Input
                        type="number"
                        value={editedMealsSold}
                        onChange={(e) => setEditedMealsSold(parseInt(e.target.value))}
                        className="w-24 text-right h-8"
                        min="0"
                      />
                    ) : (
                      report.meals_sold
                    )}
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    {editingReportId === report.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveClick(report)}
                          disabled={updateServiceReportMutation.isPending}
                          title="Guardar cambios"
                        >
                          {updateServiceReportMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Save className="h-5 w-5 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelClick}
                          disabled={updateServiceReportMutation.isPending}
                          title="Cancelar edición"
                        >
                          <XCircle className="h-5 w-5 text-red-600" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(report)}
                        title="Editar raciones"
                      >
                        <Edit className="h-5 w-5 text-blue-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RationAccountingReport;