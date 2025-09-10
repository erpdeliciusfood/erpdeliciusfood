import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/integrations/supabase/profiles";
import { showError, showSuccess } from "@/utils/toast";
import { NAV_LINKS } from "@/constants/navigationConstants"; // Import NAV_LINKS

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
      {NAV_LINKS.map((link) => {
        // Render link only if no roles are specified or if userRole matches one of the specified roles
        if (link.roles && !link.roles.includes(userRole as any)) {
          return null;
        }
        const IconComponent = link.icon;
        return (
          <Link to={link.path} key={link.path}>
            <Button variant="ghost" className={navButtonClass}>
              <IconComponent className="mr-2 h-5 w-5" />
              {link.label}
            </Button>
          </Link>
        );
      })}
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