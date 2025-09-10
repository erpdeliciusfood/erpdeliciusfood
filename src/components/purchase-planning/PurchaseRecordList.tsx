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
import { Edit, ShoppingBag, CheckCircle2, XCircle, Truck, Warehouse, Loader2 } from "lucide-react"; // NEW: Loader2, removed Trash2
import { PurchaseRecord } from "@/types";
import { useDeletePurchaseRecord, useUpdatePurchaseRecord } from "@/hooks/usePurchaseRecords"; // NEW: Import useUpdatePurchaseRecord
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast"; // NEW: Import toast functions

interface PurchaseRecordListProps {
  purchaseRecords: PurchaseRecord[];
  onEdit: (record: PurchaseRecord) => void;
}

const PurchaseRecordList: React.FC<PurchaseRecordListProps> = ({ purchaseRecords, onEdit }) => {
  const deleteMutation = useDeletePurchaseRecord();
  const updateMutation = useUpdatePurchaseRecord(); // NEW: Use update mutation

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // NEW: Function to handle status transitions
  const handleStatusChange = async (record: PurchaseRecord, newStatus: PurchaseRecord['status']) => {
    try {
      await updateMutation.mutateAsync({
        id: record.id,
        record: {
          ...record,
          status: newStatus,
          // Auto-set received_date if transitioning to a received status and it's not already set
          received_date: (newStatus === 'received_by_company' || newStatus === 'received_by_warehouse') && !record.received_date
            ? format(new Date(), "yyyy-MM-dd")
            : record.received_date,
        },
      });
      showSuccess(`Estado de la compra actualizado a "${newStatus}" exitosamente.`);
    } catch (error: any) {
      showError(`Error al actualizar el estado de la compra: ${error.message}`);
    }
  };

  const getStatusBadge = (status: PurchaseRecord['status']) => {
    switch (status) {
      case 'ordered':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Ordenado</Badge>;
      case 'received_by_company':
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Recibido por Empresa</Badge>;
      case 'received_by_warehouse':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Recibido en Almacén</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  if (purchaseRecords.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <ShoppingBag className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay registros de compras.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Fecha Compra</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Insumo</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Cantidad</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Costo Unitario (S/)</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Monto Total (S/)</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Proveedor</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Estado</TableHead> {/* NEW: Status column */}
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Fecha Recepción</TableHead> {/* NEW: Received Date column */}
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseRecords.map((record) => (
            <TableRow key={record.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6">
                {format(new Date(record.purchase_date), "PPP", { locale: es })}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {record.insumos?.nombre || "Insumo Desconocido"} {/* Display insumo name */}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {record.quantity_purchased.toFixed(2)} {record.insumos?.purchase_unit || "unidad"}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                S/ {record.unit_cost_at_purchase.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                S/ {record.total_amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                <div className="flex items-center">
                  {record.supplier_name_at_purchase || "N/A"}
                  {record.from_registered_supplier ? (
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Registrado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      <XCircle className="h-3 w-3 mr-1" /> Otro
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {getStatusBadge(record.status)} {/* NEW: Display status badge */}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {record.received_date ? format(new Date(record.received_date), "PPP", { locale: es }) : "N/A"} {/* NEW: Display received date */}
              </TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6">
                {record.status === 'ordered' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-150 ease-in-out"
                        title="Marcar como Recibido por Empresa"
                        disabled={updateMutation.isPending}
                      >
                        <Truck className="h-5 w-5 text-purple-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Confirmar Recepción por Empresa?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                          ¿Estás seguro de que deseas marcar esta compra de <span className="font-semibold">{record.insumos?.nombre || "Insumo Desconocido"}</span> como "Recibido por Empresa"?
                          Esto moverá la cantidad de "Pendiente de Entrega" a "Pendiente de Recepción en Almacén".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                        <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleStatusChange(record, 'received_by_company')}
                          className="w-full sm:w-auto px-6 py-3 text-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 ease-in-out"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {record.status === 'received_by_company' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-150 ease-in-out"
                        title="Marcar como Recibido en Almacén"
                        disabled={updateMutation.isPending}
                      >
                        <Warehouse className="h-5 w-5 text-green-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Confirmar Recepción en Almacén?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                          ¿Estás seguro de que deseas marcar esta compra de <span className="font-semibold">{record.insumos?.nombre || "Insumo Desconocido"}</span> como "Recibido en Almacén"?
                          Esto moverá la cantidad de "Pendiente de Recepción" a "Stock Actual".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                        <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleStatusChange(record, 'received_by_warehouse')}
                          className="w-full sm:w-auto px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {(record.status === 'ordered' || record.status === 'received_by_company') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(record)}
                        className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
                        title="Editar Registro de Compra"
                        disabled={updateMutation.isPending}
                      >
                        <Edit className="h-5 w-5 text-blue-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                          Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de compra de {record.insumos?.nombre || "Insumo Desconocido"} del {format(new Date(record.purchase_date), "PPP", { locale: es })} de nuestros servidores.
                          <br/><span className="font-semibold text-red-600 dark:text-red-400">Nota: Esto NO revertirá los cambios de stock o costo del insumo.</span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                        <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(record.id)}
                          className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {(record.status === 'ordered' || record.status === 'received_by_company') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                        title="Cancelar Compra"
                        disabled={updateMutation.isPending}
                      >
                        <XCircle className="h-5 w-5 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Confirmar Cancelación de Compra?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                          ¿Estás seguro de que deseas cancelar esta compra de <span className="font-semibold">{record.insumos?.nombre || "Insumo Desconocido"}</span>?
                          Esto revertirá las cantidades de "Pendiente de Entrega" o "Pendiente de Recepción en Almacén" asociadas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                        <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleStatusChange(record, 'cancelled')}
                          className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                          Confirmar Cancelación
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseRecordList;