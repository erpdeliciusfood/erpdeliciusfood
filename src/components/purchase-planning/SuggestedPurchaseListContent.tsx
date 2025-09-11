import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShoppingBag, PlusCircle, Info, Loader2 } from "lucide-react";
import { Insumo, PurchaseRecordFormValues } from "@/types";
import PurchaseRecordForm from "./PurchaseRecordForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAddPurchaseRecord } from "@/hooks/usePurchaseRecords";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import ReasonBadge from "@/components/shared/ReasonBadge"; // NEW: Import ReasonBadge

interface InsumoNeeded extends Insumo {
  quantity_needed_for_period_raw: number;
  quantity_needed_for_period_rounded: number;
  quantity_needed_for_period_rounded_up: boolean;
  current_stock: number;
  purchase_suggestion_raw: number;
  purchase_suggestion_rounded: number;
  purchase_suggestion_rounded_up: boolean;
  estimated_purchase_cost: number;
  reason_for_purchase_suggestion: 'menu_demand' | 'min_stock_level' | 'both' | 'zero_stock_alert';
}

interface SuggestedPurchaseListContentProps {
  suggestedPurchases: InsumoNeeded[];
  onClose: () => void;
  initialSelectedInsumoIds?: Set<string>; // NEW: Prop for initial selection
}

const SuggestedPurchaseListContent: React.FC<SuggestedPurchaseListContentProps> = ({
  suggestedPurchases,
  onClose,
  initialSelectedInsumoIds, // NEW
}) => {
  const queryClient = useQueryClient();
  const addPurchaseRecordMutation = useAddPurchaseRecord();

  // NEW: Initialize selectedInsumoIds with initialSelectedInsumoIds if provided
  const [selectedInsumoIds, setSelectedInsumoIds] = useState<Set<string>>(
    initialSelectedInsumoIds ? new Set(initialSelectedInsumoIds) : new Set()
  );
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [isRegisteringBatch, setIsRegisteringBatch] = useState(false);

  const [isIndividualRegisterFormOpen, setIsIndividualRegisterFormOpen] = useState(false);
  const [selectedInsumoForIndividualRegistration, setSelectedInsumoForIndividualRegistration] = useState<InsumoNeeded | null>(null);

  const purchasableInsumos = suggestedPurchases.filter(i => i.purchase_suggestion_rounded > 0);

  useEffect(() => {
    // Update "Select All" checkbox state when suggestedPurchases or selectedInsumoIds change
    const allPurchasableIds = purchasableInsumos.map(i => i.id);
    setIsSelectAllChecked(allPurchasableIds.length > 0 && selectedInsumoIds.size === allPurchasableIds.length);
  }, [purchasableInsumos, selectedInsumoIds]);

  // NEW: Effect to update internal selectedInsumoIds if initialSelectedInsumoIds changes
  useEffect(() => {
    if (initialSelectedInsumoIds) {
      setSelectedInsumoIds(new Set(initialSelectedInsumoIds));
    }
  }, [initialSelectedInsumoIds]);

  const handleCheckboxChange = (insumoId: string, checked: boolean) => {
    setSelectedInsumoIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(insumoId);
      } else {
        newSet.delete(insumoId);
      }
      return newSet;
    });
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const allPurchasableIds = purchasableInsumos.map(i => i.id);
      setSelectedInsumoIds(new Set(allPurchasableIds));
    } else {
      setSelectedInsumoIds(new Set());
    }
    setIsSelectAllChecked(checked);
  };

  const handleIndividualRegisterFormOpen = (insumo: InsumoNeeded) => {
    setSelectedInsumoForIndividualRegistration(insumo);
    setIsIndividualRegisterFormOpen(true);
  };

  const handleIndividualRegisterFormClose = () => {
    setIsIndividualRegisterFormOpen(false);
    setSelectedInsumoForIndividualRegistration(null);
    queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
    queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
    queryClient.invalidateQueries({ queryKey: ["insumos"] });
    setSelectedInsumoIds(prev => {
      const newSet = new Set(prev);
      if (selectedInsumoForIndividualRegistration) {
        newSet.delete(selectedInsumoForIndividualRegistration.id);
      }
      return newSet;
    });
  };

  const handleBatchRegister = async () => {
    setIsRegisteringBatch(true);
    const batchToastId = showLoading(`Registrando ${selectedInsumoIds.size} compras...`);
    let successfulRegistrations = 0;
    let failedRegistrations = 0;

    const selectedInsumosToPurchase = suggestedPurchases.filter(insumo => selectedInsumoIds.has(insumo.id));

    for (const insumo of selectedInsumosToPurchase) {
      try {
        await addPurchaseRecordMutation.mutateAsync({
          insumo_id: insumo.id,
          purchase_date: new Date().toISOString().split('T')[0],
          quantity_purchased: insumo.purchase_suggestion_rounded,
          quantity_received: insumo.purchase_suggestion_rounded, // NEW: Set quantity_received to full amount for batch
          unit_cost_at_purchase: insumo.costo_unitario,
          total_amount: insumo.estimated_purchase_cost,
          supplier_name_at_purchase: insumo.supplier_name || null,
          supplier_phone_at_purchase: insumo.supplier_phone || null,
          supplier_address_at_purchase: insumo.supplier_address || null,
          from_registered_supplier: true,
          notes: `Compra sugerida por análisis para el período.`,
          status: 'received_by_warehouse', // NEW: Set status to received by warehouse for batch
          received_date: new Date().toISOString().split('T')[0], // NEW: Set received date for batch
        } as PurchaseRecordFormValues);
        successfulRegistrations++;
      } catch (error: any) {
        failedRegistrations++;
        showError(`Error al registrar compra para ${insumo.nombre}: ${error.message}`);
      }
    }

    dismissToast(batchToastId);
    if (successfulRegistrations > 0) {
      showSuccess(`Se registraron ${successfulRegistrations} compras exitosamente.`);
    }
    if (failedRegistrations > 0) {
      showError(`Fallaron ${failedRegistrations} registros de compra.`);
    }

    setIsRegisteringBatch(false);
    setSelectedInsumoIds(new Set());
    setIsSelectAllChecked(false);
    onClose();
  };

  if (purchasableInsumos.length === 0) {
    return (
      <div className="text-center py-6 text-gray-600 dark:text-gray-400">
        <ShoppingBag className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
        <p className="text-lg">No hay insumos sugeridos para comprar en este período.</p>
        <Button onClick={onClose} className="mt-4">Cerrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-700 dark:text-gray-300">
        Aquí tienes una lista de insumos sugeridos para comprar. Puedes seleccionar varios para registrarlos en lote o registrar uno por uno.
      </p>

      <div className="flex items-center space-x-2 p-2 border-b dark:border-gray-700">
        <Checkbox
          id="select-all"
          checked={isSelectAllChecked}
          onCheckedChange={(checked: boolean) => handleSelectAllChange(checked)}
          disabled={isRegisteringBatch || purchasableInsumos.length === 0}
        />
        <label
          htmlFor="select-all"
          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Seleccionar Todo ({selectedInsumoIds.size}/{purchasableInsumos.length} seleccionados)
        </label>
        <Button
          onClick={handleBatchRegister}
          disabled={selectedInsumoIds.size === 0 || isRegisteringBatch}
          className="ml-auto px-4 py-2 text-base bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out"
        >
          {isRegisteringBatch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Seleccionados ({selectedInsumoIds.size})
        </Button>
      </div>

      <div className="space-y-4">
        {purchasableInsumos.map((insumo) => (
          <Card key={insumo.id} className="p-4 shadow-sm dark:bg-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`insumo-${insumo.id}`}
                  checked={selectedInsumoIds.has(insumo.id)}
                  onCheckedChange={(checked: boolean) => handleCheckboxChange(insumo.id, checked)}
                  disabled={isRegisteringBatch}
                />
                <label
                  htmlFor={`insumo-${insumo.id}`}
                  className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {insumo.nombre}
                </label>
              </div>
              <Dialog open={isIndividualRegisterFormOpen && selectedInsumoForIndividualRegistration?.id === insumo.id} onOpenChange={setIsIndividualRegisterFormOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIndividualRegisterFormOpen(insumo)}
                    className="px-4 py-2 text-base bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 ease-in-out"
                    disabled={isRegisteringBatch}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar Compra
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Registrar Compra de {selectedInsumoForIndividualRegistration?.nombre}
                    </DialogTitle>
                  </DialogHeader>
                  {selectedInsumoForIndividualRegistration && (
                    <PurchaseRecordForm
                      prefilledInsumoId={selectedInsumoForIndividualRegistration.id}
                      prefilledQuantity={selectedInsumoForIndividualRegistration.purchase_suggestion_rounded}
                      prefilledUnitCost={selectedInsumoForIndividualRegistration.costo_unitario}
                      prefilledSupplierName={selectedInsumoForIndividualRegistration.supplier_name || ""}
                      prefilledSupplierPhone={selectedInsumoForIndividualRegistration.supplier_phone || ""}
                      prefilledSupplierAddress={selectedInsumoForIndividualRegistration.supplier_address || ""}
                      onSuccess={handleIndividualRegisterFormClose}
                      onCancel={handleIndividualRegisterFormClose}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p className="mb-1">
                <span className="font-semibold">Motivo de Sugerencia:</span> <ReasonBadge reason={insumo.reason_for_purchase_suggestion} /> {/* NEW: Use ReasonBadge */}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Unidad de Compra:</span> {insumo.purchase_unit}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Costo Unitario Sugerido:</span> S/ {insumo.costo_unitario.toFixed(2)}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Stock Actual:</span>{" "}
                <Badge variant={insumo.current_stock <= (insumo.min_stock_level ?? 0) ? "destructive" : "outline"}>
                  {insumo.current_stock} {insumo.purchase_unit}
                </Badge>
              </p>
              <p className="mb-1">
                <span className="font-semibold">Necesidad para el Período:</span>{" "}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center cursor-help">
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
                        <span className="whitespace-nowrap"> {/* NEW: Added whitespace-nowrap */}
                          {insumo.purchase_suggestion_rounded} {insumo.purchase_unit}
                        </span>
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
        <Button variant="outline" onClick={onClose} disabled={isRegisteringBatch}>Cerrar Lista</Button>
      </div>
    </div>
  );
};

export default SuggestedPurchaseListContent;