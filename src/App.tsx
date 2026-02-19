import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Encomendas from "@/pages/Encomendas";
import Financas from "@/pages/Financas";
import Produtos from "@/pages/Produtos";
import Ajustes from "@/pages/Ajustes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import Landing from "@/pages/Landing";

import Sidebar from "@/components/Sidebar";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-2xl shadow-primary/20 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 animate-pulse">Iniciando Ateliê...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden dark flex flex-row">
      {/* Decorative background element */}
      <div className="fixed -top-48 -right-48 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[150px] -z-0" />
      <div className="fixed -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px] -z-0" />
      
      {/* Sidebar for Desktop */}
      <Sidebar className="hidden lg:flex" />

      <main className="relative z-10 flex-1 min-h-screen">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-10 pb-32 lg:pb-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/encomendas" element={<Encomendas />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/financas" element={<Financas />} />
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      
      {/* BottomNav only for mobile */}
      <BottomNav className="lg:hidden" />
    </div>
  );
}

import { AuthProvider } from "@/hooks/useAuth";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
