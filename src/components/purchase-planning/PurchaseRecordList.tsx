import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, ShoppingBag, CheckCircle2, XCircle, Truck, Warehouse, Loader2, Trash2 } from "lucide-react";
import { PurchaseRecordWithRelations } from "@/types"; // Updated import
import { useDeletePurchaseRecord, useUpdatePurchaseRecord } from "@/hooks/usePurchaseRecords";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { Dialog } from "@/components/ui/dialog";
import PartialReceptionDialog from "./PartialReceptionDialog";

interface PurchaseRecordListProps {
  purchaseRecords: PurchaseRecordWithRelations[]; // Updated type
  onEdit: (record: PurchaseRecordWithRelations) => void;
}

const PurchaseRecordList: React.FC<PurchaseRecordListProps> = ({ purchaseRecords, onEdit }) => {
  const deleteMutation = useDeletePurchaseRecord();
  const updateMutation = useUpdatePurchaseRecord();

  const [isPartialReceptionDialogOpen, setIsPartialReceptionDialogOpen] = useState(false);
  const [selectedRecordForReception, setSelectedRecordForReception] = useState<PurchaseRecordWithRelations | null>(null);
  const [targetStatusForReception, setTargetStatusForReception] = useState<'received_by_company' | 'received_by_warehouse' | null>(null);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenPartialReceptionDialog = (record: PurchaseRecordWithRelations, targetStatus: 'received_by_company' | 'received_by_warehouse') => {
    setSelectedRecordForReception(record);
    setTargetStatusForReception(targetStatus);
    setIsPartialReceptionDialogOpen(true);
  };

  const handleClosePartialReceptionDialog = () => {
    setIsPartialReceptionDialogOpen(false);
    setSelectedRecordForReception(null);
    setTargetStatusForReception(null);
  };

  const handleCancelStatusChange = async (record: PurchaseRecordWithRelations) => {
    try {
      await updateMutation.mutateAsync({
        id: record.id,
        record: {
          ...record,
          status: 'cancelled',
          received_date: null,
        },
      });
      showSuccess(`Estado de la compra actualizado a "Cancelado" exitosamente.`);
    } catch (error: any) {
      showError(`Error al actualizar el estado de la compra: ${error.message}`);
    }
  };

  const getStatusBadge = (status: PurchaseRecordWithRelations['status']) => {
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
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Fecha Compra</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Insumo</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Cant. Ordenada</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Cant. Recibida</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[100px]">Pendiente</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Costo Unitario (S/)</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Monto Total (S/)</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Proveedor</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Estado</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Fecha Recepción</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[200px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseRecords.map((record) => {
            const quantityPending = record.quantity_purchased - record.quantity_received;
            return (
              <TableRow key={record.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
                <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[150px]">
                  {format(new Date(record.purchase_date), "PPP", { locale: es })}
                </TableCell>
                <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[180px]">
                  {record.insumos?.nombre || "Insumo Desconocido"}
                </TableCell>
                <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[120px]">
                  {record.quantity_purchased.toFixed(2)} {record.insumos?.purchase_unit || "unidad"}
                </TableCell>
                <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[120px]">
                  {record.quantity_received.toFixed(2)} {record.insumos?.purchase_unit || "unidad"}
                </TableCell>
                <TableCell className="text-right text-base py-3 px-6 min-w-[100px]">
                  {quantityPending > 0 ? (
                    <Badge variant="destructive" className="text-base px-2 py-1">
                      {quantityPending.toFixed(2)} {record.insumos?.purchase_unit || "unidad"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-base px-2 py-1">
                      0.00 {record.insumos?.purchase_unit || "unidad"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[150px]">
                  S/ {record.unit_cost_at_purchase.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[150px]">
                  S/ {record.total_amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[180px]">
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
                <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[150px]">
                  {record.received_date ? format(new Date(record.received_date), "PPP", { locale: es }) : "N/A"}
                </TableCell>
                <TableCell className="flex justify-center space-x-2 py-3 px-6 min-w-[200px]">
                  {record.status === 'ordered' && quantityPending > 0 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenPartialReceptionDialog(record, 'received_by_company')}
                      className="h-10 w-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-150 ease-in-out"
                      title="Marcar como Recibido por Empresa"
                      disabled={updateMutation.isPending}
                    >
                      <Truck className="h-5 w-5 text-purple-600" />
                    </Button>
                  )}

                  {record.status === 'received_by_company' && quantityPending > 0 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenPartialReceptionDialog(record, 'received_by_warehouse')}
                      className="h-10 w-10 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-150 ease-in-out"
                      title="Marcar como Recibido en Almacén"
                      disabled={updateMutation.isPending}
                    >
                      <Warehouse className="h-5 w-5 text-green-600" />
                    </Button>
                  )}

                  {(record.status === 'ordered' || record.status === 'received_by_company' || record.status === 'received_by_warehouse') && (
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
                            onClick={() => handleCancelStatusChange(record)}
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

                  {record.status === 'cancelled' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                          title="Eliminar Registro de Compra"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de compra de <span className="font-semibold">{record.insumos?.nombre || "Insumo Desconocido"}</span> de nuestros servidores.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                          <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(record.id)}
                            className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={isPartialReceptionDialogOpen} onOpenChange={setIsPartialReceptionDialogOpen}>
        {selectedRecordForReception && targetStatusForReception && (
          <PartialReceptionDialog
            purchaseRecord={selectedRecordForReception}
            onClose={handleClosePartialReceptionDialog}
            targetStatus={targetStatusForReception}
          />
        )}
      </Dialog>
    </div>
  );
};

export default PurchaseRecordList;