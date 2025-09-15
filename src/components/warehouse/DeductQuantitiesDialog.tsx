"use client";

import React, { useState, useMemo } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InsumoDeductionItem } from "@/types"; // Removed InsumoToDeduct
import { createStockMovement } from "@/lib/supabase/actions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
// Removed Textarea as it's not used

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
  const { user } = useAuth();
  const [deductorName, setDeductorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantitiesToDeduct, setQuantitiesToDeduct] = useState<Record<string, number>>({});

  // Aggregate selectedDeductionItems by insumo_id for display and initial deduction quantities
  const insumosToProcess = useMemo(() => {
    const aggregated = new Map<string, {
      insumo_id: string;
      insumo_nombre: string;
      purchase_unit: string;
      current_stock_quantity: number;
      total_needed: number;
      items: InsumoDeductionItem[]; // Keep track of original granular items
    }>();

    selectedDeductionItems.forEach(item => {
      if (!aggregated.has(item.insumo_id)) {
        aggregated.set(item.insumo_id, {
          insumo_id: item.insumo_id,
          insumo_nombre: item.insumo_nombre,
          purchase_unit: item.purchase_unit,
          current_stock_quantity: item.current_stock_quantity,
          total_needed: 0,
          items: [],
        });
      }
      const entry = aggregated.get(item.insumo_id)!;
      entry.total_needed += item.total_needed_purchase_unit_for_item;
      entry.items.push(item); // Add the granular item
    });

    return Array.from(aggregated.values()).map(entry => ({
      ...entry,
      total_needed: parseFloat(entry.total_needed.toFixed(2)),
      quantity_to_deduct: quantitiesToDeduct[entry.insumo_id] !== undefined
        ? quantitiesToDeduct[entry.insumo_id]
        : parseFloat(entry.total_needed.toFixed(2)), // Default to total needed
    }));
  }, [selectedDeductionItems, quantitiesToDeduct]);

  const handleQuantityChange = (insumoId: string, value: string) => {
    const numValue = parseFloat(value);
    setQuantitiesToDeduct(prev => ({
      ...prev,
      [insumoId]: isNaN(numValue) ? 0 : numValue,
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

    setIsSubmitting(true);
    const deductionPromises = insumosToProcess.map(async (insumo) => {
      if (insumo.quantity_to_deduct <= 0) {
        return { success: true, message: `Insumo ${insumo.insumo_nombre} no deducido (cantidad 0).` };
      }
      if (insumo.quantity_to_deduct > insumo.current_stock_quantity) {
        return { success: false, message: `Stock insuficiente para deducir ${insumo.quantity_to_deduct} ${insumo.purchase_unit} de ${insumo.insumo_nombre}. Stock actual: ${insumo.current_stock_quantity} ${insumo.purchase_unit}.` };
      }

      // Construct a detailed note including all granular items contributing to this deduction
      const detailedNotes = insumo.items.map(item =>
        `Menú: ${item.menu_title} (${format(new Date(item.menu_date || selectedDate), "PPP", { locale: es })}) - Servicio: ${item.meal_service_name} - Receta: ${item.plato_nombre} - Cantidad necesaria: ${item.total_needed_purchase_unit_for_item} ${item.purchase_unit}`
      ).join('; ');

      const { error: stockMovementError } = await createStockMovement({
        user_id: user.id,
        insumo_id: insumo.insumo_id,
        movement_type: 'daily_prep_out',
        quantity_change: -insumo.quantity_to_deduct, // Negative for deduction
        notes: `Deducción para preparación diaria por ${deductorName}. Detalles: ${detailedNotes}`,
        menu_id: null, // Set to null as a single deduction might span multiple menus, and notes provide detail
      });

      if (stockMovementError) {
        return { success: false, message: `Error al deducir ${insumo.insumo_nombre}: ${stockMovementError.message}` };
      }
      return { success: true, message: `Deducido ${insumo.quantity_to_deduct} ${insumo.purchase_unit} de ${insumo.insumo_nombre}.` };
    });

    const results = await Promise.all(deductionPromises);

    const successfulDeductions = results.filter(r => r.success);
    const failedDeductions = results.filter(r => !r.success);

    if (successfulDeductions.length > 0) {
      toast.success(`Se dedujeron ${successfulDeductions.length} insumos exitosamente.`);
    }
    if (failedDeductions.length > 0) {
      failedDeductions.forEach(f => toast.error(f.message));
    }

    setIsSubmitting(false);
    onClose(); // Close the dialog after processing
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
                <TableHead className="w-[200px]">Insumo</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">Necesidad Total</TableHead>
                <TableHead className="text-right">Cantidad a Deducir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insumosToProcess.map((insumo) => (
                <TableRow key={insumo.insumo_id}>
                  <TableCell className="font-medium">{insumo.insumo_nombre}</TableCell>
                  <TableCell className="text-right">{insumo.current_stock_quantity.toFixed(2)} {insumo.purchase_unit}</TableCell>
                  <TableCell className="text-right">{insumo.total_needed.toFixed(2)} {insumo.purchase_unit}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={insumo.quantity_to_deduct}
                      onChange={(e) => handleQuantityChange(insumo.insumo_id, e.target.value)}
                      className="w-28 text-right"
                      min="0"
                      max={insumo.current_stock_quantity}
                      step="0.01"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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