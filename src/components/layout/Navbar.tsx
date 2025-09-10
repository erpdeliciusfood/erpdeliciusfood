import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Utensils, UserCircle2, Home, ChefHat, CalendarDays, BookText, BarChart3, Users, ShoppingBag, FileText, Package, ReceiptText } from "lucide-react";
import { signOut } from "@/integrations/supabase/profiles";
import { showError, showSuccess } from "@/utils/toast";

interface NavbarProps {
  userRole: 'user' | 'admin' | undefined;
}

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess("Sesión cerrada exitosamente.");
    } catch (error: any) {
      showError(`Error al cerrar sesión: ${error.message}`);
    }
  };

  const navButtonClass = "text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20";

  return (
    <nav className="flex items-center space-x-4 overflow-x-auto pb-2 md:pb-0">
      <Link to="/">
        <Button variant="ghost" className={navButtonClass}>
          <Home className="mr-2 h-5 w-5" />
          Inicio
        </Button>
      </Link>
      <Link to="/insumos">
        <Button variant="ghost" className={navButtonClass}>
          <Utensils className="mr-2 h-5 w-5" />
          Insumos
        </Button>
      </Link>
      <Link to="/platos">
        <Button variant="ghost" className={navButtonClass}>
          <ChefHat className="mr-2 h-5 w-5" />
          Platos
        </Button>
      </Link>
      <Link to="/event-types">
        <Button variant="ghost" className={navButtonClass}>
          <CalendarDays className="mr-2 h-5 w-5" />
          Tipos Evento
        </Button>
      </Link>
      <Link to="/menus">
        <Button variant="ghost" className={navButtonClass}>
          <BookText className="mr-2 h-5 w-5" />
          Menús
        </Button>
      </Link>
      <Link to="/service-reports">
        <Button variant="ghost" className={navButtonClass}>
          <FileText className="mr-2 h-5 w-5" />
          Reportes Servicio
        </Button>
      </Link>
      <Link to="/purchase-planning">
        <Button variant="ghost" className={navButtonClass}>
          <ShoppingBag className="mr-2 h-5 w-5" />
          Planificación Compras
        </Button>
      </Link>
      <Link to="/purchase-records">
        <Button variant="ghost" className={navButtonClass}>
          <ReceiptText className="mr-2 h-5 w-5" />
          Registros Compra
        </Button>
      </Link>
      <Link to="/stock-movements">
        <Button variant="ghost" className={navButtonClass}>
          <Package className="mr-2 h-5 w-5" />
          Movimientos Stock
        </Button>
      </Link>
      <Link to="/reports">
        <Button variant="ghost" className={navButtonClass}>
          <BarChart3 className="mr-2 h-5 w-5" />
          Reportes
        </Button>
      </Link>
      {userRole === 'admin' && (
        <Link to="/user-management">
          <Button variant="ghost" className={navButtonClass}>
            <Users className="mr-2 h-5 w-5" />
            Usuarios
          </Button>
        </Link>
      )}
      <Link to="/profile">
        <Button variant="ghost" className={navButtonClass}>
          <UserCircle2 className="mr-2 h-5 w-5" />
          Perfil
        </Button>
      </Link>
      <Button
        variant="ghost"
        onClick={handleSignOut}
        className="text-primary-foreground dark:text-primary hover:bg-red-500/20 dark:hover:bg-red-500/20"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Cerrar Sesión
      </Button>
    </nav>
  );
};

export default Navbar;