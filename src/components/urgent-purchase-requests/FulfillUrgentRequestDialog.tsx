"use client";

import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UrgentPurchaseRequest, PurchaseRecord, UrgentPurchaseRequestWithRelations } from "@/types";
import PurchaseRecordForm from "@/components/purchase-planning/PurchaseRecordForm";
import { useUpdateUrgentPurchaseRequest } from "@/hooks/useUrgentPurchaseRequests";
import { showSuccess, showError } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";

interface FulfillUrgentRequestDialogProps {
  urgentRequest: UrgentPurchaseRequestWithRelations;
  onClose: () => void;
}

const FulfillUrgentRequestDialog: React.FC<FulfillUrgentRequestDialogProps> = ({
  urgentRequest,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const updateUrgentRequestMutation = useUpdateUrgentPurchaseRequest();

  const handlePurchaseRecordSuccess = async (newPurchaseRecord?: PurchaseRecord) => {
    try {
      if (!newPurchaseRecord) {
        throw new Error("No se pudo obtener el registro de compra creado.");
      }

      await updateUrgentRequestMutation.mutateAsync({
        id: urgentRequest.id,
        request: {
          status: 'fulfilled',
          fulfilled_purchase_record_id: newPurchaseRecord.id,
        },
      });
      showSuccess(`Solicitud urgente para ${urgentRequest.insumos?.nombre || "Insumo Desconocido"} marcada como cumplida y vinculada a la compra.`);
      queryClient.invalidateQueries({ queryKey: ["urgentPurchaseRequests"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
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