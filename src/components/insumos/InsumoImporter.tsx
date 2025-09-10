import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { InsumoFormValues } from "@/types";
import { parse } from "papaparse"; // Changed to named import for parse
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { createMultipleInsumos } from "@/integrations/supabase/insumos";

// Define the schema for a single row in the CSV
const csvRowSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }).max(50, { message: "El nombre no debe exceder los 50 caracteres." }),
  category: z.string().min(1, { message: "La categoría es requerida." }),
  base_unit: z.string().min(1, { message: "La unidad base es requerida." }),
  purchase_unit: z.string().min(1, { message: "La unidad de compra es requerida." }),
  costo_unitario: z.coerce.number().min(0.01, { message: "El costo unitario debe ser mayor a 0." }).max(99999.99, { message: "El costo unitario no debe exceder 99999.99." }),
  conversion_factor: z.coerce.number().min(0.001, { message: "El factor de conversión debe ser mayor a 0." }).max(1000000, { message: "El factor de conversión no debe exceder 1,000,000." }),
  stock_quantity: z.coerce.number().min(0, { message: "La cantidad de stock no puede ser negativa." }).max(999999, { message: "La cantidad de stock no debe exceder 999999." }),
  min_stock_level: z.coerce.number().min(0, { message: "El nivel mínimo de stock no puede ser negativo." }).max(999999, { message: "El nivel mínimo de stock no debe exceder 999999." }),
  supplier_name: z.string().max(100, { message: "El nombre del proveedor no debe exceder los 100 caracteres." }).nullable().optional(),
  supplier_phone: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    return /^\+51\d{9}$/.test(val);
  }, { message: "El teléfono debe empezar con +51 y tener 9 dígitos (ej. +51987654321)." }),
  supplier_address: z.string().max(255, { message: "La dirección del proveedor no debe exceder los 255 caracteres." }).nullable().optional(),
});

interface InsumoImporterProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const InsumoImporter: React.FC<InsumoImporterProps> = ({ onSuccess, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "nombre,category,base_unit,purchase_unit,costo_unitario,conversion_factor,stock_quantity,min_stock_level,supplier_name,supplier_phone,supplier_address";
    const exampleRow = "Quinua tricolor,Cereales,gramos,kilo,16.75,1000,0,0,Amagreen / Mayorista Saludable,,";
    const csvContent = [headers, exampleRow].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-t;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "plantilla_insumos.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showError("Por favor, selecciona un archivo CSV para importar.");
      return;
    }

    setIsProcessing(true);
    const toastId = showLoading("Procesando archivo e importando insumos...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;

      parse(text, { // Using named import 'parse'
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<any>) => {
          const parsedData = results.data;
          const errors: { row: number; message: string }[] = [];
          const validInsumos: InsumoFormValues[] = [];

          parsedData.forEach((row: any, index: number) => {
            const rowNumber = index + 2; // +1 for 0-indexed array, +1 for header row
            try {
              // Clean up empty strings to null for optional fields
              const cleanedRow = { ...row };
              for (const key in cleanedRow) {
                if (cleanedRow[key] === "") {
                  cleanedRow[key] = null;
                }
              }

              const validatedInsumo = csvRowSchema.parse(cleanedRow);
              validInsumos.push(validatedInsumo);
            } catch (e: any) {
              if (e instanceof z.ZodError) {
                e.errors.forEach(err => {
                  errors.push({
                    row: rowNumber,
                    message: `Fila ${rowNumber}, campo '${err.path.join(".")}': ${err.message}`,
                  });
                });
              } else {
                errors.push({ row: rowNumber, message: `Fila ${rowNumber}: ${e.message}` });
              }
            }
          });

          if (errors.length > 0) {
            dismissToast(toastId);
            showError(`Errores de validación encontrados en ${errors.length} filas. Por favor, revisa la consola para más detalles.`);
            console.error("Errores de validación en el archivo CSV:", errors);
            setIsProcessing(false);
            return;
          }

          if (validInsumos.length === 0) {
            dismissToast(toastId);
            showError("No se encontraron insumos válidos para importar en el archivo.");
            setIsProcessing(false);
            return;
          }

          try {
            const importedCount = await createMultipleInsumos(validInsumos);
            dismissToast(toastId);
            showSuccess(`Se importaron ${importedCount} insumos exitosamente.`);
            queryClient.invalidateQueries({ queryKey: ["insumos"] });
            onSuccess();
          } catch (dbError: any) {
            dismissToast(toastId);
            showError(`Error al guardar insumos en la base de datos: ${dbError.message}`);
            console.error("Error de base de datos durante la importación:", dbError);
          } finally {
            setIsProcessing(false);
          }
        },
        error: (error: Papa.ParseError) => {
          dismissToast(toastId);
          showError(`Error al parsear el archivo CSV: ${error.message}`);
          console.error("Error de PapaParse:", error);
          setIsProcessing(false);
        },
      });
    };

    reader.onerror = () => {
      dismissToast(toastId);
      showError("Error al leer el archivo.");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 p-2">
      <p className="text-base text-gray-700 dark:text-gray-300">
        Utiliza esta función para importar múltiples insumos a la vez desde un archivo CSV.
        Asegúrate de que tu archivo CSV tenga las columnas correctas y el formato esperado.
      </p>

      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadTemplate}
          className="flex-grow px-6 py-3 text-lg"
          disabled={isProcessing}
        >
          <Download className="mr-2 h-5 w-5" />
          Descargar Plantilla CSV
        </Button>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="insumos-csv" className="text-base font-semibold text-gray-800 dark:text-gray-200">Seleccionar archivo CSV</Label>
        <Input
          id="insumos-csv"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="h-12 text-base file:text-primary file:bg-primary-foreground file:hover:bg-primary file:hover:text-primary-foreground file:transition-colors file:duration-200"
          disabled={isProcessing}
        />
        {file && <p className="text-sm text-gray-500 dark:text-gray-400">Archivo seleccionado: {file.name}</p>}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6 py-3 text-lg"
          disabled={isProcessing}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleImport}
          className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
          disabled={!file || isProcessing}
        >
          {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Importar
        </Button>
      </div>
    </div>
  );
};

export default InsumoImporter;