import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UtensilsCrossed } from "lucide-react";
import { Receta } from "@/types"; // Changed type import
import { useDeleteReceta } from "@/hooks/useRecetas"; // Changed hook import
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge"; // NEW: Import Badge

interface RecetaListProps {
  recetas: Receta[]; // Changed type
  onEdit: (receta: Receta) => void; // Changed type
}

const RecetaList: React.FC<RecetaListProps> = ({ recetas, onEdit }) => {
  const deleteMutation = useDeleteReceta(); // Changed hook usage

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const calculateProductionCost = (receta: Receta): number => { // Changed type
    if (!receta.plato_insumos || receta.plato_insumos.length === 0) {
      return 0;
    }
    return receta.plato_insumos.reduce((totalCost, platoInsumo) => {
      const insumo = platoInsumo.insumos; // Access the nested insumo object
      if (insumo) {
        // Ensure costo_unitario is per base_unit for calculation
        const costPerBaseUnit = insumo.costo_unitario / insumo.conversion_factor;
        return totalCost + (costPerBaseUnit * platoInsumo.cantidad_necesaria);
      }
      return totalCost;
    }, 0);
  };

  if (recetas.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-xl">No hay recetas registradas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
      <Table className="w-full">
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[200px]">Nombre</TableHead>
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Categoría</TableHead> {/* NEW: Category column */}
            <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[300px]">Descripción</TableHead>
            <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Costo Producción (S/)</TableHead>
            <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recetas.map((receta) => { // Changed type
            const productionCost = calculateProductionCost(receta);
            return (
              <TableRow key={receta.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
                <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[200px]">{receta.nombre}</TableCell>
                <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[150px]"> {/* NEW: Display category */}
                  <Badge variant="secondary" className="text-sm">{receta.category}</Badge>
                </TableCell>
                <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[300px]">{receta.descripcion || "N/A"}</TableCell>
                <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[180px]">S/ {productionCost.toFixed(2)}</TableCell>
                <TableCell className="flex justify-center space-x-2 py-3 px-6 min-w-[150px]">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(receta)} // Changed type
                    className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 ease-in-out"
                  >
                    <Edit className="h-5 w-5 text-blue-600" />
                  </Button>
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
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la receta <span className="font-semibold">{receta.nombre}</span> y sus insumos asociados de nuestros servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                        <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(receta.id)} // Changed type
                          className="w-full sm:w-auto px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecetaList;