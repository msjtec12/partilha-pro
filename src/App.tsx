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

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Decorative background element */}
      <div className="fixed -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="fixed -bottom-24 -left-24 h-96 w-96 rounded-full bg-success/5 blur-3xl" />
      
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 md:px-6">
        <div className="mx-auto max-w-lg min-h-screen pb-32">
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
      <BottomNav />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
