import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Insumos from "./pages/Insumos";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Platos from "./pages/Platos";
import EventTypes from "./pages/EventTypes";
import Menus from "./pages/Menus";
import ServiceReports from "./pages/ServiceReports";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import PurchasePlanning from "./pages/PurchasePlanning";
import StockMovements from "./pages/StockMovements"; // New import
import { SessionContextProvider, useSession } from "./contexts/SessionContext";
import Header from "./components/layout/Header";
import { ThemeProvider } from "./contexts/ThemeProvider";

const queryClient = new QueryClient();

// Componente para proteger rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null; 
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/insumos" element={<ProtectedRoute><Insumos /></ProtectedRoute>} />
    <Route path="/platos" element={<ProtectedRoute><Platos /></ProtectedRoute>} />
    <Route path="/event-types" element={<ProtectedRoute><EventTypes /></ProtectedRoute>} />
    <Route path="/menus" element={<ProtectedRoute><Menus /></ProtectedRoute>} />
    <Route path="/service-reports" element={<ProtectedRoute><ServiceReports /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
    <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
    <Route path="/purchase-planning" element={<ProtectedRoute><PurchasePlanning /></ProtectedRoute>} />
    <Route path="/stock-movements" element={<ProtectedRoute><StockMovements /></ProtectedRoute>} /> {/* New protected route */}
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionContextProvider>
            <AppRoutes />
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;