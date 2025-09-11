import React from "react";
import { Badge } from "@/components/ui/badge";
import { InsumoNeeded } from "@/types";

interface ReasonBadgeProps {
  reason: InsumoNeeded['reason_for_purchase_suggestion'];
}

const ReasonBadge: React.FC<ReasonBadgeProps> = ({ reason }) => {
  switch (reason) {
    case 'menu_demand':
      return <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Demanda de Menú</Badge>;
    case 'min_stock_level':
      return <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">Stock Mínimo</Badge>;
    case 'both':
      return <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Ambos</Badge>;
    case 'zero_stock_alert':
      return <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Stock Cero</Badge>;
    default:
      return <Badge variant="secondary">Desconocido</Badge>;
  }
};

export default ReasonBadge;