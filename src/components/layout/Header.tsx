import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LogOut,
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
  Warehouse,
  AlertCircle,
  Menu as MenuIcon,
  Home,
  ArrowLeft,
  ReceiptText,
} from "lucide-react";
import { signOut } from "@/integrations/supabase/profiles";
import { showError, showSuccess } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";
import { ModeToggle } from "./ModeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavLinkButton from "./NavLinkButton";
import MobileNavLinkButton from "./MobileNavLinkButton";
// import { cn } from '@/lib/utils'; // Eliminada la importación no utilizada

const Header: React.FC = () => {
  const { session } = useSession();
  const userRole = session?.user?.user_metadata?.role;
  const location = useLocation();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess("Sesión cerrada exitosamente.");
    } catch (error: any) {
      showError(`Error al cerrar sesión: ${error.message}`);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const navLinks = [
    { to: "/insumos", icon: Utensils, label: "Insumos" },
    { to: "/recetas", icon: ChefHat, label: "Recetas" },
    { to: "/event-types", icon: CalendarDays, label: "Tipos Evento" },
    { to: "/menus", icon: BookText, label: "Menús" },
    { to: "/menus/quebrado-calendar", icon: AlertCircle, label: "Quebrado" }, // NEW: Quebrado Calendar Link
    { to: "/service-reports", icon: FileText, label: "Reportes Servicio" },
    { to: "/purchase-planning", icon: ShoppingBag, label: "Planificación Compras" },
    { to: "/purchase-records", icon: ReceiptText, label: "Registros Compra" },
    { to: "/urgent-purchase-requests", icon: AlertCircle, label: "Solicitudes Urgentes" },
    { to: "/stock-movements", icon: Package, label: "Movimientos Stock" },
    { to: "/warehouse", icon: Warehouse, label: "Almacén" },
    { to: "/reports", icon: BarChart3, label: "Reportes" },
  ];

  if (!session) {
    return null;
  }

  return (
    <header className="bg-primary dark:bg-primary-foreground text-primary-foreground dark:text-primary p-4 shadow-md border-b border-primary-foreground/10 dark:border-primary/10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Home Button */}
        <Link to="/" className="flex items-center group">
          <img src="/logo-erp.png" alt="App Logo" className="h-12 w-auto mr-3 transition-transform duration-200 group-hover:scale-105" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {location.pathname !== "/" && (
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20 px-4 py-2 text-base h-10"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver
            </Button>
          )}
          {navLinks.map((link) => (
            <NavLinkButton key={link.to} to={link.to} icon={link.icon} label={link.label} />
          ))}
          {userRole === 'admin' && (
            <NavLinkButton to="/user-management" icon={Users} label="Usuarios" />
          )}
          <NavLinkButton to="/profile" icon={UserCircle2} label="Perfil" />
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-primary-foreground dark:text-primary hover:bg-red-500/20 dark:hover:bg-red-500/20 px-4 py-2 text-base h-10"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
          <ModeToggle />
        </nav>

        {/* Mobile Navigation (Hamburger Menu) */}
        <div className="md:hidden flex items-center space-x-2">
          <ModeToggle />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-4 flex flex-col bg-sidebar dark:bg-sidebar-primary text-sidebar-foreground dark:text-sidebar-primary-foreground">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-bold text-sidebar-primary-foreground dark:text-sidebar-foreground flex items-center">
                  <img src="/logo-erp.png" alt="App Logo" className="h-10 w-auto mr-2" />
                  Menú
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-2 flex-grow">
                {location.pathname !== "/" && (
                  <Button
                    variant="ghost"
                    onClick={() => { handleGoBack(); setIsSheetOpen(false); }}
                    className="justify-start text-lg px-4 py-3 h-auto w-full text-sidebar-foreground dark:text-sidebar-primary-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground"
                  >
                    <ArrowLeft className="mr-3 h-6 w-6" />
                    Volver
                  </Button>
                )}
                <MobileNavLinkButton to="/" icon={Home} label="Inicio" onClick={() => setIsSheetOpen(false)} />
                {navLinks.map((link) => (
                  <MobileNavLinkButton key={link.to} to={link.to} icon={link.icon} label={link.label} onClick={() => setIsSheetOpen(false)} />
                ))}
                {userRole === 'admin' && (
                  <MobileNavLinkButton to="/user-management" icon={Users} label="Usuarios" onClick={() => setIsSheetOpen(false)} />
                )}
                <MobileNavLinkButton to="/profile" icon={UserCircle2} label="Perfil" onClick={() => setIsSheetOpen(false)} />
                <Button
                  variant="ghost"
                  onClick={() => { handleSignOut(); setIsSheetOpen(false); }}
                  className="justify-start text-lg px-4 py-3 h-auto w-full text-red-500 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/20"
                >
                  <LogOut className="mr-3 h-6 w-6" />
                  Cerrar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;