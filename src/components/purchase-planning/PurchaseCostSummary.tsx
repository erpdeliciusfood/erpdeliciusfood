import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Loader2 } from "lucide-react"; // Import Loader2

interface PurchaseCostSummaryProps {
  totalEstimatedPurchaseCost: number;
  isLoading: boolean; // NEW: Add isLoading prop
}

const PurchaseCostSummary: React.FC<PurchaseCostSummaryProps> = ({ totalEstimatedPurchaseCost, isLoading }) => {
  // NEW: Formatear el costo total estimado a Sol Peruano
  const formattedCost = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalEstimatedPurchaseCost);

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Costo Total Estimado de Compras
        </CardTitle>
        <DollarSign className="h-8 w-8 text-green-600" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-primary-foreground" />
          </div>
        ) : (
          <div className="text-5xl font-extrabold text-green-700 dark:text-green-400">
            {formattedCost}
          </div>
        )}
        <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
          Costo estimado para cubrir las necesidades de insumos en el período seleccionado.
        </p>
      </CardContent>
    </Card>
  );
};

export default PurchaseCostSummary;