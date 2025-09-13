import React from 'react';
import { ConsolidatedInsumo } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuebradoConsolidatedViewProps {
  data: ConsolidatedInsumo[];
}

const QuebradoConsolidatedView: React.FC<QuebradoConsolidatedViewProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No hay insumos consolidados para mostrar.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consolidado Semanal de Insumos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Insumo</TableHead>
              <TableHead className="text-right">Cantidad Total</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Utilizado en Servicios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((insumo) => (
              <TableRow key={insumo.insumoId}>
                <TableCell className="font-medium">{insumo.insumoName}</TableCell>
                <TableCell className="text-right font-mono">{insumo.totalQuantity.toFixed(2)}</TableCell>
                <TableCell>{insumo.unit}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {insumo.services.map((service) => (
                      <Badge key={service} variant="outline">{service}</Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default QuebradoConsolidatedView;