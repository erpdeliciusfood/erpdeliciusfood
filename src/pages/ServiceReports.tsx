import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle, FileText } from "lucide-react";
import { useServiceReports } from "@/hooks/useServiceReports";
import ServiceReportList from "@/components/service-reports/ServiceReportList";
import ServiceReportForm from "@/components/service-reports/ServiceReportForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ServiceReport } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo"; // NEW: Import PageHeaderWithLogo

const ServiceReports = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ServiceReport | null>(null);

  const { data: reports, isLoading, isError, error } = useServiceReports();

  const handleAddClick = () => {
    setEditingReport(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (report: ServiceReport) => {
    setEditingReport(report);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingReport(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando reportes de servicio...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los reportes de servicio: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Reportes de Servicio"
        description="Registra y consulta los detalles de cada servicio de comida."
        icon={FileText}
        hideLogo={true} {/* NEW: Hide logo for pages within MainLayout */}
      />
      <div className="flex justify-end items-center mb-6"> {/* Adjusted layout for buttons */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Crear Reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingReport ? "Editar Reporte de Servicio" : "Crear Nuevo Reporte de Servicio"}
              </DialogTitle>
            </DialogHeader>
            <ServiceReportForm
              initialData={editingReport}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-grow">
        {reports && reports.length > 0 ? (
          <ServiceReportList reports={reports} onEdit={handleEditClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <FileText className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay reportes de servicio registrados. ¡Crea el primero!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Reporte Ahora
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default ServiceReports;