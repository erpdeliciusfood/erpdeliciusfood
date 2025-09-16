import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, PlusCircle, ChefHat, Search } from "lucide-react"; // NEW: Import Search icon
import { useRecetas } from "@/hooks/useRecetas";
import RecetaList from "@/components/recetas/RecetaList";
import RecetaForm from "@/components/recetas/RecetaForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Receta, RECETA_CATEGORIES } from "@/types"; // NEW: Import RECETA_CATEGORIES
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { Input } from "@/components/ui/input"; // NEW: Import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // NEW: Import Select components

const Recetas = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceta, setEditingReceta] = useState<Receta | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // NEW: State for search term
  const [selectedCategory, setSelectedCategory] = useState("TODOS"); // NEW: State for category filter

  const { data: allRecetas, isLoading, isError, error } = useRecetas(selectedCategory === "TODOS" ? undefined : selectedCategory); // Pass selectedCategory to hook

  // Filter recipes by search term after fetching by category
  const filteredRecetas = allRecetas?.filter(receta =>
    receta.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
    <div className="container mx-auto min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Recetas"
        description="Crea y administra tus recetas con los insumos disponibles."
        icon={ChefHat}
      />
      <div className="flex justify-end items-center mb-6">
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

      {/* NEW: Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar receta por nombre..."
            className="pl-10 pr-4 py-2 h-12 text-base w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={(value) => setSelectedCategory(value)} value={selectedCategory}>
          <SelectTrigger className="w-full md:w-[200px] h-12 text-base">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todas las Categorías</SelectItem>
            {RECETA_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-grow">
        {filteredRecetas && filteredRecetas.length > 0 ? (
          <RecetaList recetas={filteredRecetas} onEdit={handleEditClick} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <ChefHat className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">
              No hay recetas registradas
              {searchTerm && ` que coincidan con "${searchTerm}"`}
              {selectedCategory !== "TODOS" && ` en la categoría "${selectedCategory}"`}
              . ¡Añade la primera!
            </p>
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