import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, PlusCircle, ChefHat } from "lucide-react";
import { useRecetas } from "@/hooks/useRecetas";
import RecetaList from "@/components/recetas/RecetaList";
import RecetaForm from "@/components/recetas/RecetaForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Receta } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo"; // NEW: Import PageHeaderWithLogo

const Recetas = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceta, setEditingReceta] = useState<Receta | null>(null);

  const { data: recetas, isLoading, isError, error } = useRecetas();

  const handleAddClick = () => {
    setEditingReceta(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (receta: Receta) => {
    setEditingReceta(receta);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingReceta(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando recetas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar las recetas: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col"> {/* Eliminado p-4 md:p-8 lg:p-12 */}
      <PageHeaderWithLogo
        title="Gestión de Recetas"
        description="Crea y administra tus recetas con los insumos disponibles."
        icon={ChefHat}
      />
      <div className="flex justify-end items-center mb-6"> {/* Adjusted layout for buttons */}
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Añadir Receta
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl p-6 max-h-screen overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingReceta ? "Editar Receta" : "Añadir Nueva Receta"}
              </SheetTitle>
            </SheetHeader>
            <RecetaForm
              initialData={editingReceta}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-grow">
        {recetas && recetas.length > 0 ? (
          <RecetaList recetas={recetas} onEdit={handleEditClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <ChefHat className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay recetas registradas. ¡Añade la primera!</p>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Añadir Receta Ahora
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Recetas;