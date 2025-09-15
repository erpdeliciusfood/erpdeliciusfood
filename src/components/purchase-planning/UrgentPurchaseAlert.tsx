import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ShoppingBag, Loader2, Repeat2 } from "lucide-react"; // NEW: Repeat2 icon
import { useUrgentPurchaseRequests } from "@/hooks/useUrgentPurchaseRequests";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UrgentPurchaseRequestWithRelations } from "@/types"; // Import UrgentPurchaseRequestWithRelations type
import { format } from "date-fns";
import { es } from "date-fns/locale";

const UrgentPurchaseAlert: React.FC = () => {
  const { data: requests, isLoading, isError, error } = useUrgentPurchaseRequests();

  const pendingRequests = requests?.filter(
    (request: UrgentPurchaseRequestWithRelations) => request.status === 'pending'
  ).sort((a: UrgentPurchaseRequestWithRelations, b: UrgentPurchaseRequestWithRelations) => new Date(a.request_date).getTime() - new Date(b.request_date).getTime()); // Sort by oldest first

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Alertas de Compras Urgentes
          </CardTitle>
          <AlertCircle className="h-8 w-8 text-orange-500" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-primary-foreground" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando solicitudes urgentes...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Alertas de Compras Urgentes
          </CardTitle>
          <AlertCircle className="h-8 w-8 text-orange-500" />
        </CardHeader>
        <CardContent className="text-center py-10 text-red-600 dark:text-red-400">
          <h1 className="text-xl font-bold mb-4">Error al cargar alertas</h1>
          <p className="text-lg">No se pudieron cargar las solicitudes de compra urgente: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return ( // Render a placeholder card if no pending requests
      <Card className="w-full shadow-lg dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <AlertCircle className="mr-3 h-8 w-8 text-gray-500" />
            Alertas de Compras Urgentes
          </CardTitle>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            0 Pendientes
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <ShoppingBag className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No hay solicitudes de compra urgentes pendientes del almacén.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full shadow-lg dark:bg-gray-800 border-l-4 border-orange-500 ${pendingRequests.length > 0 ? 'animate-strong-pulse' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <AlertCircle className="mr-3 h-8 w-8 text-orange-500" />
          ¡Atención! Solicitudes de Compra Urgentes Pendientes
        </CardTitle>
        <Badge variant="destructive" className="text-lg px-3 py-1">
          {pendingRequests.length} Pendientes
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          Hay {pendingRequests.length} solicitudes de compra urgentes que requieren tu atención.
        </p>
        <div className="overflow-x-auto mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left text-base font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                <TableHead className="text-right text-base font-semibold text-gray-700 dark:text-gray-200">Cantidad</TableHead>
                <TableHead className="text-left text-base font-semibold text-gray-700 dark:text-gray-200">Fecha Solicitud</TableHead>
                <TableHead className="text-center text-base font-semibold text-gray-700 dark:text-gray-200">Insistencia</TableHead> {/* NEW: Insistence column */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.slice(0, 3).map((request: UrgentPurchaseRequestWithRelations) => ( // Show top 3
                <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{request.insumos?.nombre || "Insumo Desconocido"}</TableCell>
                  <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">{request.quantity_requested.toFixed(2)} {request.insumos?.purchase_unit || "unidad"}</TableCell>
                  <TableCell className="text-base text-gray-700 dark:text-gray-300">{format(new Date(request.request_date), "PPP", { locale: es })}</TableCell>
                  <TableCell className="text-center text-base text-gray-700 dark:text-gray-300"> {/* NEW: Display insistence_count */}
                    {(request.insistence_count ?? 0) > 1 ? (
                      <Badge variant="destructive" className="text-base px-2 py-1 flex items-center justify-center mx-auto w-fit">
                        <Repeat2 className="h-4 w-4 mr-1" /> {(request.insistence_count ?? 0)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-base px-2 py-1 flex items-center justify-center mx-auto w-fit">
                        1
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {pendingRequests.length > 3 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-base text-gray-600 dark:text-gray-400">
                    ... y {pendingRequests.length - 3} más.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 text-center">
          <Link to="/urgent-purchase-requests">
            <Button className="px-6 py-3 text-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200 ease-in-out">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Ver Todas las Solicitudes Urgentes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default UrgentPurchaseAlert;