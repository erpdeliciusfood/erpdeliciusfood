import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, PlusCircle, Info } from "lucide-react";
import { Insumo } from "@/types";
import PurchaseRecordForm from "./PurchaseRecordForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface InsumoNeeded extends Insumo {
  quantity_needed_for_period_raw: number;
  quantity_needed_for_period_rounded: number;
  quantity_needed_for_period_rounded_up: boolean;
  current_stock: number;
  purchase_suggestion_raw: number;
  purchase_suggestion_rounded: number;
  purchase_suggestion_rounded_up: boolean;
  estimated_purchase_cost: number;
}

interface SuggestedPurchaseListDialogProps {
  suggestedPurchases: InsumoNeeded[];
  onClose: () => void;
}

const SuggestedPurchaseListDialog: React.FC<SuggestedPurchaseListDialogProps> = ({
  suggestedPurchases,
  onClose,
}) => {
  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState(false);
  const [selectedInsumoForRegistration, setSelectedInsumoForRegistration] = useState<InsumoNeeded | null>(null);

  const handleOpenRegisterForm = (insumo: InsumoNeeded) => {
    setSelectedInsumoForRegistration(insumo);
    setIsRegisterFormOpen(true);
  };

  const handleCloseRegisterForm = () => {
    setIsRegisterFormOpen(false);
    setSelectedInsumoForRegistration(null);
    // Optionally, you might want to refresh the parent list or remove the item from the suggested list
    // For now, we'll just close the form. The parent PurchaseAnalysis will re-fetch on its own.
  };

  if (suggestedPurchases.length === 0) {
    return (
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Lista de Compras Sugeridas
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-6 text-gray-600 dark:text-gray-400">
          <ShoppingBag className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
          <p className="text-lg">No hay insumos sugeridos para comprar en este período.</p>
          <Button onClick={onClose} className="mt-4">Cerrar</Button>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Lista de Compras Sugeridas
        </DialogTitle>
      </DialogHeader>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Aquí tienes una lista de insumos sugeridos para comprar. Haz clic en "Registrar Compra" para cada uno y confirma los detalles.
      </p>
      <div className="space-y-4">
        {suggestedPurchases.map((insumo) => (
          <Card key={insumo.id} className="p-4 shadow-sm dark:bg-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {insumo.nombre}
              </CardTitle>
              <Dialog open={isRegisterFormOpen && selectedInsumoForRegistration?.id === insumo.id} onOpenChange={setIsRegisterFormOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRegisterForm(insumo)}
                    className="px-4 py-2 text-base bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 ease-in-out"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar Compra
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Registrar Compra de {selectedInsumoForRegistration?.nombre}
                    </DialogTitle>
                  </DialogHeader>
                  {selectedInsumoForRegistration && (
                    <PurchaseRecordForm
                      prefilledInsumoId={selectedInsumoForRegistration.id}
                      prefilledQuantity={selectedInsumoForRegistration.purchase_suggestion_rounded}
                      prefilledUnitCost={selectedInsumoForRegistration.costo_unitario}
                      prefilledSupplierName={selectedInsumoForRegistration.supplier_name || ""}
                      prefilledSupplierPhone={selectedInsumoForRegistration.supplier_phone || ""}
                      prefilledSupplierAddress={selectedInsumoForRegistration.supplier_address || ""}
                      onSuccess={handleCloseRegisterForm}
                      onCancel={handleCloseRegisterForm}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p className="mb-1">
                <span className="font-semibold">Unidad de Compra:</span> {insumo.purchase_unit}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Costo Unitario Sugerido:</span> S/ {insumo.costo_unitario.toFixed(2)}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Stock Actual:</span>{" "}
                <Badge variant={insumo.current_stock <= insumo.min_stock_level ? "destructive" : "outline"}>
                  {insumo.current_stock} {insumo.purchase_unit}
                </Badge>
              </p>
              <p className="mb-1">
                <span className="font-semibold">Necesidad para el Período:</span>{" "}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center">
                        {insumo.quantity_needed_for_period_rounded} {insumo.purchase_unit}
                        {insumo.quantity_needed_for_period_rounded_up && (
                          <Info className="ml-1 h-4 w-4 text-blue-500 cursor-help" />
                        )}
                      </span>
                    </TooltipTrigger>
                    {insumo.quantity_needed_for_period_rounded_up && (
                      <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                        <p>Valor real: {insumo.quantity_needed_for_period_raw.toFixed(2)} {insumo.purchase_unit}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </p>
              <p className="mb-1">
                <span className="font-semibold">Sugerencia de Compra:</span>{" "}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-lg px-3 py-1 inline-flex items-center">
                        {insumo.purchase_suggestion_rounded} {insumo.purchase_unit}
                        {insumo.purchase_suggestion_rounded_up && (
                          <Info className="ml-1 h-4 w-4 text-white cursor-help" />
                        )}
                      </Badge>
                    </TooltipTrigger>
                    {insumo.purchase_suggestion_rounded_up && (
                      <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                        <p>Valor real: {insumo.purchase_suggestion_raw.toFixed(2)} {insumo.purchase_unit}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </p>
              <p className="mb-1">
                <span className="font-semibold">Costo Estimado:</span> S/ {insumo.estimated_purchase_cost.toFixed(2)}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Proveedor Registrado:</span> {insumo.supplier_name || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Teléfono Proveedor:</span> {insumo.supplier_phone || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Dirección Proveedor:</span> {insumo.supplier_address || "N/A"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>Cerrar Lista</Button>
      </div>
    </DialogContent>
  );
};

export default SuggestedPurchaseListDialog;