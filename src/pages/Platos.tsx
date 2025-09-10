import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Changed Dialog to Sheet
import { Loader2, PlusCircle } from "lucide-react";
import { usePlatos } from "@/hooks/usePlatos";
import PlatoList from "@/components/platos/PlatoList";
import PlatoForm from "@/components/platos/PlatoForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Plato } from "@/types";

const Platos = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);

  const { data: platos, isLoading, isError, error } = usePlatos();

  const handleAddClick = () => {
    setEditingPlato(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (plato: Plato) => {
    setEditingPlato(plato);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPlato(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando platos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los platos: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">Gestión de Platos</h1>
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}> {/* Changed Dialog to Sheet */}
          <SheetTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Añadir Plato
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl p-6 max-h-screen overflow-y-auto"> {/* Changed DialogContent to SheetContent */}
            <SheetHeader> {/* Changed DialogHeader to SheetHeader */}
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100"> {/* Changed DialogTitle to SheetTitle */}
                {editingPlato ? "Editar Plato" : "Añadir Nuevo Plato"}
              </SheetTitle>
            </SheetHeader>
            <PlatoForm
              initialData={editingPlato}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-grow">
        {platos && platos.length > 0 ? (
          <PlatoList platos={platos} onEdit={handleEditClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <p className="text-xl mb-4">No hay platos registrados. ¡Añade el primero!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Añadir Plato Ahora
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Platos;