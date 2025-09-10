import {
  Home,
  Utensils,
  UserCircle2,
  ChefHat,
  CalendarDays,
  BookText,
  BarChart3,
  Users,
  ShoppingBag,
  FileText,
  Package,
  ReceiptText,
  Warehouse, // NEW: Import Warehouse icon
} from "lucide-react";

export const NAV_LINKS = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/insumos", label: "Insumos", icon: Utensils },
  { path: "/platos", label: "Platos", icon: ChefHat },
  { path: "/event-types", label: "Tipos Evento", icon: CalendarDays },
  { path: "/menus", label: "Menús", icon: BookText },
  { path: "/service-reports", label: "Reportes Servicio", icon: FileText },
  { path: "/purchase-planning", label: "Planificación Compras", icon: ShoppingBag },
  { path: "/purchase-records", label: "Registros Compra", icon: ReceiptText },
  { path: "/stock-movements", label: "Movimientos Stock", icon: Package },
  { path: "/warehouse", label: "Almacén", icon: Warehouse, roles: ["admin", "warehouse"] }, // NEW: Add Warehouse link
  { path: "/reports", label: "Reportes", icon: BarChart3 },
  { path: "/user-management", label: "Usuarios", icon: Users, roles: ["admin"] },
  { path: "/profile", label: "Perfil", icon: UserCircle2 },
];