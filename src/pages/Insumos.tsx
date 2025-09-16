import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle, Search, Upload, UtensilsCrossed, LayoutGrid, List, Utensils } from "lucide-react"; // Added Utensils icon
import { useInsumos } from "@/hooks/useInsumos";
import InsumoCardGrid from "@/components/insumos/InsumoCardGrid";
import InsumoTableList from "@/components/insumos/InsumoTableList";
import InsumoForm from "@/components/insumos/InsumoForm";
import InsumoImporter from "@/components/insumos/InsumoImporter";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Insumo, InsumoFormValues } from "@/types"; // Import InsumoFormValues
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo"; // NEW: Import PageHeaderWithLogo

const INSUMO_CATEGORIES = [
  "Todos",
  "Cereales",
  "Legumbres",
  "Carbohidrato / Cereales",
  "Proteínas (Carnes, Aves, Pescados)",
  "Lácteos y Huevos",
  "Verduras y Hortalizas",
  "Frutas",
  "Grasas y Aceites",
  "Condimentos y Especias",
  "Panadería y Pastelería",
  "Bebidas",
  "Otros",
];

const ITEMS_PER_PAGE = 12; // Number of items per page

const Insumos = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportFormOpen, setIsImportFormOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 'grid' or 'list'

  const { data: insumoData, isLoading, isError, error } = useInsumos(searchTerm, selectedCategory === "Todos" ? undefined : selectedCategory, currentPage, ITEMS_PER_PAGE);

  const insumos = insumoData?.data || [];
  const totalCount = insumoData?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleAddClick = () => {
    setEditingInsumo(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingInsumo(null);
  };

  const handleImportFormClose = () => {
    setIsImportFormOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Map Insumo to InsumoFormValues for the form
  const mappedEditingInsumo: InsumoFormValues | null = editingInsumo
    ? {
        ...editingInsumo,
        min_stock_level: editingInsumo.min_stock_level ?? 0, // Ensure it's a number
      }
    : null;

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
    <div className="container mx-auto min-h-screen flex flex-col"> {/* Eliminado p-4 md:p-8 lg:p-12 */}
      <PageHeaderWithLogo
        title="Gestión de Insumos"
        description="Administra tus ingredientes, unidades de medida y costos."
        icon={Utensils}
      />

      <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
        <Dialog open={isImportFormOpen} onOpenChange={setIsImportFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsImportFormOpen(true)}
              className="px-6 py-3 text-lg bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Upload className="mr-3 h-6 w-6" />
              Importar Insumos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Importar Insumos desde CSV
              </DialogTitle>
            </DialogHeader>
            <InsumoImporter onSuccess={handleImportFormClose} onCancel={handleImportFormClose} />
          </DialogContent>
        </Dialog>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl w-full sm:w-auto"
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
              initialData={mappedEditingInsumo}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar insumo por nombre..."
            className="pl-10 pr-4 py-2 h-12 text-base w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        <Select onValueChange={(value) => {
          setSelectedCategory(value);
          setCurrentPage(1); // Reset to first page on category change
        }} value={selectedCategory}>
          <SelectTrigger className="w-full md:w-[200px] h-12 text-base">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            {INSUMO_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value: 'grid' | 'list') => {
          if (value) setViewMode(value);
        }} className="w-full md:w-auto justify-end">
          <ToggleGroupItem value="grid" aria-label="Vista de Cuadrícula" className="h-12 w-12 text-lg">
            <LayoutGrid className="h-6 w-6" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Vista de Lista" className="h-12 w-12 text-lg">
            <List className="h-6 w-6" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex-grow">
        {insumos && insumos.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <InsumoCardGrid insumos={insumos} onEdit={handleEditClick} />
            ) : (
              <InsumoTableList insumos={insumos} onEdit={handleEditClick} />
            )}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => handlePageChange(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay insumos registrados o que coincidan con tu búsqueda/filtro. ¡Añade el primero!</p>
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