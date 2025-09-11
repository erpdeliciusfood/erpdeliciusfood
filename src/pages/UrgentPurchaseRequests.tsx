import { useState } from "react";
import { Loader2, ShoppingBag, AlertCircle } from "lucide-react";
import { useUrgentPurchaseRequests } from "@/hooks/useUrgentPurchaseRequests";
import UrgentPurchaseRequestList from "@/components/urgent-purchase-requests/UrgentPurchaseRequestList";
import { MadeWithDyad } from "@/components/made-with-dyad";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { UrgentPurchaseRequest } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UrgentPurchaseRequestForm from "@/components/urgent-purchase-requests/UrgentPurchaseRequestForm";

const UrgentPurchaseRequests = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<UrgentPurchaseRequest | null>(null);

  const { data: requests, isLoading, isError, error } = useUrgentPurchaseRequests();

  const handleEditClick = (request: UrgentPurchaseRequest) => {
    setEditingRequest(request);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRequest(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando solicitudes de compra urgente...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar las solicitudes de compra urgente: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Solicitudes de Compra Urgente"
        description="Revisa y gestiona las solicitudes de insumos con stock bajo."
        icon={AlertCircle}
      />

      <div className="flex-grow">
        {requests && requests.length > 0 ? (
          <UrgentPurchaseRequestList requests={requests} onEdit={handleEditClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <ShoppingBag className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl">No hay solicitudes de compra urgentes pendientes.</p>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Editar Solicitud de Compra Urgente
            </DialogTitle>
          </DialogHeader>
          {editingRequest && (
            <UrgentPurchaseRequestForm
              initialData={editingRequest}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          )}
        </DialogContent>
      </Dialog>

      <MadeWithDyad />
    </div>
  );
};

export default UrgentPurchaseRequests;