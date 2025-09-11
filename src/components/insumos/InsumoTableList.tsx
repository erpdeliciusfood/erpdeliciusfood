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
import { Edit, Trash2, UtensilsCrossed, Building2, DollarSign, Package, Scale } from "lucide-react";
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
import { Dialog } from "@/components/ui/dialog";
import InsumoSupplierDetailsDialog from "./InsumoSupplierDetailsDialog";
import PhysicalCountDialog from "./PhysicalCountDialog";

interface InsumoTableListProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
}

const InsumoTableList: React.FC<InsumoTableListProps> = ({ insumos, onEdit }) => {
  const deleteMutation = useDeleteInsumo();
  const [isSupplierDetailsDialogOpen, setIsSupplierDetailsDialogOpen] = useState(false);
  const [selectedInsumoForDetails, setSelectedInsumoForDetails] = useState<Insumo | null>(null);
  const [isPhysicalCountDialogOpen, setIsPhysicalCountDialogOpen] = useState(false);
  const [selectedInsumoForPhysicalCount, setSelectedInsumoForPhysicalCount] = useState<Insumo | null>(null);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenSupplierDetails = (insumo: Insumo) => {
    setSelectedInsumoForDetails(insumo);
    setIsSupplierDetailsDialogOpen(true);
  };

  const handleCloseSupplierDetails = () => {
    setIsSupplierDetailsDialogOpen(false);
    setSelectedInsumoForDetails(null);
  };

  const handleOpenPhysicalCount = (insumo: Insumo) => {
    setSelectedInsumoForPhysicalCount(insumo);
    setIsPhysicalCountDialogOpen(true);
  };

  const handleClosePhysicalCount = () => {
    setIsPhysicalCountDialogOpen(false);
    setSelectedInsumoForPhysicalCount(null);
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
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Nombre</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Categoría</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Stock Actual</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Pendiente Entrega</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Pendiente Recepción</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[100px]">Mínimo</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Costo Unitario (S/)</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Proveedor</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insumos.map((insumo) => (
            <TableRow key={insumo.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left flex items-center min-w-[180px]">
                <Package className="mr-2 h-5 w-5 text-primary dark:text-primary-foreground" />
                {insumo.nombre}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[120px]">
                <Badge variant="secondary" className="text-sm">{insumo.category}</Badge>
              </TableCell>
              <TableCell className="text-right text-base py-3 px-6 min-w-[120px]">
                <Badge variant={insumo.stock_quantity <= (insumo.min_stock_level ?? 0) ? "destructive" : "outline"} className="text-base px-2 py-1">
                  {insumo.stock_quantity.toFixed(2)} {insumo.purchase_unit}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[120px]">
                {insumo.pending_delivery_quantity.toFixed(2)} {insumo.purchase_unit}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[120px]">
                {insumo.pending_reception_quantity.toFixed(2)} {insumo.purchase_unit}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[100px]">
                {insumo.min_stock_level ?? 0} {insumo.purchase_unit}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 flex items-center justify-end min-w-[150px]">
                <DollarSign className="mr-1 h-5 w-5 text-green-600" />
                {new Intl.NumberFormat('es-PE', {
                  style: 'currency',
                  currency: 'PEN',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(insumo.costo_unitario)}
              </TableCell>
              <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[150px]">
                {insumo.supplier_name || "N/A"}
              </TableCell>
              <TableCell className="flex justify-center space-x-2 py-3 px-6 min-w-[180px]">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(insumo)}
                  className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
                >
                  <Edit className="h-5 w-5 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenSupplierDetails(insumo)}
                  className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                >
                  <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenPhysicalCount(insumo)}
                  className="h-10 w-10 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors duration-150 ease-in-out"
                >
                  <Scale className="h-5 w-5 text-yellow-600" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
                    >
                      <Trash2 className="h-6 w-6 text-red-600" />
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

      <Dialog open={isSupplierDetailsDialogOpen} onOpenChange={setIsSupplierDetailsDialogOpen}>
        {selectedInsumoForDetails && (
          <InsumoSupplierDetailsDialog
            insumo={selectedInsumoForDetails}
            onClose={handleCloseSupplierDetails}
          />
        )}
      </Dialog>

      <Dialog open={isPhysicalCountDialogOpen} onOpenChange={setIsPhysicalCountDialogOpen}>
        {selectedInsumoForPhysicalCount && (
          <PhysicalCountDialog
            insumo={selectedInsumoForPhysicalCount}
            onClose={handleClosePhysicalCount}
          />
        )}
      </Dialog>
    </div>
  );
};

export default InsumoTableList;