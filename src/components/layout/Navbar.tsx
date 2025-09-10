import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { NAV_LINKS } from "@/constants/navigationConstants";
import { useAuthActions } from "@/hooks/useAuthActions"; // Import the new hook

interface NavbarProps {
  userRole: 'user' | 'admin' | undefined;
}

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  const { signOut } = useAuthActions(); // Use the new hook

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
        onClick={signOut} // Use signOut from the hook
        className="text-primary-foreground dark:text-primary hover:bg-red-500/20 dark:hover:bg-red-500/20"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Cerrar Sesión
      </Button>
    </nav>
  );
};

export default Navbar;