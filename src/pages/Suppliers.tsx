"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle, Building2 } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import SupplierList from "@/components/suppliers/SupplierList";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Supplier } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";

const Suppliers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data: suppliers, isLoading, isError, error } = useSuppliers();

  const handleAddClick = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando proveedores...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los proveedores: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col"> {/* Eliminado p-4 md:p-8 lg:p-12 */}
      <PageHeaderWithLogo
        title="Gestión de Proveedores"
        description="Administra la información de tus proveedores de insumos."
        icon={Building2}
      />
      <div className="flex justify-end items-center mb-6">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Añadir Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingSupplier ? "Editar Proveedor" : "Añadir Nuevo Proveedor"}
              </DialogTitle>
            </DialogHeader>
            <SupplierForm
              initialData={editingSupplier}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-grow">
        {suppliers && suppliers.length > 0 ? (
          <SupplierList suppliers={suppliers} onEdit={handleEditClick} onAddClick={handleAddClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <Building2 className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay proveedores registrados. ¡Añade el primero!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Añadir Proveedor Ahora
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Suppliers;