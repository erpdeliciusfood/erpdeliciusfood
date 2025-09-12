import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { generateQuebradoReport } from '@/integrations/supabase/quebrado'; // NUEVO: Importar la función de la integración

interface GenerateQuebradoDialogProps {
  startDate?: Date;
  endDate?: Date;
  onClose: () => void;
}

const formSchema = z.object({
  dinerCount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'La cantidad de comensales debe ser al menos 1').int('La cantidad de comensales debe ser un número entero')
  ),
});

const GenerateQuebradoDialog: React.FC<GenerateQuebradoDialogProps> = ({ startDate, endDate, onClose }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dinerCount: 1,
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!startDate || !endDate) {
      showError('Por favor, selecciona un rango de fechas válido en la planificación de compras.');
      return;
    }

    setIsGenerating(true);
    const toastId = showLoading('Generando quebrado de menús...');

    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Llamar a la función Edge de Supabase
      const result = await generateQuebradoReport(formattedStartDate, formattedEndDate, values.dinerCount);

      dismissToast(toastId);
      showSuccess(result.message || 'Quebrado de menús generado exitosamente.');
      // Aquí podrías manejar la descarga del archivo si la función Edge lo devuelve
      // Por ahora, solo mostramos el mensaje de éxito.
      onClose();
    } catch (error: any) {
      dismissToast(toastId);
      showError(`Error al generar quebrado: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Se generará un reporte de quebrado de menús para el período seleccionado:{" "}
          <span className="font-semibold">
            {startDate && endDate ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}` : 'N/A'}
          </span>
        </p>

        <FormField
          control={form.control}
          name="dinerCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad de Comensales</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 100"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generar Reporte
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GenerateQuebradoDialog;