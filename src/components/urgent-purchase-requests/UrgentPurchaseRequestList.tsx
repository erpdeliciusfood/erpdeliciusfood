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
import { Edit, Trash2, ShoppingBag, CheckCircle2, XCircle, Loader2, Repeat2 } from "lucide-react";
import { UrgentPurchaseRequest } from "@/types";
import { useDeleteUrgentPurchaseRequest, useUpdateUrgentPurchaseRequest } from "@/hooks/useUrgentPurchaseRequests";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { Dialog } from "@/components/ui/dialog";
import FulfillUrgentRequestDialog from "./FulfillUrgentRequestDialog";
import RejectUrgentRequestDialog from "./RejectUrgentRequestDialog";

interface UrgentPurchaseRequestListProps {
  requests: UrgentPurchaseRequest[];
  onEdit: (request: UrgentPurchaseRequest) => void;
}

const UrgentPurchaseRequestList: React.FC<UrgentPurchaseRequestListProps> = ({ requests, onEdit }) => {
  const deleteMutation = useDeleteUrgentPurchaseRequest();
  const updateMutation = useUpdateUrgentPurchaseRequest();

  const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false);
  const [requestToFulfill, setRequestToFulfill] = useState<UrgentPurchaseRequest | null>(null);

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<UrgentPurchaseRequest | null>(null);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleApproveRequest = async (request: UrgentPurchaseRequest) => {
    try {
      await updateMutation.mutateAsync({
        id: request.id,
        request: { status: 'approved' },
      });
      showSuccess(`Solicitud de compra urgente para ${request.insumo?.nombre || "Insumo Desconocido"} aprobada exitosamente. Se ha notificado al almacén.`);
    } catch (error: any) {
      showError(`Error al aprobar la solicitud: ${error.message}`);
    }
  };

  const handleOpenRejectDialog = (request: UrgentPurchaseRequest) => {
    setRequestToReject(request);
    setIsRejectDialogOpen(true);
  };

  const handleCloseRejectDialog = () => {
    setIsRejectDialogOpen(false);
    setRequestToReject(null);
  };

  const handleOpenFulfillDialog = (insumo: UrgentPurchaseRequest) => {
    setRequestToFulfill(insumo);
    setIsFulfillDialogOpen(true);
  };

  const handleCloseFulfillDialog = () => {
    setIsFulfillDialogOpen(false);
    setRequestToFulfill(null);
  };

  const getStatusBadge = (status: UrgentPurchaseRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      case 'fulfilled':
        return <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 text-white">Cumplido</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority: UrgentPurchaseRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">Urgente</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">Alta</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Media</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Baja</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <ShoppingBag className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay solicitudes de compra urgentes registradas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Fecha Solicitud</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Insumo</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Cantidad</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Prioridad</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Estado</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[100px]">Insistencia</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[200px]">Notas</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[200px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[150px]">
                {format(new Date(request.request_date), "PPP", { locale: es })}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[180px]">
                {request.insumo?.nombre || "Insumo Desconocido"}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[120px]">
                {request.quantity_requested.toFixed(2)} {request.insumo?.purchase_unit || "unidad"}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[120px]">
                {getPriorityBadge(request.priority)}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[120px]">
                {getStatusBadge(request.status)}
              </TableCell>
              <TableCell className="text-center text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[100px]">
                {request.insistence_count && request.insistence_count > 1 ? (
                  <Badge variant="destructive" className="text-base px-2 py-1 flex items-center justify-center mx-auto w-fit">
                    <Repeat2 className="h-4 w-4 mr-1" /> {request.insistence_count}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-base px-2 py-1 flex items-center justify-center mx-auto w-fit">
                    1
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[200px]">
                {request.notes || "N/A"}
                {request.status === 'rejected' && request.rejection_reason && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    <span className="font-semibold">Motivo:</span> {request.rejection_reason}
                  </p>
                )}
              </TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6 min-w-[200px]">
                {request.status === 'pending' && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-150 ease-in-out"
                          title="Aprobar Solicitud"
                          disabled={updateMutation.isPending}
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Aprobar Solicitud de Compra Urgente?</AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                            ¿Estás seguro de que deseas aprobar la solicitud de compra de <span className="font-semibold">{request.insumo?.nombre || "Insumo Desconocido"}</span>?
                            Esto marcará la solicitud como "Aprobada" y notificará al almacén.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                          <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleApproveRequest(request)}
                            className="w-full sm:w-auto px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Aprobar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenRejectDialog(request)}
                      className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                      title="Rechazar Solicitud"
                      disabled={updateMutation.isPending}
                    >
                      <XCircle className="h-5 w-5 text-red-600" />
                    </Button>
                  </>
                )}

                {(request.status === 'pending' || request.status === 'approved') && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenFulfillDialog(request)}
                    className="h-10 w-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-150 ease-in-out"
                    title="Marcar como Comprado"
                    disabled={updateMutation.isPending}
                  >
                    <ShoppingBag className="h-5 w-5 text-purple-600" />
                  </Button>
                )}

                {(request.status === 'pending' || request.status === 'approved') && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(request)}
                    className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
                    title="Editar Solicitud"
                    disabled={updateMutation.isPending}
                  >
                    <Edit className="h-5 w-5 text-blue-600" />
                  </Button>
                )}

                {(request.status === 'pending' || request.status === 'approved' || request.status === 'rejected') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                        title="Eliminar Solicitud"
                        disabled={updateMutation.isPending}
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud de compra urgente de <span className="font-semibold">{request.insumo?.nombre || "Insumo Desconocido"}</span> de nuestros servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                          <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(request.id)}
                            className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Eliminar
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

      <Dialog open={isFulfillDialogOpen} onOpenChange={setIsFulfillDialogOpen}>
        {requestToFulfill && (
          <FulfillUrgentRequestDialog
            urgentRequest={requestToFulfill}
            onClose={handleCloseFulfillDialog}
          />
        )}
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        {requestToReject && (
          <RejectUrgentRequestDialog
            urgentRequest={requestToReject}
            onClose={handleCloseRejectDialog}
          />
        )}
      </Dialog>
    </div>
  );
};

export default UrgentPurchaseRequestList;