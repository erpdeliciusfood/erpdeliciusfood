import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UtensilsCrossed, Building2, DollarSign, Package } from "lucide-react";
import { Insumo } from "@/types";
import { useDeleteInsumo } from "@/hooks/useInsumos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger } from "@/components/ui/sheet"; // Changed from Dialog
import InsumoSupplierDetailsSheet from "./InsumoSupplierDetailsSheet"; // Changed import

interface InsumoTableListProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
}

const InsumoTableList: React.FC<InsumoTableListProps> = ({ insumos, onEdit }) => {
  const deleteMutation = useDeleteInsumo();
  const [isSupplierDetailsSheetOpen, setIsSupplierDetailsSheetOpen] = useState(false); // Changed state name
  const [selectedInsumoForDetails, setSelectedInsumoForDetails] = useState<Insumo | null>(null);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenSupplierDetails = (insumo: Insumo) => {
    setSelectedInsumoForDetails(insumo);
    setIsSupplierDetailsSheetOpen(true); // Changed state setter
  };

  const handleCloseSupplierDetails = () => {
    setIsSupplierDetailsSheetOpen(false); // Changed state setter
    setSelectedInsumoForDetails(null);
  };

  if (insumos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay insumos registrados o que coincidan con tu búsqueda/filtro.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Nombre</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Categoría</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Stock</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Mínimo</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Costo Unitario (S/)</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Proveedor</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insumos.map((insumo) => (
            <TableRow key={insumo.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 flex items-center">
                <Package className="mr-2 h-5 w-5 text-primary dark:text-primary-foreground" />
                {insumo.nombre}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                <Badge variant="secondary" className="text-sm">{insumo.category}</Badge>
              </TableCell>
              <TableCell className="text-right text-base py-3 px-6">
                <Badge variant={insumo.stock_quantity <= insumo.min_stock_level ? "destructive" : "outline"} className="text-base px-2 py-1">
                  {insumo.stock_quantity} {insumo.purchase_unit}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {insumo.min_stock_level} {insumo.purchase_unit}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 flex items-center justify-end">
                <DollarSign className="mr-1 h-5 w-5 text-green-600" />
                S/ {insumo.costo_unitario.toFixed(2)}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6">
                {insumo.supplier_name || "N/A"}
              </TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(insumo)}
                  className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
                >
                  <Edit className="h-5 w-5 text-blue-600" />
                </Button>
                <Sheet open={isSupplierDetailsSheetOpen && selectedInsumoForDetails?.id === insumo.id} onOpenChange={setIsSupplierDetailsSheetOpen}> {/* Changed from Dialog */}
                  <SheetTrigger asChild> {/* Changed from DialogTrigger */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenSupplierDetails(insumo)}
                      className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                    >
                      <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </Button>
                  </SheetTrigger>
                  {selectedInsumoForDetails && (
                    <InsumoSupplierDetailsSheet // Changed component name
                      insumo={selectedInsumoForDetails}
                      onClose={handleCloseSupplierDetails}
                    />
                  )}
                </Sheet>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="p-6">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Estás absolutamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el insumo <span className="font-semibold">{insumo.nombre}</span> de nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                      <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(insumo.id)}
                        className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InsumoTableList;