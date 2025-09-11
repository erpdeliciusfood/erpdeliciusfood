import { useState } from "react";
import { Loader2, ShoppingBag, AlertCircle, PlusCircle } from "lucide-react"; // NEW: Import PlusCircle
import { useUrgentPurchaseRequests } from "@/hooks/useUrgentPurchaseRequests";
import UrgentPurchaseRequestList from "@/components/urgent-purchase-requests/UrgentPurchaseRequestList";
import { MadeWithDyad } from "@/components/made-with-dyad";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { UrgentPurchaseRequest } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UrgentPurchaseRequestForm from "@/components/urgent-purchase-requests/UrgentPurchaseRequestForm";
import { Button } from "@/components/ui/button"; // NEW: Import Button

const UrgentPurchaseRequests = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<UrgentPurchaseRequest | null>(null);

  const { data: requests, isLoading, isError, error } = useUrgentPurchaseRequests();

  const handleAddClick = () => { // NEW: Handler for adding a new request
    setEditingRequest(null);
    setIsFormOpen(true);
  };

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

      <div className="flex justify-end items-center mb-6"> {/* Adjusted layout for buttons */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Crear Solicitud Urgente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingRequest ? "Editar Solicitud de Compra Urgente" : "Crear Nueva Solicitud Urgente"}
              </DialogTitle>
            </DialogHeader>
            <UrgentPurchaseRequestForm
              initialData={editingRequest}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-grow">
        {requests && requests.length > 0 ? (
          <UrgentPurchaseRequestList requests={requests} onEdit={handleEditClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <ShoppingBag className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay solicitudes de compra urgentes pendientes. ¡Crea la primera!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Solicitud Ahora
            </Button>
          </div>
        )}
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default UrgentPurchaseRequests;