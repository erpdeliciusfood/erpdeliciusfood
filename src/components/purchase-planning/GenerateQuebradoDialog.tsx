import React, { useState } from 'react';
import { format } from 'date-fns';
import { Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface GenerateQuebradoDialogProps {
  startDate?: Date;
  endDate?: Date;
  onClose: () => void;
}

const GenerateQuebradoDialog: React.FC<GenerateQuebradoDialogProps> = ({ startDate, endDate, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      showError('Por favor, selecciona un rango de fechas válido en la planificación de compras.');
      return;
    }

    setIsGenerating(true);
    const toastId = showLoading('Generando quebrado de menús...');

    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Navegar a la página del reporte sin el conteo de comensales
      navigate(`/quebrado-report?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);

      dismissToast(toastId);
      showSuccess('Navegando al reporte de Quebrado...');
      onClose();
    } catch (error: any) {
      dismissToast(toastId);
      showError(`Error al generar quebrado: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Se generará un reporte de quebrado de menús para el período seleccionado:{" "}
        <span className="font-semibold">
          {startDate && endDate ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}` : 'N/A'}
        </span>
        .
      </p>
      <p className="text-sm text-muted-foreground">
        El cálculo se basará en las raciones planificadas para cada plato en los menús del período.
      </p>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
          Cancelar
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Generar Reporte
        </Button>
      </div>
    </div>
  );
};

export default GenerateQuebradoDialog;