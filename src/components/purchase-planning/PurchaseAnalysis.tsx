import React, { useMemo, useState, useEffect } from "react";
import { useMenus } from "@/hooks/useMenus";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2, ShoppingBag } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Insumo } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InsumoSupplierDetailsDialog from "@/components/insumos/InsumoSupplierDetailsDialog";
import PurchaseRecordForm from "@/components/purchase-planning/PurchaseRecordForm";
import PurchaseCostSummary from "./PurchaseCostSummary";
import PurchaseTableActions from "./PurchaseTableActions";
import InsumoPurchaseTable from "./InsumoPurchaseTable";
import ReasonBadge from "@/components/shared/ReasonBadge"; // NEW: Import ReasonBadge

interface PurchaseAnalysisProps {
  startDate: Date;
  endDate: Date;
  selectedReasonFilter: 'all' | InsumoNeeded['reason_for_purchase_suggestion'];
}

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

const PurchaseAnalysis: React.FC<PurchaseAnalysisProps> = ({ startDate, endDate, selectedReasonFilter }) => {
  const { data: menus, isLoading: isLoadingMenus, isError: isErrorMenus, error: errorMenus } = useMenus(
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd")
  );
  const { data: allInsumosData, isLoading: isLoadingInsumos, isError: isErrorInsumos, error: errorInsumos } = useInsumos(undefined, undefined, 1, 9999);

  const [isSupplierDetailsDialogOpen, setIsSupplierDetailsDialogOpen] = useState(false);
  const [selectedInsumoForDetails, setSelectedInsumoForDetails] = useState<Insumo | null>(null);
  const [isSuggestedPurchaseListOpen, setIsSuggestedPurchaseListOpen] = useState(false);

  const [isIndividualPurchaseFormOpen, setIsIndividualPurchaseFormOpen] = useState(false);
  const [selectedInsumoForIndividualPurchase, setSelectedInsumoForIndividualPurchase] = useState<InsumoNeeded | null>(null);

  const [selectedInsumoIds, setSelectedInsumoIds] = useState<Set<string>>(new Set());
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  const isLoading = isLoadingMenus || isLoadingInsumos;
  const isError = isErrorMenus || isErrorInsumos;
  const error = errorMenus || errorInsumos;

  const { insumosForPurchase, totalEstimatedPurchaseCost } = useMemo(() => {
    if (isLoading || isError || !menus || !allInsumosData?.data) {
      return { insumosForPurchase: [], totalEstimatedPurchaseCost: 0 };
    }

    const insumoNeedsMap = new Map<string, number>();

    menus.forEach(menu => {
      if (menu.menu_date && isWithinInterval(parseISO(menu.menu_date), { start: startDate, end: endDate })) {
        menu.menu_platos?.forEach(menuPlato => {
          const plato = menuPlato.platos;
          if (plato) {
            plato.plato_insumos?.forEach(platoInsumo => {
              const insumo = platoInsumo.insumos;
              if (insumo) {
                const totalNeededBaseUnit = (platoInsumo.cantidad_necesaria * menuPlato.quantity_needed);
                const totalNeededPurchaseUnit = totalNeededBaseUnit / insumo.conversion_factor;
                insumoNeedsMap.set(insumo.id, (insumoNeedsMap.get(insumo.id) || 0) + totalNeededPurchaseUnit);
              }
            });
          }
        });
      }
    });

    let overallEstimatedCost = 0;
    const result: InsumoNeeded[] = [];
    allInsumosData.data.forEach((insumo: Insumo) => {
      const quantityNeededForPeriodRaw = insumoNeedsMap.get(insumo.id) || 0;
      const currentStock = insumo.stock_quantity;
      const minStockLevel = insumo.min_stock_level ?? 0;

      const quantityNeededForPeriodRounded = quantityNeededForPeriodRaw > 0 && quantityNeededForPeriodRaw % 1 !== 0
        ? Math.ceil(quantityNeededForPeriodRaw)
        : parseFloat(quantityNeededForPeriodRaw.toFixed(2));
      const quantityNeededForPeriodRoundedUp = quantityNeededForPeriodRaw > 0 && quantityNeededForPeriodRaw % 1 !== 0;

      const neededToCoverMenus = Math.max(0, quantityNeededForPeriodRaw - currentStock);
      const neededToReachMinStock = Math.max(0, minStockLevel - currentStock);
      
      let purchaseSuggestionRaw = Math.max(neededToCoverMenus, neededToReachMinStock);
      let reason: 'menu_demand' | 'min_stock_level' | 'both' | 'zero_stock_alert' = 'menu_demand';

      const isMenuDriven = quantityNeededForPeriodRaw > currentStock;
      const isMinStockDriven = minStockLevel > currentStock;

      if (isMenuDriven && isMinStockDriven) {
        reason = 'both';
      } else if (isMenuDriven) {
        reason = 'menu_demand';
      } else if (isMinStockDriven) {
        reason = 'min_stock_level';
      } else if (currentStock <= 0 && purchaseSuggestionRaw === 0) {
        purchaseSuggestionRaw = 1;
        reason = 'zero_stock_alert';
      }

      const purchaseSuggestionRounded = purchaseSuggestionRaw > 0 && purchaseSuggestionRaw % 1 !== 0
        ? Math.ceil(purchaseSuggestionRaw)
        : parseFloat(purchaseSuggestionRaw.toFixed(2));
      const purchaseSuggestionRoundedUp = purchaseSuggestionRaw > 0 && purchaseSuggestionRaw % 1 !== 0;

      const estimatedPurchaseCost = purchaseSuggestionRounded * insumo.costo_unitario;

      if (purchaseSuggestionRounded > 0) {
        result.push({
          ...insumo,
          quantity_needed_for_period_raw: parseFloat(quantityNeededForPeriodRaw.toFixed(2)),
          quantity_needed_for_period_rounded: quantityNeededForPeriodRounded,
          quantity_needed_for_period_rounded_up: quantityNeededForPeriodRoundedUp,
          current_stock: parseFloat(currentStock.toFixed(2)),
          purchase_suggestion_raw: parseFloat(purchaseSuggestionRaw.toFixed(2)),
          purchase_suggestion_rounded: purchaseSuggestionRounded,
          purchase_suggestion_rounded_up: purchaseSuggestionRoundedUp,
          estimated_purchase_cost: parseFloat(estimatedPurchaseCost.toFixed(2)),
          reason_for_purchase_suggestion: reason,
        });
        overallEstimatedCost += estimatedPurchaseCost;
      }
    });

    const filteredResult = selectedReasonFilter === 'all'
      ? result
      : result.filter(insumo => insumo.reason_for_purchase_suggestion === selectedReasonFilter);

    return {
      insumosForPurchase: filteredResult.sort((a, b) => b.purchase_suggestion_rounded - a.purchase_suggestion_rounded),
      totalEstimatedPurchaseCost: parseFloat(overallEstimatedCost.toFixed(2)),
    };
  }, [menus, allInsumosData?.data, startDate, endDate, isLoading, isError, selectedReasonFilter]);

  useEffect(() => {
    const allPurchasableIds = insumosForPurchase.filter(i => i.purchase_suggestion_rounded > 0).map(i => i.id);
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
      const allPurchasableIds = insumosForPurchase.filter(i => i.purchase_suggestion_rounded > 0).map(i => i.id);
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
      <PurchaseCostSummary totalEstimatedPurchaseCost={totalEstimatedPurchaseCost} isLoading={isLoading} /> {/* Pass isLoading */}

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