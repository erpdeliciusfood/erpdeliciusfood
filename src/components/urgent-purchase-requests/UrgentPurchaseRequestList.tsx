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
import { Edit, Trash2, ShoppingBag, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { UrgentPurchaseRequest } from "@/types";
import { useDeleteUrgentPurchaseRequest, useUpdateUrgentPurchaseRequest } from "@/hooks/useUrgentPurchaseRequests";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";

interface UrgentPurchaseRequestListProps {
  requests: UrgentPurchaseRequest[];
  onEdit: (request: UrgentPurchaseRequest) => void;
}

const UrgentPurchaseRequestList: React.FC<UrgentPurchaseRequestListProps> = ({ requests, onEdit }) => {
  const deleteMutation = useDeleteUrgentPurchaseRequest();
  const updateMutation = useUpdateUrgentPurchaseRequest();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleStatusChange = async (request: UrgentPurchaseRequest, newStatus: UrgentPurchaseRequest['status']) => {
    try {
      await updateMutation.mutateAsync({
        id: request.id,
        request: { status: newStatus },
      });
      showSuccess(`Estado de la solicitud de compra urgente actualizado a "${newStatus}" exitosamente.`);
    } catch (error: any) {
      showError(`Error al actualizar el estado de la solicitud: ${error.message}`);
    }
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
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Fecha Solicitud</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Insumo</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Cantidad</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Prioridad</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Estado</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Notas</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6">
                {format(new Date(request.request_date), "PPP", { locale: es })}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {request.insumos?.nombre || "Insumo Desconocido"}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {request.quantity_requested.toFixed(2)} {request.insumos?.purchase_unit || "unidad"}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {getPriorityBadge(request.priority)}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {getStatusBadge(request.status)}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {request.notes || "N/A"}
              </TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6">
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
                            ¿Estás seguro de que deseas aprobar la solicitud de compra de <span className="font-semibold">{request.insumos?.nombre || "Insumo Desconocido"}</span>?
                            Esto marcará la solicitud como "Aprobada".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                          <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusChange(request, 'approved')}
                            className="w-full sm:w-auto px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Aprobar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                          title="Rechazar Solicitud"
                          disabled={updateMutation.isPending}
                        >
                          <XCircle className="h-5 w-5 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Rechazar Solicitud de Compra Urgente?</AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                            ¿Estás seguro de que deseas rechazar la solicitud de compra de <span className="font-semibold">{request.insumos?.nombre || "Insumo Desconocido"}</span>?
                            Esto marcará la solicitud como "Rechazada".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                          <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusChange(request, 'rejected')}
                            className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Rechazar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                {request.status === 'approved' && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(request)} // This could open a form to link to a purchase record
                    className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
                    title="Editar Solicitud / Marcar como Cumplida"
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
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la solicitud de compra urgente de <span className="font-semibold">{request.insumos?.nombre || "Insumo Desconocido"}</span> de nuestros servidores.
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
    </div>
  );
};

export default UrgentPurchaseRequestList;