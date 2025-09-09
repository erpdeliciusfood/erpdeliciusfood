import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Utensils, UserCircle2, Home, ChefHat, CalendarDays, BookText, BarChart3, Users, ShoppingBag, FileText, Package } from "lucide-react"; // Updated icons, removed ListChecks
import { signOut } from "@/integrations/supabase/profiles";
import { showError, showSuccess } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";
import { ModeToggle } from "./ModeToggle";

const Header: React.FC = () => {
  const { session } = useSession();
  const userRole = session?.user?.user_metadata?.role;

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess("Sesión cerrada exitosamente.");
    } catch (error: any) {
      showError(`Error al cerrar sesión: ${error.message}`);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <header className="bg-primary dark:bg-primary-foreground text-primary-foreground dark:text-primary p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <Home className="mr-2 h-6 w-6" />
          ERP App
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/insumos">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <Utensils className="mr-2 h-5 w-5" />
              Insumos
            </Button>
          </Link>
          <Link to="/platos">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <ChefHat className="mr-2 h-5 w-5" />
              Platos
            </Button>
          </Link>
          <Link to="/event-types">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <CalendarDays className="mr-2 h-5 w-5" />
              Tipos Evento
            </Button>
          </Link>
          {/* <Link to="/meal-types"> */} {/* REMOVED LINK */}
            {/* <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <ListChecks className="mr-2 h-5 w-5" />
              Tipos Plato
            </Button>
          </Link> */}
          <Link to="/menus">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <BookText className="mr-2 h-5 w-5" />
              Menús
            </Button>
          </Link>
          <Link to="/service-reports">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <FileText className="mr-2 h-5 w-5" />
              Reportes Servicio
            </Button>
          </Link>
          <Link to="/purchase-planning">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Compras
            </Button>
          </Link>
          <Link to="/stock-movements">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <Package className="mr-2 h-5 w-5" />
              Movimientos Stock
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <BarChart3 className="mr-2 h-5 w-5" />
              Reportes
            </Button>
          </Link>
          {userRole === 'admin' && (
            <Link to="/user-management">
              <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
                <Users className="mr-2 h-5 w-5" />
                Usuarios
              </Button>
            </Link>
          )}
          <Link to="/profile">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
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
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;