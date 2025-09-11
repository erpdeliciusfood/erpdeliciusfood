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
  Menu as MenuIcon, // Renamed to avoid conflict with Menu component
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
    <header className="bg-primary dark:bg-primary-foreground text-primary-foreground dark:text-primary p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Home Button */}
        <Link to="/" className="flex items-center group">
          <img src="/logo-erp.png" alt="App Logo" className="h-12 w-auto mr-3 transition-transform duration-200 group-hover:scale-105" />
          {/* <span className="text-2xl font-bold">ERP App</span> */}
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
            <Link key={link.to} to={link.to}>
              <Button
                variant="ghost"
                className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20 px-4 py-2 text-base h-10"
              >
                <link.icon className="mr-2 h-5 w-5" />
                {link.label}
              </Button>
            </Link>
          ))}
          {userRole === 'admin' && (
            <Link to="/user-management">
              <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20 px-4 py-2 text-base h-10">
                <Users className="mr-2 h-5 w-5" />
                Usuarios
              </Button>
            </Link>
          )}
          <Link to="/profile">
            <Button variant="ghost" className="text-primary-foreground dark:text-primary hover:bg-primary-foreground/20 dark:hover:bg-primary/20 px-4 py-2 text-base h-10">
              <UserCircle2 className="mr-2 h-5 w-5" />
              Perfil
            </Button>
          </Link>
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
                    className="justify-start text-lg px-4 py-3 h-auto text-sidebar-foreground dark:text-sidebar-primary-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground"
                  >
                    <ArrowLeft className="mr-3 h-6 w-6" />
                    Volver
                  </Button>
                )}
                <Link to="/" onClick={() => setIsSheetOpen(false)}>
                  <Button
                    variant="ghost"
                    className="justify-start text-lg px-4 py-3 h-auto text-sidebar-foreground dark:text-sidebar-primary-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground"
                  >
                    <Home className="mr-3 h-6 w-6" />
                    Inicio
                  </Button>
                </Link>
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setIsSheetOpen(false)}>
                    <Button
                      variant="ghost"
                      className="justify-start text-lg px-4 py-3 h-auto text-sidebar-foreground dark:text-sidebar-primary-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground"
                    >
                      <link.icon className="mr-3 h-6 w-6" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {userRole === 'admin' && (
                  <Link to="/user-management" onClick={() => setIsSheetOpen(false)}>
                    <Button variant="ghost" className="justify-start text-lg px-4 py-3 h-auto text-sidebar-foreground dark:text-sidebar-primary-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground">
                      <Users className="mr-3 h-6 w-6" />
                      Usuarios
                    </Button>
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsSheetOpen(false)}>
                  <Button
                    variant="ghost"
                    className="justify-start text-lg px-4 py-3 h-auto text-sidebar-foreground dark:text-sidebar-primary-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-foreground"
                  >
                    <UserCircle2 className="mr-3 h-6 w-6" />
                    Perfil
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => { handleSignOut(); setIsSheetOpen(false); }}
                  className="justify-start text-lg px-4 py-3 h-auto text-red-500 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/20"
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