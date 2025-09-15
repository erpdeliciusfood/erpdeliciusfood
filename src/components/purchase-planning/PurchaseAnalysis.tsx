import React, { useState, useEffect } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Insumo, InsumoNeeded as InsumoNeededType } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InsumoSupplierDetailsDialog from "@/components/insumos/InsumoSupplierDetailsDialog";
import PurchaseRecordForm from "@/components/purchase-planning/PurchaseRecordForm";
import PurchaseCostSummary from "./PurchaseCostSummary";
import PurchaseTableActions from "./PurchaseTableActions";
import InsumoPurchaseTable from "./InsumoPurchaseTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePurchaseAnalysisData } from "@/hooks/usePurchaseAnalysisData"; // NEW: Import the new hook

interface PurchaseAnalysisProps {
  startDate: Date;
  endDate: Date;
  selectedReasonFilter: 'all' | InsumoNeededType['reason_for_purchase_suggestion'];
}

interface InsumoNeeded extends InsumoNeededType {}

const PurchaseAnalysis: React.FC<PurchaseAnalysisProps> = ({ startDate, endDate, selectedReasonFilter }) => {
  const [isSupplierDetailsDialogOpen, setIsSupplierDetailsDialogOpen] = useState(false);
  const [selectedInsumoForDetails, setSelectedInsumoForDetails] = useState<Insumo | null>(null);
  const [isSuggestedPurchaseListOpen, setIsSuggestedPurchaseListOpen] = useState(false);

  const [isIndividualPurchaseFormOpen, setIsIndividualPurchaseFormOpen] = useState(false);
  const [selectedInsumoForIndividualPurchase, setSelectedInsumoForIndividualPurchase] = useState<InsumoNeeded | null>(null);

  const [selectedInsumoIds, setSelectedInsumoIds] = useState<Set<string>>(new Set());
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  // NEW: Use the custom hook to get the data and loading/error states
  const { insumosForPurchase, totalEstimatedPurchaseCost, isLoading, isError, error } = usePurchaseAnalysisData({
    startDate,
    endDate,
    selectedReasonFilter,
  });

  useEffect(() => {
    const allPurchasableIds = insumosForPurchase.filter((i: InsumoNeeded) => i.purchase_suggestion_rounded > 0).map((i: InsumoNeeded) => i.id);
    setIsSelectAllChecked(allPurchasableIds.length > 0 && selectedInsumoIds.size === allPurchasableIds.length);
  }, [insumosForPurchase, selectedInsumoIds]);

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
      const allPurchasableIds = insumosForPurchase.filter((i: InsumoNeeded) => i.purchase_suggestion_rounded > 0).map((i: InsumoNeeded) => i.id);
      setSelectedInsumoIds(new Set(allPurchasableIds));
    } else {
      setSelectedInsumoIds(new Set());
    }
    setIsSelectAllChecked(checked);
  };

  const handleOpenSupplierDetails = (insumo: Insumo) => {
    setSelectedInsumoForDetails(insumo);
    setIsSupplierDetailsDialogOpen(true);
  };

  const handleCloseSupplierDetails = () => {
    setIsSupplierDetailsDialogOpen(false);
    setSelectedInsumoForDetails(null);
  };

  const handleCloseSuggestedPurchaseList = () => {
    setIsSuggestedPurchaseListOpen(false);
  };

  const handleOpenIndividualPurchaseForm = (insumo: InsumoNeeded) => {
    setSelectedInsumoForIndividualPurchase(insumo);
    setIsIndividualPurchaseFormOpen(true);
  };

  const handleCloseIndividualPurchaseForm = () => {
    setIsIndividualPurchaseFormOpen(false);
    setSelectedInsumoForIndividualPurchase(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Analizando necesidades de insumos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        <h1 className="text-2xl font-bold mb-4">Error al cargar datos</h1>
        <p className="text-lg">No se pudieron cargar los datos necesarios para la planificación: {error?.message}</p>
      </div>
    );
  }

  const formattedStartDate = format(startDate, "PPP", { locale: es });
  const formattedEndDate = format(endDate, "PPP", { locale: es });

  return (
    <div className="space-y-8">
      <PurchaseCostSummary totalEstimatedPurchaseCost={totalEstimatedPurchaseCost} isLoading={isLoading} />

      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Análisis de Compras ({formattedStartDate} - {formattedEndDate})
          </CardTitle>
          <PurchaseTableActions
            insumosForPurchase={insumosForPurchase}
            selectedInsumoIds={selectedInsumoIds}
            isSelectAllChecked={isSelectAllChecked}
            handleSelectAllChange={handleSelectAllChange}
            setIsSuggestedPurchaseListOpen={setIsSuggestedPurchaseListOpen}
            isSuggestedPurchaseListOpen={isSuggestedPurchaseListOpen}
            handleCloseSuggestedPurchaseList={handleCloseSuggestedPurchaseList}
          />
        </CardHeader>
        <CardContent>
          {insumosForPurchase.length > 0 ? (
            <InsumoPurchaseTable
              insumosForPurchase={insumosForPurchase}
              selectedInsumoIds={selectedInsumoIds}
              handleCheckboxChange={handleCheckboxChange}
              handleOpenSupplierDetails={handleOpenSupplierDetails}
              handleOpenIndividualPurchaseForm={handleOpenIndividualPurchaseForm}
            />
          ) : (
            <div className="text-center py-6 text-gray-600 dark:text-gray-400">
              <ShoppingBag className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
              <p className="text-xl font-semibold mb-2">No se encontraron sugerencias de compra.</p>
              <p className="text-md">
                Asegúrate de que los menús estén planificados con recetas e insumos para este rango de fechas, o que tus niveles de stock estén por debajo de lo necesario o de tu stock mínimo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSupplierDetailsDialogOpen} onOpenChange={setIsSupplierDetailsDialogOpen}>
        {selectedInsumoForDetails && (
          <InsumoSupplierDetailsDialog
            insumo={selectedInsumoForDetails}
            onClose={handleCloseSupplierDetails}
          />
        )}
      </Dialog>

      <Dialog open={isIndividualPurchaseFormOpen} onOpenChange={setIsIndividualPurchaseFormOpen}>
        {selectedInsumoForIndividualPurchase && (
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Registrar Compra de {selectedInsumoForIndividualPurchase.nombre}
              </DialogTitle>
            </DialogHeader>
            <PurchaseRecordForm
              prefilledInsumoId={selectedInsumoForIndividualPurchase.id}
              prefilledQuantity={selectedInsumoForIndividualPurchase.purchase_suggestion_rounded}
              prefilledUnitCost={selectedInsumoForIndividualPurchase.costo_unitario}
              prefilledSupplierName={selectedInsumoForIndividualPurchase.supplier_name || ""}
              prefilledSupplierPhone={selectedInsumoForIndividualPurchase.supplier_phone || ""}
              prefilledSupplierAddress={selectedInsumoForIndividualPurchase.supplier_address || ""}
              onSuccess={handleCloseIndividualPurchaseForm}
              onCancel={handleCloseIndividualPurchaseForm}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default PurchaseAnalysis;