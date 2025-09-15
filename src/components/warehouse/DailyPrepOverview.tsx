"use client";

import React, { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { AggregatedInsumoNeed, GroupedInsumoNeeds, MenuPlatoWithRelations, PlatoInsumoWithRelations, MenuWithRelations, InsumoDeductionItem } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { showError } from "@/utils/toast";
import DeductQuantitiesDialog from "./DeductQuantitiesDialog";
import UrgentPurchaseRequestDialog from "./UrgentPurchaseRequestDialog";
import DailyPrepOverviewCards from "./DailyPrepOverviewCards";
import DailyPrepOverviewTable from "./DailyPrepOverviewTable";

interface DailyPrepOverviewProps {
  selectedDate: Date;
  menus: MenuWithRelations[];
}

const DailyPrepOverview: React.FC<DailyPrepOverviewProps> = ({ selectedDate, menus }) => {
  const [stockFilter, setStockFilter] = useState<'all' | 'sufficient' | 'insufficient'>('all');
  const [selectedDeductionItemIds, setSelectedDeductionItemIds] = useState<Set<string>>(new Set());
  const [isDeductQuantitiesDialogOpen, setIsDeductQuantitiesDialogOpen] = useState(false);
  const [isUrgentPurchaseRequestDialogOpen, setIsUrgentPurchaseRequestDialogOpen] = useState(false);
  const [selectedInsumoForUrgentRequest, setSelectedInsumoForUrgentRequest] = useState<AggregatedInsumoNeed | null>(null);

  const [insumosForSingleDeduction, setInsumosForSingleDeduction] = useState<InsumoDeductionItem[]>([]);
  const [isSingleDeductionDialogOpen, setIsSingleDeductionDialogOpen] = useState(false);


  const allDeductionItems: InsumoDeductionItem[] = useMemo(() => {
    const items: InsumoDeductionItem[] = [];

    menus.forEach((menu: MenuWithRelations) => {
      menu.menu_platos?.forEach((menuPlato: MenuPlatoWithRelations) => {
        const mealServiceId = menuPlato.meal_service_id;
        const mealServiceName = menuPlato.meal_services?.name || "Sin Servicio";
        const platoId = menuPlato.plato_id;
        const platoNombre = menuPlato.platos?.nombre || "Receta Desconocida";
        const menuTitle = menu.title;
        const menuDate = menu.menu_date;

        if (!mealServiceId || !platoId) {
          console.warn(`menuPlato with ID ${menuPlato.id} is missing meal_service_id or plato_id.`);
          return;
        }

        menuPlato.platos?.plato_insumos?.forEach((platoInsumo: PlatoInsumoWithRelations) => {
          const insumo = platoInsumo.insumos;
          if (!insumo) return;

          const totalNeededBaseUnit = platoInsumo.cantidad_necesaria * menuPlato.quantity_needed;
          const totalNeededPurchaseUnit = totalNeededBaseUnit / insumo.conversion_factor;

          const unique_id = `${insumo.id}-${platoId}-${mealServiceId}-${menu.id}`;

          items.push({
            unique_id: unique_id,
            insumo_id: insumo.id,
            insumo_nombre: insumo.nombre,
            base_unit: insumo.base_unit,
            purchase_unit: insumo.purchase_unit,
            conversion_factor: insumo.conversion_factor,
            current_stock_quantity: insumo.stock_quantity,
            total_needed_base_unit_for_item: parseFloat(totalNeededBaseUnit.toFixed(2)),
            total_needed_purchase_unit_for_item: parseFloat(totalNeededPurchaseUnit.toFixed(2)),
            plato_id: platoId,
            plato_nombre: platoNombre,
            meal_service_id: mealServiceId,
            meal_service_name: mealServiceName,
            menu_id: menu.id,
            menu_title: menuTitle,
            menu_date: menuDate,
          });
        });
      });
    });

    return items.sort((a, b) => a.insumo_nombre.localeCompare(b.insumo_nombre));
  }, [menus]);

  const groupedForDisplay: GroupedInsumoNeeds[] = useMemo(() => {
    const serviceGroupsMap = new Map<string, GroupedInsumoNeeds>();

    allDeductionItems.forEach((item: InsumoDeductionItem) => {
      const mealServiceId = item.meal_service_id;
      const mealServiceName = item.meal_service_name;

      if (!serviceGroupsMap.has(mealServiceId)) {
        serviceGroupsMap.set(mealServiceId, {
          meal_service_id: mealServiceId,
          meal_service_name: mealServiceName,
          insumos: [],
        });
      }

      const currentServiceGroup = serviceGroupsMap.get(mealServiceId)!;
      const insumoNeedsMapForService = new Map<string, AggregatedInsumoNeed>();
      currentServiceGroup.insumos.forEach((insumo: AggregatedInsumoNeed) => insumoNeedsMapForService.set(insumo.insumo_id, insumo));

      const currentAggregatedEntry: AggregatedInsumoNeed = insumoNeedsMapForService.get(item.insumo_id) || {
        insumo_id: item.insumo_id,
        insumo_nombre: item.insumo_nombre,
        base_unit: item.base_unit,
        purchase_unit: item.purchase_unit,
        conversion_factor: item.conversion_factor,
        current_stock_quantity: item.current_stock_quantity,
        total_needed_base_unit: 0,
        total_needed_purchase_unit: 0,
        missing_quantity: 0,
        meal_service_id: item.meal_service_id,
        meal_service_name: item.meal_service_name,
      };

      currentAggregatedEntry.total_needed_base_unit += item.total_needed_base_unit_for_item;
      currentAggregatedEntry.total_needed_purchase_unit += item.total_needed_purchase_unit_for_item;
      insumoNeedsMapForService.set(item.insumo_id, currentAggregatedEntry);

      currentServiceGroup.insumos = Array.from(insumoNeedsMapForService.values()).map((entry: AggregatedInsumoNeed) => {
        const missing = Math.max(0, entry.total_needed_purchase_unit - entry.current_stock_quantity);
        return {
          ...entry,
          total_needed_base_unit: parseFloat(entry.total_needed_base_unit.toFixed(2)),
          total_needed_purchase_unit: parseFloat(entry.total_needed_purchase_unit.toFixed(2)),
          missing_quantity: parseFloat(missing.toFixed(2)),
        };
      }).sort((a: AggregatedInsumoNeed, b: AggregatedInsumoNeed) => a.insumo_nombre.localeCompare(b.insumo_nombre));
    });

    const allGroupedNeeds = Array.from(serviceGroupsMap.values()).sort((a: GroupedInsumoNeeds, b: GroupedInsumoNeeds) => a.meal_service_name.localeCompare(b.meal_service_name));

    const filteredGroupedNeeds = allGroupedNeeds.map((group: GroupedInsumoNeeds) => ({
      ...group,
      insumos: group.insumos.filter((need: AggregatedInsumoNeed) => {
        if (stockFilter === 'sufficient') {
          return need.current_stock_quantity >= need.total_needed_purchase_unit;
        } else if (stockFilter === 'insufficient') {
          return need.current_stock_quantity < need.total_needed_purchase_unit;
        }
        return true;
      })
    })).filter((group: GroupedInsumoNeeds) => group.insumos.length > 0);

    return filteredGroupedNeeds;
  }, [allDeductionItems, stockFilter]);


  const handleOpenDeductQuantitiesDialog = () => {
    const selectedItems = allDeductionItems.filter(
      (item: InsumoDeductionItem) => selectedDeductionItemIds.has(item.unique_id)
    );

    const itemsWithInsufficientStock = selectedItems.filter(
      (item: InsumoDeductionItem) => item.current_stock_quantity < item.total_needed_purchase_unit_for_item
    );

    if (selectedItems.length === 0) {
      showError("No se puede deducir el stock. Asegúrate de seleccionar al menos un insumo.");
      return;
    }

    if (itemsWithInsufficientStock.length > 0) {
      showError("No se puede deducir el stock. Hay insumos seleccionados con cantidades insuficientes.");
      return;
    }
    setIsDeductQuantitiesDialogOpen(true);
  };

  const handleCloseDeductQuantitiesDialog = () => {
    setIsDeductQuantitiesDialogOpen(false);
    setSelectedDeductionItemIds(new Set());
  };

  const handleOpenUrgentPurchaseRequestDialog = (insumoNeed: AggregatedInsumoNeed) => {
    setSelectedInsumoForUrgentRequest(insumoNeed);
    setIsUrgentPurchaseRequestDialogOpen(true);
  };

  const handleCloseUrgentPurchaseRequestDialog = () => {
    setIsUrgentPurchaseRequestDialogOpen(false);
    setSelectedInsumoForUrgentRequest(null);
  };

  const handleSendToKitchen = (insumoNeed: AggregatedInsumoNeed) => {
    const itemsToDeduct = allDeductionItems.filter(
      (item: InsumoDeductionItem) =>
        item.insumo_id === insumoNeed.insumo_id &&
        item.meal_service_id === insumoNeed.meal_service_id
    );

    if (itemsToDeduct.length === 0) {
      showError("No se encontraron ítems de insumo para deducir.");
      return;
    }

    if (insumoNeed.current_stock_quantity < insumoNeed.total_needed_purchase_unit) {
      showError(`Stock insuficiente para ${insumoNeed.insumo_nombre}. No se puede enviar a cocina.`);
      return;
    }

    setInsumosForSingleDeduction(itemsToDeduct);
    setIsSingleDeductionDialogOpen(true);
  };

  const handleCloseSingleDeductionDialog = () => {
    setIsSingleDeductionDialogOpen(false);
    setInsumosForSingleDeduction([]);
  };


  const insufficientStockCount = allDeductionItems.filter(
    (item: InsumoDeductionItem) => item.current_stock_quantity < item.total_needed_purchase_unit_for_item
  ).length;

  const formattedDate = format(selectedDate, "PPP", { locale: es });

  const isDeductButtonDisabled =
    selectedDeductionItemIds.size === 0 ||
    allDeductionItems.filter((item: InsumoDeductionItem) => selectedDeductionItemIds.has(item.unique_id) && item.current_stock_quantity < item.total_needed_purchase_unit_for_item).length > 0;

  const selectedInsumosForDialog = allDeductionItems.filter((item: InsumoDeductionItem) => selectedDeductionItemIds.has(item.unique_id));

  return (
    <div className="space-y-8">
      <DailyPrepOverviewCards
        totalMenus={menus.length}
        totalUniqueInsumos={allDeductionItems.length}
        insufficientStockCount={insufficientStockCount}
      />

      <DailyPrepOverviewTable
        formattedDate={formattedDate}
        groupedForDisplay={groupedForDisplay}
        allDeductionItems={allDeductionItems}
        selectedDeductionItemIds={selectedDeductionItemIds}
        setSelectedDeductionItemIds={setSelectedDeductionItemIds}
        handleSendToKitchen={handleSendToKitchen}
        handleOpenUrgentPurchaseRequestDialog={handleOpenUrgentPurchaseRequestDialog}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        handleOpenDeductQuantitiesDialog={handleOpenDeductQuantitiesDialog}
        isDeductButtonDisabled={isDeductButtonDisabled}
        itemsWithInsufficientStockCount={insufficientStockCount}
      />

      <Dialog open={isDeductQuantitiesDialogOpen} onOpenChange={setIsDeductQuantitiesDialogOpen}>
        <DeductQuantitiesDialog
          selectedDeductionItems={selectedInsumosForDialog}
          selectedDate={selectedDate}
          onClose={handleCloseDeductQuantitiesDialog}
        />
      </Dialog>

      <Dialog open={isSingleDeductionDialogOpen} onOpenChange={setIsSingleDeductionDialogOpen}>
        <DeductQuantitiesDialog
          selectedDeductionItems={insumosForSingleDeduction}
          selectedDate={selectedDate}
          onClose={handleCloseSingleDeductionDialog}
        />
      </Dialog>

      <Dialog open={isUrgentPurchaseRequestDialogOpen} onOpenChange={setIsUrgentPurchaseRequestDialogOpen}>
        {selectedInsumoForUrgentRequest && (
          <UrgentPurchaseRequestDialog
            insumoNeed={selectedInsumoForUrgentRequest}
            onClose={handleCloseUrgentPurchaseRequestDialog}
          />
        )}
      </Dialog>
    </div>
  );
};

export default DailyPrepOverview;