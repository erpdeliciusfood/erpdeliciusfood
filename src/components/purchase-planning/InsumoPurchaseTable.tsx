import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Building2, PlusCircle } from "lucide-react";
import { Insumo, InsumoNeeded } from "@/types";
import ReasonBadge from "@/components/shared/ReasonBadge"; // NEW: Import ReasonBadge

interface InsumoPurchaseTableProps {
  insumosForPurchase: InsumoNeeded[];
  selectedInsumoIds: Set<string>;
  handleCheckboxChange: (insumoId: string, checked: boolean) => void;
  handleOpenSupplierDetails: (insumo: Insumo) => void;
  handleOpenIndividualPurchaseForm: (insumo: InsumoNeeded) => void;
}

const InsumoPurchaseTable: React.FC<InsumoPurchaseTableProps> = ({
  insumosForPurchase,
  selectedInsumoIds,
  handleCheckboxChange,
  handleOpenSupplierDetails,
  handleOpenIndividualPurchaseForm,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center"></TableHead> {/* Checkbox column, header handled by PurchaseTableActions */}
            <TableHead className="w-[200px] text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
            <TableHead className="w-[120px] text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Unidad Compra</TableHead>
            <TableHead className="w-[150px] text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Costo Unitario (S/)</TableHead>
            <TableHead className="w-[120px] text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Actual</TableHead>
            <TableHead className="w-[150px] text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Necesidad Periodo</TableHead>
            <TableHead className="w-[150px] text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Sugerencia Compra</TableHead>
            <TableHead className="w-[150px] text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Costo Estimado (S/)</TableHead>
            <TableHead className="w-[150px] text-center text-lg font-semibold text-gray-700 dark:text-gray-200">Motivo</TableHead>
            <TableHead className="w-[100px] text-center text-lg font-semibold text-gray-700 dark:text-gray-200">Proveedor</TableHead>
            <TableHead className="w-[150px] text-center text-lg font-semibold text-gray-700 dark:text-gray-200">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insumosForPurchase.map((insumo) => (
            <TableRow key={insumo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <TableCell className="text-center">
                <Checkbox
                  checked={selectedInsumoIds.has(insumo.id)}
                  onCheckedChange={(checked: boolean) => handleCheckboxChange(insumo.id, checked)}
                  disabled={insumo.purchase_suggestion_rounded === 0}
                />
              </TableCell>
              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 text-left">{insumo.nombre}</TableCell>
              <TableCell className="text-left text-base text-gray-700 dark:text-gray-300">{insumo.purchase_unit}</TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">S/ {insumo.costo_unitario.toFixed(2)}</TableCell>
              <TableCell className="text-right text-base">
                <Badge variant={insumo.current_stock <= (insumo.min_stock_level ?? 0) ? "destructive" : "outline"}>
                  {insumo.current_stock}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
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
              </TableCell>
              <TableCell className="text-right text-base">
                {insumo.purchase_suggestion_rounded > 0 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-lg px-3 py-1 inline-flex items-center cursor-help">
                          <span className="whitespace-nowrap"> {/* NEW: Added whitespace-nowrap */}
                            {insumo.purchase_suggestion_rounded} {insumo.purchase_unit}
                          </span>
                          {insumo.purchase_suggestion_rounded_up && (
                            <Info className="ml-1 h-4 w-4 text-white" />
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
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">0 {insumo.purchase_unit}</span>
                )}
              </TableCell>
              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                S/ {insumo.estimated_purchase_cost.toFixed(2)}
              </TableCell>
              <TableCell className="text-center text-base py-3 px-6">
                <ReasonBadge reason={insumo.reason_for_purchase_suggestion} /> {/* NEW: Use ReasonBadge */}
              </TableCell>
              <TableCell className="text-center py-3 px-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenSupplierDetails(insumo as Insumo)}
                  className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                >
                  <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Button>
              </TableCell>
              <TableCell className="text-center py-3 px-6">
                {insumo.purchase_suggestion_rounded > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenIndividualPurchaseForm(insumo)}
                    className="px-3 py-1 text-sm bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
                  >
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Registrar Compra
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InsumoPurchaseTable;