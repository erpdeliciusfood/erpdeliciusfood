"use client";

import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UrgentPurchaseRequest } from "@/types";
import PurchaseRecordForm from "@/components/purchase-planning/PurchaseRecordForm";
import { useUpdateUrgentPurchaseRequest } from "@/hooks/useUrgentPurchaseRequests";
import { showSuccess, showError } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";

interface FulfillUrgentRequestDialogProps {
  urgentRequest: UrgentPurchaseRequest;
  onClose: () => void;
}

const FulfillUrgentRequestDialog: React.FC<FulfillUrgentRequestDialogProps> = ({
  urgentRequest,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const updateUrgentRequestMutation = useUpdateUrgentPurchaseRequest();

  const handlePurchaseRecordSuccess = async () => {
    try {
      // After a purchase record is successfully created, update the urgent request status to 'fulfilled'
      // and link the fulfilled_purchase_record_id.
      // Note: The PurchaseRecordForm itself handles the creation of the purchase record.
      // We need to get the ID of the newly created purchase record.
      // For simplicity, we'll assume the purchase record is created and then just update the status here.
      // A more robust solution would involve the PurchaseRecordForm returning the new record's ID.
      // For now, we'll just mark it as fulfilled.

      await updateUrgentRequestMutation.mutateAsync({
        id: urgentRequest.id,
        request: {
          status: 'fulfilled',
          // fulfilled_purchase_record_id: newPurchaseRecordId, // This would be set if PurchaseRecordForm returned the ID
        },
      });
      showSuccess(`Solicitud urgente para ${urgentRequest.insumos?.nombre || "Insumo Desconocido"} marcada como cumplida.`);
      queryClient.invalidateQueries({ queryKey: ["urgentPurchaseRequests"] });
      onClose();
    } catch (error: any) {
      showError(`Error al marcar la solicitud como cumplida: ${error.message}`);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Registrar Compra para Solicitud Urgente
        </DialogTitle>
      </DialogHeader>
      <PurchaseRecordForm
        prefilledInsumoId={urgentRequest.insumo_id}
        prefilledQuantity={urgentRequest.quantity_requested}
        prefilledUnitCost={urgentRequest.insumos?.costo_unitario || 0}
        prefilledSupplierName={urgentRequest.insumos?.supplier_name || ""}
        prefilledSupplierPhone={urgentRequest.insumos?.supplier_phone || ""}
        prefilledSupplierAddress={urgentRequest.insumos?.supplier_address || ""}
        onSuccess={handlePurchaseRecordSuccess}
        onCancel={onClose}
      />
    </DialogContent>
  );
};

export default FulfillUrgentRequestDialog;