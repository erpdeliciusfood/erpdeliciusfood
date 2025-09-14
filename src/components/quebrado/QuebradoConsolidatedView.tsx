import React from 'react';
import { ConsolidatedInsumo } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils'; // Import cn for conditional classnames
import { AlertTriangle } from 'lucide-react'; // Import AlertTriangle icon

interface QuebradoConsolidatedViewProps {
  data: ConsolidatedInsumo[];
}

const QuebradoConsolidatedView: React.FC<QuebradoConsolidatedViewProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No hay insumos consolidados para mostrar.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consolidado Semanal de Insumos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
              <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Cantidad Total Necesaria</TableHead>
              <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Unidad</TableHead>
              <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Actual</TableHead> {/* NEW: Stock Actual column */}
              <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Utilizado en Servicios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((insumo) => {
              const isLowStock = insumo.currentStock <= (insumo.minStockLevel ?? 0); // Check if current stock is below min level
              const isCriticalStock = insumo.currentStock < insumo.totalQuantity; // Check if current stock is less than total needed

              return (
                <TableRow key={insumo.insumoId} className={cn(
                  "hover:bg-gray-50 dark:hover:bg-gray-700",
                  isCriticalStock && "bg-red-50/50 dark:bg-red-900/20" // Highlight if critical stock
                )}>
                  <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{insumo.insumoName}</TableCell>
                  <TableCell className="text-right text-base font-mono text-gray-700 dark:text-gray-300">{insumo.totalQuantity.toFixed(2)}</TableCell>
                  <TableCell className="text-base text-gray-700 dark:text-gray-300">{insumo.unit}</TableCell>
                  <TableCell className="text-right text-base py-3 px-6">
                    <div className="flex items-center justify-end">
                      <Badge variant={isLowStock ? "destructive" : "outline"} className="text-base px-2 py-1">
                        {insumo.currentStock.toFixed(2)}
                      </Badge>
                      {isCriticalStock && (
                        <AlertTriangle className="ml-2 h-5 w-5 text-red-600 dark:text-red-400" aria-label="Stock insuficiente para la demanda del período" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-base text-gray-700 dark:text-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {insumo.services.map((service) => (
                        <Badge key={service} variant="outline" className="text-sm">{service}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default QuebradoConsolidatedView;