import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Utensils, UserCircle2, Home, ChefHat } from "lucide-react"; // Add ChefHat icon
import { signOut } from "@/integrations/supabase/profiles";
import { showError, showSuccess } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";
import { ModeToggle } from "./ModeToggle"; // Import the ModeToggle component

const Header: React.FC = () => {
  const { session } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess("Sesión cerrada exitosamente.");
    } catch (error: any) {
      showError(`Error al cerrar sesión: ${error.message}`);
    }
  };

  if (!session) {
    return null; // No mostrar el header si no hay sesión (estamos en la página de login)
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
          <Link to="/platos"> {/* New link for Platos */}
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20">
              <ChefHat className="mr-2 h-5 w-5" /> {/* Use ChefHat icon */}
              Platos
            </Button>
          </Link>
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
          <ModeToggle /> {/* Add the ModeToggle here */}
        </nav>
      </div>
    </header>
  );
};

export default Header;