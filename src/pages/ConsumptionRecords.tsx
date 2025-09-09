import { Loader2, UtensilsCrossed } from "lucide-react";
import { useConsumptionRecords } from "@/hooks/useConsumptionRecords";
import ConsumptionRecordList from "@/components/consumption-records/ConsumptionRecordList";
import { MadeWithDyad } from "@/components/made-with-dyad";

const ConsumptionRecords = () => {
  const { data: records, isLoading, isError, error } = useConsumptionRecords();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando registros de consumo...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los registros de consumo: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">Registros de Consumo</h1>
      </div>

      <div className="flex-grow">
        {records && records.length > 0 ? (
          <ConsumptionRecordList records={records} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl">No hay registros de consumo disponibles.</p>
            <p className="text-lg mt-2">Los insumos se deducen automáticamente cuando un pedido se marca como "Completado".</p>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default ConsumptionRecords;