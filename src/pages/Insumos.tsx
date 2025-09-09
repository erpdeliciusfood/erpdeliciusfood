import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle } from "lucide-react";
import { useInsumos } from "@/hooks/useInsumos";
import InsumoList from "@/components/insumos/InsumoList";
import InsumoForm from "@/components/insumos/InsumoForm";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Insumos = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null); // State to hold insumo being edited

  const { data: insumos, isLoading, isError, error } = useInsumos();

  const handleAddClick = () => {
    setEditingInsumo(null); // Clear any editing state
    setIsFormOpen(true);
  };

  const handleEditClick = (insumo: any) => { // Type will be Insumo later
    setEditingInsumo(insumo);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingInsumo(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando insumos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los insumos: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">Gestión de Insumos</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Añadir Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingInsumo ? "Editar Insumo" : "Añadir Nuevo Insumo"}
              </DialogTitle>
            </DialogHeader>
            <InsumoForm
              initialData={editingInsumo}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-grow">
        {insumos && insumos.length > 0 ? (
          <InsumoList insumos={insumos} onEdit={handleEditClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <p className="text-xl mb-4">No hay insumos registrados. ¡Añade el primero!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Añadir Insumo Ahora
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Insumos;