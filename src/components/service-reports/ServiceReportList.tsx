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
import { Edit, Trash2, FileText } from "lucide-react";
import { ServiceReport } from "@/types";
import { useDeleteServiceReport } from "@/hooks/useServiceReports";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface ServiceReportListProps {
  reports: ServiceReport[];
  onEdit: (report: ServiceReport) => void;
}

const ServiceReportList: React.FC<ServiceReportListProps> = ({ reports, onEdit }) => {
  const deleteMutation = useDeleteServiceReport();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <FileText className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay reportes de servicio registrados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Fecha</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Servicio</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Platos Vendidos</TableHead> {/* New column */}
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Tickets Emitidos</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Colaciones Vendidas</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Ingresos Adicionales (S/)</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6">
                {format(new Date(report.report_date), "PPP", { locale: es })}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {report.meal_services?.name || "N/A"}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {report.platos_vendidos_data && report.platos_vendidos_data.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {report.platos_vendidos_data.map((pv) => (
                      <Badge key={pv.id} variant="secondary" className="text-sm">
                        {pv.platos?.nombre || "Plato Desconocido"} ({pv.quantity_sold})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">Ninguno</span>
                )}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {report.tickets_issued}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {report.meals_sold}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                S/ {report.additional_services_revenue.toFixed(2)}
              </TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(report)}
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
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el reporte de servicio del {format(new Date(report.report_date), "PPP", { locale: es })} para {report.meal_services?.name || "N/A"} de nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                      <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(report.id)}
                        className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceReportList;