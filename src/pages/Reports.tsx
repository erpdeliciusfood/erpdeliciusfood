import { Loader2, BarChart3 } from "lucide-react";
import { useInsumos } from "@/hooks/useInsumos";
import StockOverview from "@/components/reports/StockOverview";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Reports = () => {
  const { data: insumos, isLoading: isLoadingInsumos, isError: isErrorInsumos, error: errorInsumos } = useInsumos();

  if (isLoadingInsumos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando reportes...</p>
      </div>
    );
  }

  if (isErrorInsumos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">
          No se pudieron cargar los datos para los reportes:{" "}
          {errorInsumos?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
          <BarChart3 className="mr-4 h-10 w-10 text-primary dark:text-primary-foreground" />
          Reportes y Análisis
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        {insumos && <StockOverview insumos={insumos} lowStockThreshold={10} />}
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Reports;