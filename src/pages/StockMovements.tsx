import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle, Package } from "lucide-react";
import { useStockMovements } from "@/hooks/useStockMovements";
import StockMovementList from "@/components/stock-movements/StockMovementList";
import StockMovementForm from "@/components/stock-movements/StockMovementForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo"; // NEW: Import PageHeaderWithLogo

const StockMovements = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: stockMovements, isLoading, isError, error } = useStockMovements();

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando movimientos de stock...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los movimientos de stock: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Movimientos de Stock"
        description="Registra entradas y salidas manuales de inventario."
        icon={Package}
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
              Registrar Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Registrar Nuevo Movimiento de Stock
              </DialogTitle>
            </DialogHeader>
            <StockMovementForm
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-grow">
        {stockMovements && stockMovements.length > 0 ? (
          <StockMovementList stockMovements={stockMovements} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <Package className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay movimientos de stock registrados. ¡Registra el primero!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Registrar Movimiento Ahora
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default StockMovements;