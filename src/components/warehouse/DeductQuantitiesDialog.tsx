"use client";

import React, { useState, useMemo } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InsumoDeductionItem } from "@/types";
import { createStockMovement } from "@/integrations/supabase/stockMovements";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query"; // NEW: Import useQueryClient

interface DeductQuantitiesDialogProps {
  selectedDeductionItems: InsumoDeductionItem[];
  selectedDate: Date;
  onClose: () => void;
}

const DeductQuantitiesDialog: React.FC<DeductQuantitiesDialogProps> = ({
  selectedDeductionItems,
  selectedDate,
  onClose,
}) => {
  const { user } = useSession();
  const queryClient = useQueryClient(); // NEW: Initialize queryClient
  const [deductorName, setDeductorName] = useState("");
  const [deductionReason, setDeductionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // quantitiesToDeduct will now be keyed by unique_id
  const [quantitiesToDeduct, setQuantitiesToDeduct] = useState<Record<string, number>>(() => {
    const initialQuantities: Record<string, number> = {};
    selectedDeductionItems.forEach(item => {
      initialQuantities[item.unique_id] = parseFloat(item.total_needed_purchase_unit_for_item.toFixed(2));
    });
    return initialQuantities;
  });

  // itemsToProcess is now just the selectedDeductionItems with added quantity_to_deduct
  const itemsToProcess = useMemo(() => {
    return selectedDeductionItems.map(item => ({
      ...item,
      quantity_to_deduct: quantitiesToDeduct[item.unique_id] !== undefined
        ? quantitiesToDeduct[item.unique_id]
        : parseFloat(item.total_needed_purchase_unit_for_item.toFixed(2)),
    }));
  }, [selectedDeductionItems, quantitiesToDeduct]);

  const isAnyQuantityModified = useMemo(() => {
    return itemsToProcess.some(item =>
      quantitiesToDeduct[item.unique_id] !== undefined &&
      quantitiesToDeduct[item.unique_id] !== item.total_needed_purchase_unit_for_item
    );
  }, [itemsToProcess, quantitiesToDeduct]);

  const handleQuantityChange = (uniqueId: string, value: string) => {
    const numValue = parseFloat(value);
    setQuantitiesToDeduct(prev => ({
      ...prev,
      [uniqueId]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleDeduct = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para realizar esta acción.");
      return;
    }
    if (!deductorName.trim()) {
      toast.error("Por favor, ingresa el nombre de la persona que realiza la deducción.");
      return;
    }
    if (isAnyQuantityModified && !deductionReason.trim()) {
      toast.error("Por favor, ingresa un motivo para el cambio en la cantidad a deducir.");
      return;
    }

    setIsSubmitting(true);
    const deductionPromises = itemsToProcess.map(async (item) => {
      if (item.quantity_to_deduct <= 0) {
        return { success: true, message: `Insumo ${item.insumo_nombre} para ${item.plato_nombre} (${item.meal_service_name}) no deducido (cantidad 0).` };
      }
      if (item.quantity_to_deduct > item.current_stock_quantity) {
        return { success: false, message: `Stock insuficiente para deducir ${item.quantity_to_deduct} ${item.purchase_unit} de ${item.insumo_nombre}. Stock actual: ${item.current_stock_quantity} ${item.purchase_unit}.` };
      }

      const detailedNotes = `Menú: ${item.menu_title} (${format(new Date(item.menu_date || selectedDate), "PPP", { locale: es })}) - Servicio: ${item.meal_service_name} - Receta: ${item.plato_nombre} - Cantidad necesaria: ${item.total_needed_purchase_unit_for_item} ${item.purchase_unit}`;

      try {
        await createStockMovement({
          user_id: user.id,
          insumo_id: item.insumo_id,
          movement_type: 'daily_prep_out',
          quantity_change: item.quantity_to_deduct,
          notes: `Deducción para preparación diaria por ${deductorName}. ${deductionReason.trim() ? `Motivo de cambio: ${deductionReason}. ` : ''}Detalles: ${detailedNotes}`,
          menu_id: item.menu_id, // Pass the specific menu_id for this granular item
        });
        return { success: true, message: `Deducido ${item.quantity_to_deduct} ${item.purchase_unit} de ${item.insumo_nombre} para ${item.plato_nombre} (${item.meal_service_name}).` };
      } catch (error: any) {
        return { success: false, message: `Error al deducir ${item.insumo_nombre} para ${item.plato_nombre} (${item.meal_service_name}): ${error.message}` };
      }
    });

    const results = await Promise.all(deductionPromises);

    const successfulDeductions = results.filter(r => r.success);
    const failedDeductions = results.filter(r => !r.success);

    if (successfulDeductions.length > 0) {
      toast.success(`Se dedujeron ${successfulDeductions.length} insumos exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      queryClient.invalidateQueries({ queryKey: ["dailyPrepDeductions"] }); // Invalidate daily prep deductions
      queryClient.invalidateQueries({ queryKey: ["dailyPrepMenus"] });
    }
    if (failedDeductions.length > 0) {
      failedDeductions.forEach(f => toast.error(f.message));
    }

    setIsSubmitting(false);
    onClose();
  };

  const formattedDate = format(selectedDate, "PPP", { locale: es });

  return (
    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Deducir Stock para Preparación</DialogTitle>
        <p className="text-muted-foreground">
          Confirma las cantidades de insumos a deducir del stock para la preparación de los menús del {formattedDate}.
        </p>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="deductorName" className="text-right">
            Persona que deduce
          </Label>
          <Input
            id="deductorName"
            value={deductorName}
            onChange={(e) => setDeductorName(e.target.value)}
            className="col-span-3"
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Insumos a Deducir:</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Insumo (Receta / Servicio)</TableHead> {/* Updated header */}
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">Necesidad</TableHead>
                <TableHead className="text-right">Cantidad a Deducir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsToProcess.map((item) => ( // Iterate over itemsToProcess
                <TableRow key={item.unique_id}>
                  <TableCell className="font-medium">
                    {item.insumo_nombre} ({item.plato_nombre} / {item.meal_service_name})
                  </TableCell>
                  <TableCell className="text-right">{item.current_stock_quantity.toFixed(2)} {item.purchase_unit}</TableCell>
                  <TableCell className="text-right">{item.total_needed_purchase_unit_for_item.toFixed(2)} {item.purchase_unit}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.quantity_to_deduct}
                      onChange={(e) => handleQuantityChange(item.unique_id, e.target.value)}
                      className="w-28 text-right"
                      min="0"
                      max={item.current_stock_quantity}
                      step="0.01"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {isAnyQuantityModified && (
          <div className="grid grid-cols-4 items-start gap-4 mt-4">
            <Label htmlFor="deductionReason" className="text-right pt-2">
              Motivo de cambio en la deducción
            </Label>
            <Textarea
              id="deductionReason"
              value={deductionReason}
              onChange={(e) => setDeductionReason(e.target.value)}
              className="col-span-3 min-h-[80px]"
              placeholder="Ej. Ajuste por porciones reales, error en receta, etc."
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleDeduct} disabled={isSubmitting}>
          {isSubmitting ? "Deduciendo..." : "Confirmar Deducción"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeductQuantitiesDialog;