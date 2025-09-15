import { useMemo } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker"; // <-- Fixed: Changed to type import
import { useMenus } from "@/hooks/useMenus";
import { useInsumos } from "@/hooks/useInsumos";
import { Insumo, MenuPlatoWithRelations, PlatoInsumoWithRelations, InsumoNeeded, MenuWithRelations } from "@/types";

interface UsePurchaseAnalysisDataProps {
  startDate: Date;
  endDate: Date;
  selectedReasonFilter: 'all' | InsumoNeeded['reason_for_purchase_suggestion'];
}

export const usePurchaseAnalysisData = ({ startDate, endDate, selectedReasonFilter }: UsePurchaseAnalysisDataProps) => {
  const { data: menus, isLoading: isLoadingMenus, isError: isErrorMenus, error: errorMenus } = useMenus(
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd")
  );
  const { data: allInsumosData, isLoading: isLoadingInsumos, isError: isErrorInsumos, error: errorInsumos } = useInsumos(undefined, undefined, 1, 9999);

  const isLoading = isLoadingMenus || isLoadingInsumos;
  const isError = isErrorMenus || isErrorInsumos;
  const error = errorMenus || errorInsumos;

  const { insumosForPurchase, totalEstimatedPurchaseCost } = useMemo(() => {
    if (isLoading || isError || !menus || !allInsumosData?.data) {
      return { insumosForPurchase: [], totalEstimatedPurchaseCost: 0 };
    }

    const insumoNeedsMap = new Map<string, number>();

    menus.forEach((menu: MenuWithRelations) => {
      if (menu.menu_date && isWithinInterval(parseISO(menu.menu_date), { start: startDate, end: endDate })) {
        menu.menu_platos?.forEach((menuPlato: MenuPlatoWithRelations) => {
          const plato = menuPlato.platos;
          if (plato) {
            plato.plato_insumos?.forEach((platoInsumo: PlatoInsumoWithRelations) => {
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

  return {
    insumosForPurchase,
    totalEstimatedPurchaseCost,
    isLoading,
    isError,
    error,
  };
};