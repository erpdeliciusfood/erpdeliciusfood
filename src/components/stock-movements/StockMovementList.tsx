import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, ArrowDown, ArrowUp } from "lucide-react"; // 'RefreshCcw' removed
import { StockMovement } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface StockMovementListProps {
  stockMovements: StockMovement[];
}

const StockMovementList: React.FC<StockMovementListProps> = ({ stockMovements }) => {
  if (stockMovements.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <Package className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay movimientos de stock registrados.</p>
      </div>
    );
  }

  const getMovementTypeBadge = (type: StockMovement['movement_type']) => {
    switch (type) {
      case 'purchase_in':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Entrada por Compra</Badge>;
      case 'consumption_out':
        return <Badge variant="destructive">Salida por Consumo</Badge>;
      case 'adjustment_in':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Ajuste de Entrada</Badge>;
      case 'adjustment_out':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Ajuste de Salida</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getQuantityDisplay = (movement: StockMovement) => {
    const quantity = movement.quantity_change;
    const unit = movement.insumos?.purchase_unit || "unidad";
    const isPositive = movement.movement_type === 'purchase_in' || movement.movement_type === 'adjustment_in';

    return (
      <span className={`flex items-center justify-end font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
        {Math.abs(quantity).toFixed(2)} {unit}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Fecha</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Insumo</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Tipo de Movimiento</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Cantidad</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Nuevo Stock</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Notas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockMovements.map((movement) => (
            <TableRow key={movement.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6">
                {format(new Date(movement.created_at), "PPP HH:mm", { locale: es })}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {movement.insumos?.nombre || "Insumo Desconocido"}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {getMovementTypeBadge(movement.movement_type)}
              </TableCell>
              <TableCell className="text-right text-base py-3 px-6">
                {getQuantityDisplay(movement)}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {movement.new_stock_quantity.toFixed(2)} {movement.insumos?.purchase_unit || "unidad"}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {movement.notes || "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockMovementList;