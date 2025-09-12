import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle, ShoppingBag } from "lucide-react";
import { usePurchaseRecords } from "@/hooks/usePurchaseRecords";
import PurchaseRecordList from "@/components/purchase-planning/PurchaseRecordList";
import PurchaseRecordForm from "@/components/purchase-planning/PurchaseRecordForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { PurchaseRecord } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo"; // NEW: Import PageHeaderWithLogo

const PurchaseRecords = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PurchaseRecord | null>(null);

  const { data: purchaseRecords, isLoading, isError, error } = usePurchaseRecords();

  const handleAddClick = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (record: PurchaseRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando registros de compra...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los registros de compra: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Registros de Compra"
        description="Consulta y administra el historial de tus compras de insumos."
        icon={ShoppingBag}
        hideLogo={true}
      />
      <div className="flex justify-end items-center mb-6"> {/* Adjusted layout for buttons */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Registrar Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingRecord ? "Editar Registro de Compra" : "Registrar Nueva Compra"}
              </DialogTitle>
            </DialogHeader>
            <PurchaseRecordForm
              initialData={editingRecord}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-grow">
        {purchaseRecords && purchaseRecords.length > 0 ? (
          <PurchaseRecordList purchaseRecords={purchaseRecords} onEdit={handleEditClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <ShoppingBag className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay registros de compra. ¡Registra el primero!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Registrar Compra Ahora
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default PurchaseRecords;