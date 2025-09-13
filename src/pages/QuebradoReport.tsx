import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, Utensils, FileText, CalendarCheck, ListCollapse } from "lucide-react";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { generateQuebradoReport } from "@/integrations/supabase/quebrado";
import { showError } from "@/utils/toast";
import { QuebradoReportData } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuebradoAgendaView from "../components/quebrado/QuebradoAgendaView";
import QuebradoConsolidatedView from "../components/quebrado/QuebradoConsolidatedView";
import { Button } from "@/components/ui/button";

const QuebradoReport: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<QuebradoReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const startDate = queryParams.get("startDate");
    const endDate = queryParams.get("endDate");
    const dinerCount = queryParams.get("dinerCount");

    if (!startDate || !endDate || !dinerCount) {
      showError("Faltan parámetros para generar el reporte de Quebrado.");
      navigate("/purchase-planning");
      return;
    }

    const fetchReport = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const data = await generateQuebradoReport(startDate, endDate, parseInt(dinerCount));
        setReportData(data);
      } catch (err: any) {
        setIsError(true);
        setErrorMessage(err.message);
        showError(`Error al cargar el reporte de Quebrado: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [location.search, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Generando reporte de Quebrado...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error al generar reporte</h1>
        <p className="text-xl">No se pudo generar el reporte de Quebrado: {errorMessage}</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <FileText className="h-12 w-12 text-gray-500 dark:text-gray-400" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">No hay datos de reporte disponibles.</p>
      </div>
    );
  }

  const queryParams = new URLSearchParams(location.search);
  const startDate = queryParams.get("startDate");
  const endDate = queryParams.get("endDate");

  const formattedStartDate = startDate ? format(new Date(startDate + 'T00:00:00'), "PPP", { locale: es }) : "N/A";
  const formattedEndDate = endDate ? format(new Date(endDate + 'T00:00:00'), "PPP", { locale: es }) : "N/A";

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Reporte de Quebrado de Menús"
        description={`Resumen de insumos necesarios del ${formattedStartDate} al ${formattedEndDate}.`}
        icon={Utensils}
      />

      <Tabs defaultValue="agenda" className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="agenda">
              <CalendarCheck className="mr-2 h-4 w-4" />
              Vista Agenda
            </TabsTrigger>
            <TabsTrigger value="consolidado">
              <ListCollapse className="mr-2 h-4 w-4" />
              Vista Consolidada
            </TabsTrigger>
          </TabsList>
          {/* Placeholder for Export button */}
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
        <TabsContent value="agenda">
          <QuebradoAgendaView data={reportData.quebradoData} />
        </TabsContent>
        <TabsContent value="consolidado">
          <QuebradoConsolidatedView data={reportData.consolidatedInsumos} />
        </TabsContent>
      </Tabs>

      <MadeWithDyad />
    </div>
  );
};

export default QuebradoReport;