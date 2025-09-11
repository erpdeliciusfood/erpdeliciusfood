import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface PurchaseCostSummaryProps {
  totalEstimatedPurchaseCost: number;
}

const PurchaseCostSummary: React.FC<PurchaseCostSummaryProps> = ({ totalEstimatedPurchaseCost }) => {
  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Costo Total Estimado de Compras
        </CardTitle>
        <DollarSign className="h-8 w-8 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-extrabold text-green-700 dark:text-green-400">
          S/ {totalEstimatedPurchaseCost.toFixed(2)}
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
          Costo estimado para cubrir las necesidades de insumos en el período seleccionado.
        </p>
      </CardContent>
    </Card>
  );
};

export default PurchaseCostSummary;