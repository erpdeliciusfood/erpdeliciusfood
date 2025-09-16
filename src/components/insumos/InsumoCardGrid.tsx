import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UtensilsCrossed, Building2, Package, DollarSign, Truck, Warehouse, AlertCircle, Scale } from "lucide-react";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface InsumoCardGridProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
}

const InsumoCardGrid: React.FC<InsumoCardGridProps> = ({ insumos, onEdit }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {insumos.map((insumo) => (
        <Card key={insumo.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Package className="mr-2 h-6 w-6 text-primary dark:text-primary-foreground" />
              {insumo.nombre}
            </CardTitle>
            <CardDescription className="text-base text-gray-700 dark:text-gray-300 mt-1">
              Categoría: <Badge variant="secondary" className="text-sm">{insumo.category}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4 text-gray-800 dark:text-gray-200 pt-4">
            {/* Stock Overview Section */}
            <div className="grid grid-cols-1 gap-2 border-b pb-3 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold flex items-center"><Warehouse className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />Stock Actual:</span>
                <Badge variant={insumo.stock_quantity <= (insumo.min_stock_level ?? 0) ? "destructive" : "outline"} className="text-base px-3 py-1.5">
                  {insumo.stock_quantity.toFixed(2)} {insumo.purchase_unit}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-medium flex items-center"><Truck className="mr-2 h-4 w-4 text-blue-600" />Pendiente Entrega:</span>
                <span>{insumo.pending_delivery_quantity.toFixed(2)} {insumo.purchase_unit}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-medium flex items-center"><Warehouse className="mr-2 h-4 w-4 text-purple-600" />Pendiente Recepción:</span>
                <span>{insumo.pending_reception_quantity.toFixed(2)} {insumo.purchase_unit}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-medium flex items-center"><AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />Stock Mínimo:</span>
                <span>{insumo.min_stock_level ?? 0} {insumo.purchase_unit}</span>
              </div>
            </div>

            {/* Financial Section */}
            <div className="grid grid-cols-1 gap-2 border-b pb-3 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-600" />Costo Unitario:</span>
                <span className="font-bold text-green-700 dark:text-green-300">S/ {insumo.costo_unitario.toFixed(2)} / {insumo.purchase_unit}</span>
              </div>
            </div>

            {/* Audit and Supplier Section */}
            <div className="space-y-2 text-sm">
              {insumo.last_physical_count_quantity !== null && (
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center"><Scale className="mr-2 h-4 w-4 text-gray-500" />Último Conteo:</span>
                  <span>{insumo.last_physical_count_quantity.toFixed(2)} {insumo.purchase_unit} ({insumo.last_physical_count_date ? format(new Date(insumo.last_physical_count_date), "PPP", { locale: es }) : "N/A"})</span>
                </div>
              )}
              {insumo.discrepancy_quantity !== 0 && (
                <div className="flex items-center justify-between text-orange-700 dark:text-orange-300">
                  <span className="font-medium flex items-center"><AlertCircle className="mr-2 h-4 w-4" />Diferencia:</span>
                  <span>{insumo.discrepancy_quantity.toFixed(2)} {insumo.purchase_unit}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center"><Building2 className="mr-2 h-4 w-4 text-gray-500" />Proveedor:</span>
                <span>{insumo.supplier_name || "N/A"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(insumo)}
              className="h-12 w-12 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
            >
              <Edit className="h-6 w-6 text-blue-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleOpenSupplierDetails(insumo)}
              className="h-12 w-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
            >
              <Building2 className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleOpenPhysicalCount(insumo)}
              className="h-12 w-12 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors duration-150 ease-in-out"
            >
              <Scale className="h-6 w-6 text-yellow-600" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
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
          </CardFooter>
        </Card>
      ))}

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

export default InsumoCardGrid;