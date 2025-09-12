import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Utensils,
  ChefHat,
  CalendarDays,
  BookText,
  FileText,
  ShoppingBag,
  ReceiptText,
  AlertCircle,
  Package,
  Warehouse,
  BarChart3,
  Users,
  UserCircle2,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionContext';
import { signOut } from '@/integrations/supabase/profiles';
import { showError, showSuccess } from '@/utils/toast';
import { ModeToggle } from './ModeToggle';

interface SidebarProps {
  // No props needed for now, it will fetch session internally
}

const navLinks = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/insumos", icon: Utensils, label: "Insumos" },
  { to: "/recetas", icon: ChefHat, label: "Recetas" },
  { to: "/event-types", icon: CalendarDays, label: "Tipos Evento" },
  { to: "/menus", icon: BookText, label: "Menús" },
  { to: "/service-reports", icon: FileText, label: "Reportes Servicio" },
  { to: "/purchase-planning", icon: ShoppingBag, label: "Planificación Compras" },
  { to: "/purchase-records", icon: ReceiptText, label: "Registros Compra" },
  { to: "/urgent-purchase-requests", icon: AlertCircle, label: "Solicitudes Urgentes" },
  { to: "/stock-movements", icon: Package, label: "Movimientos Stock" },
  { to: "/warehouse", icon: Warehouse, label: "Almacén" },
  { to: "/reports", icon: BarChart3, label: "Reportes" },
];

const Sidebar: React.FC<SidebarProps> = () => {
  const { session } = useSession();
  const userRole = session?.user?.user_metadata?.role;
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess("Sesión cerrada exitosamente.");
    } catch (error: any) {
      showError(`Error al cerrar sesión: ${error.message}`);
    }
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-sidebar dark:bg-sidebar-primary text-sidebar-foreground dark:text-sidebar-primary-foreground border-r border-sidebar-border dark:border-sidebar-border shadow-lg p-4">
      <div className="flex items-center justify-center mb-6">
        <Link to="/" className="flex items-center group">
          <img src="/logo-erp.png" alt="App Logo" className="h-12 w-auto mr-2 transition-transform duration-200 group-hover:scale-105" />
          <span className="text-2xl font-bold text-sidebar-primary dark:text-sidebar-primary-foreground">ERP</span>
        </Link>
      </div>

      <nav className="flex-grow space-y-1">
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Button
              variant="ghost"
              className={cn(
                "justify-start w-full px-4 py-2 text-base h-10",
                "text-sidebar-foreground dark:text-sidebar-primary-foreground",
                "hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground",
                location.pathname === link.to && "bg-sidebar-accent/50 dark:bg-sidebar-accent-foreground/50 font-semibold"
              )}
            >
              <link.icon className="mr-3 h-5 w-5" />
              {link.label}
            </Button>
          </Link>
        ))}
        {userRole === 'admin' && (
          <Link to="/user-management">
            <Button
              variant="ghost"
              className={cn(
                "justify-start w-full px-4 py-2 text-base h-10",
                "text-sidebar-foreground dark:text-sidebar-primary-foreground",
                "hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground",
                location.pathname === "/user-management" && "bg-sidebar-accent/50 dark:bg-sidebar-accent-foreground/50 font-semibold"
              )}
            >
              <Users className="mr-3 h-5 w-5" />
              Usuarios
            </Button>
          </Link>
        )}
        <Link to="/profile">
          <Button
            variant="ghost"
            className={cn(
              "justify-start w-full px-4 py-2 text-base h-10",
              "text-sidebar-foreground dark:text-sidebar-primary-foreground",
              "hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground",
              location.pathname === "/profile" && "bg-sidebar-accent/50 dark:bg-sidebar-accent-foreground/50 font-semibold"
            )}
          >
            <UserCircle2 className="mr-3 h-5 w-5" />
            Perfil
          </Button>
        </Link>
      </nav>

      <div className="mt-auto pt-4 border-t border-sidebar-border dark:border-sidebar-border flex flex-col space-y-2">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="justify-start w-full px-4 py-2 text-base h-10 text-red-500 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/20"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
        <div className="flex justify-center">
          <ModeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;