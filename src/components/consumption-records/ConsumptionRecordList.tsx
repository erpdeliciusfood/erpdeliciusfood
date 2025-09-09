import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UtensilsCrossed } from "lucide-react"; // Removed Package
import { ConsumptionRecord } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ConsumptionRecordListProps {
  records: ConsumptionRecord[];
}

const ConsumptionRecordList: React.FC<ConsumptionRecordListProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay registros de consumo.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Pedido</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Insumo</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Cantidad Consumida</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Fecha de Consumo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6">
                {record.orders?.customer_name || `Pedido #${record.order_id.substring(0, 8)}`}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {record.insumos?.nombre} ({record.insumos?.unidad_medida})
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {record.quantity_consumed}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {format(new Date(record.consumed_at), "PPP p", { locale: es })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ConsumptionRecordList;