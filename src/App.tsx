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
import Orders from "./pages/Orders"; // Import the new Orders page
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
    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} /> {/* New protected route for Orders */}
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