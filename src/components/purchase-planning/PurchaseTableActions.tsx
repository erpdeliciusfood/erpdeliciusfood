import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingBag } from "lucide-react"; // Removed Loader2
import SuggestedPurchaseListContent from "./SuggestedPurchaseListContent";
import { InsumoNeeded } from "@/types";

interface PurchaseTableActionsProps {
  insumosForPurchase: InsumoNeeded[];
  selectedInsumoIds: Set<string>;
  isSelectAllChecked: boolean;
  handleSelectAllChange: (checked: boolean) => void;
  setIsSuggestedPurchaseListOpen: (open: boolean) => void;
  isSuggestedPurchaseListOpen: boolean;
  handleCloseSuggestedPurchaseList: () => void;
}

const PurchaseTableActions: React.FC<PurchaseTableActionsProps> = ({
  insumosForPurchase,
  selectedInsumoIds,
  isSelectAllChecked,
  handleSelectAllChange,
  setIsSuggestedPurchaseListOpen,
  isSuggestedPurchaseListOpen,
  handleCloseSuggestedPurchaseList,
}) => {
  const purchasableInsumosCount = insumosForPurchase.filter(i => i.purchase_suggestion_rounded > 0).length;
  const selectedInsumosForBatchPurchase = insumosForPurchase.filter(insumo => selectedInsumoIds.has(insumo.id));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="select-all-table"
          checked={isSelectAllChecked}
          onCheckedChange={(checked: boolean) => handleSelectAllChange(checked)}
          disabled={purchasableInsumosCount === 0}
        />
        <label
          htmlFor="select-all-table"
          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Seleccionar Todo ({selectedInsumoIds.size}/{purchasableInsumosCount} seleccionados)
        </label>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {selectedInsumoIds.size > 0 && (
          <Dialog open={isSuggestedPurchaseListOpen} onOpenChange={setIsSuggestedPurchaseListOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="px-4 py-2 text-base bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 ease-in-out"
                disabled={selectedInsumoIds.size === 0}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Registrar {selectedInsumoIds.size} Seleccionados
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Registrar Compras Seleccionadas
                </DialogTitle>
              </DialogHeader>
              <SuggestedPurchaseListContent
                suggestedPurchases={selectedInsumosForBatchPurchase}
                onClose={handleCloseSuggestedPurchaseList}
                initialSelectedInsumoIds={selectedInsumoIds}
              />
            </DialogContent>
          </Dialog>
        )}
        <Dialog open={isSuggestedPurchaseListOpen && selectedInsumoIds.size === 0} onOpenChange={setIsSuggestedPurchaseListOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="px-4 py-2 text-base bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 ease-in-out"
              disabled={purchasableInsumosCount === 0}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver Todas Sugerencias ({purchasableInsumosCount})
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Lista de Compras Sugeridas
              </DialogTitle>
            </DialogHeader>
            <SuggestedPurchaseListContent
              suggestedPurchases={insumosForPurchase.filter(i => i.purchase_suggestion_rounded > 0)}
              onClose={handleCloseSuggestedPurchaseList}
              initialSelectedInsumoIds={selectedInsumoIds}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PurchaseTableActions;