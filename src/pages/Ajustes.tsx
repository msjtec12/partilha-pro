import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Crown, CheckCircle2, ArrowRight, Download, Users, UserPlus, Shield, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { redirectToCheckout } from '@/lib/stripe';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';

interface Cliente {
  id: string;
  nome: string;
  contato: string | null;
}

export default function Ajustes() {
  const { user, profile, plan, proLaborePercent, workshopName, fullName, signOut } = useAuth();
  const { toast } = useToast();

  const [newClient, setNewClient] = useState({ nome: '', contato: '' });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [clients, setClients] = useState<Cliente[]>([]);

  const fetchClients = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar clientes:', error);
    } else {
      setClients(data || []);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const handleAddClient = async () => {
    if (!user || !newClient.nome) return;

    const { error } = await supabase.from('clientes').insert({
      user_id: user.id,
      nome: newClient.nome,
      contato: newClient.contato || null,
    });

    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cliente adicionado!" });
      setNewClient({ nome: '', contato: '' });
      fetchClients();
    }
  };

  const handleDeleteClient = async (id: string) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);

    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cliente removido" });
      fetchClients();
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ [key]: value })
      .eq('id', user.id);

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configuração salva!" });
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleUpdatePlan = async (newPlan: 'free' | 'pro') => {
    if (newPlan === 'pro' && plan === 'free') {
      try {
        const priceId = billingCycle === 'monthly' 
          ? 'price_1T2DSv22TLyYgOiQ6pELUMXj'
          : 'price_1T2DVO22TLyYgOiQ6O34t1mi';
        
        await redirectToCheckout(priceId);
        return;
      } catch (error: any) {
        toast({ 
          title: "Erro ao iniciar checkout", 
          description: error.message, 
          variant: "destructive" 
        });
        return;
      }
    }

    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', user.id);

    if (error) {
      toast({ title: "Erro ao atualizar plano", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Plano ${newPlan.toUpperCase()} ativado!`, description: "As funcionalidades foram atualizadas." });
      setTimeout(() => window.location.reload(), 1000);
    }
  };


  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">Ajustes</h1>
          <p className="text-xs text-primary/70 font-black uppercase tracking-[0.3em] mt-4 italic">Configurações & Gestão</p>
        </div>
        {plan === 'pro' && (
          <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-2xl animate-bounce-slow">
            <Crown className="h-4 w-4 fill-amber-500/20" /> PLANO BUSINESS
          </span>
        )}
      </div>

      <div className="glass p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden bg-white/[0.01] shadow-2xl">
        <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-primary/5 rounded-full blur-[100px]" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-2xl border border-white/10 group overflow-hidden">
            <img src="/logo.png" alt="Logo" className="h-12 object-contain transition-transform group-hover:scale-110" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
              {workshopName}
            </h2>
            <div className="flex flex-col gap-1">
              {fullName && (
                <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest italic">{fullName}</p>
              )}
              <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-[2rem] border-white/5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Sobre o App</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Partilha Pro é sua ferramenta definitiva para controle de oficinas e produções sob demanda. 
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 px-2">Gestão de Equipe (Pro)</h2>
        {plan === 'pro' ? (
          <div className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Administrador</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Você</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[8px] font-black text-primary uppercase border border-primary/20">Ativo</span>
            </div>
            <Button variant="outline" className="w-full gap-2 rounded-xl h-10 border-dashed border-white/10 hover:bg-primary/5 group" onClick={() => toast({ title: "Em breve", description: "O convite de equipe estará disponível na próxima atualização." })}>
              <UserPlus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold">Convidar Colaborador</span>
            </Button>
          </div>
        ) : (
          <div className="glass p-6 rounded-[2rem] border-white/5 border-dashed border-2 flex flex-col items-center text-center opacity-70">
            <Users className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Controle de Equipe</p>
            <p className="text-[10px] text-muted-foreground mt-1">Disponível apenas no Plano Pro</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Sua Jornada</h2>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={cn("px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest", billingCycle === 'monthly' ? 'bg-primary text-white shadow-xl' : 'text-muted-foreground/60 hover:text-foreground')}
            >
              MENSAL
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={cn("px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest", billingCycle === 'annual' ? 'bg-amber-500 text-white shadow-xl' : 'text-muted-foreground/60 hover:text-foreground')}
            >
              ANUAL
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={cn("glass p-10 rounded-[3.5rem] border-white/5 transition-all relative group bg-white/[0.01]", plan === 'free' ? 'ring-2 ring-primary/20 bg-primary/[0.02]' : '')}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2 italic">Essencial</p>
                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">STARTUP</h3>
              </div>
              {plan === 'free' && <CheckCircle2 className="h-6 w-6 text-primary shadow-xl" />}
            </div>
            <p className="text-4xl font-black text-foreground mb-8 tracking-tighter">Grátis</p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight">
                <CheckCircle2 className="h-4 w-4 text-primary/30" /> 10 encomendas / mês
              </li>
              <li className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight">
                <CheckCircle2 className="h-4 w-4 text-primary/30" /> Fluxo de caixa
              </li>
            </ul>
            {plan !== 'free' && <Button variant="outline" className="w-full h-14 rounded-full font-black uppercase tracking-widest text-[10px] border-white/5" onClick={() => handleUpdatePlan('free')}>MIGRAR</Button>}
          </div>

          <div className={cn("glass p-10 rounded-[3.5rem] border-white/5 transition-all relative overflow-hidden group bg-white/[0.01] shadow-2xl", plan === 'pro' ? 'ring-4 ring-amber-500/20 bg-amber-500/[0.03]' : '')}>
            <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/20 transition-all duration-1000" />
            
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-2 italic">Profissional</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">BUSINESS</h3>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-[8px] font-black text-white uppercase tracking-widest shadow-lg">PRO</span>
                </div>
              </div>
              {plan === 'pro' && <CheckCircle2 className="h-6 w-6 text-amber-500 shadow-xl shadow-amber-500/20" />}
            </div>
            <div className="flex items-baseline gap-2 mb-8 relative z-10">
              <p className="text-5xl font-black text-foreground tracking-tighter">
                {billingCycle === 'monthly' ? 'R$ 49,90' : 'R$ 399,90'}
              </p>
              <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">
                {billingCycle === 'monthly' ? '/mês' : '/ano'}
              </span>
            </div>
            <ul className="space-y-4 mb-10 relative z-10">
              <li className="flex items-center gap-3 text-[11px] font-bold text-foreground uppercase tracking-tight">
                <Crown className="h-4 w-4 text-amber-500" /> ENCOMENDAS ILIMITADAS
              </li>
              <li className="flex items-center gap-3 text-[11px] font-bold text-foreground uppercase tracking-tight">
                <Crown className="h-4 w-4 text-amber-500" /> GESTÃO DE COLABORADORES
              </li>
              <li className="flex items-center gap-3 text-[11px] font-bold text-foreground uppercase tracking-tight">
                <Crown className="h-4 w-4 text-amber-500" /> EXPORTAÇÃO PDF PREMIUM
              </li>
            </ul>
            {plan !== 'pro' && (
              <Button className="w-full gap-3 rounded-full h-16 font-black uppercase tracking-tighter text-xs premium-gradient shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all relative z-10" onClick={() => handleUpdatePlan('pro')}>
                ASSINAR BUSINESS <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 px-2">Configurações de Negócio</h2>
        <div className="glass p-6 rounded-[2rem] border-white/5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">Divisão de Lucro</p>
              <span className="text-xs font-black text-primary">{proLaborePercent}% Pro-Labore</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Define quanto do lucro líquido vai para você (Pró-Labore) e quanto fica na Reserva da Loja.
            </p>
            <div className="flex gap-2">
              {[30, 40, 50, 60, 70].map(val => (
                <Button 
                  key={val}
                  variant={proLaborePercent === val ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 rounded-xl h-9 text-[10px] font-bold"
                  onClick={() => handleUpdateSetting('pro_labore_percent', val)}
                >
                  {val}%
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 px-2">Gestão de Clientes</h2>
        <div className="glass p-6 rounded-[2rem] border-white/5 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Input 
                placeholder="Nome do Cliente" 
                value={newClient.nome}
                onChange={e => setNewClient({...newClient, nome: e.target.value})}
                className="rounded-xl border-white/10 bg-background/40"
              />
              <Input 
                placeholder="Contato (WhatsApp/Instagram)" 
                value={newClient.contato}
                onChange={e => setNewClient({...newClient, contato: e.target.value})}
                className="rounded-xl border-white/10 bg-background/40"
              />
              <Button 
                onClick={handleAddClient}
                className="w-full rounded-xl glass border-white/10 gap-2 h-11"
              >
                <Plus className="h-4 w-4" /> Adicionar Cliente
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              {clients.length === 0 && (
                <p className="text-[10px] text-center text-muted-foreground py-4">Nenhum cliente cadastrado.</p>
              )}
              {clients.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-foreground">{c.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{c.contato}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteClient(c.id)}
                    className="p-2 text-muted-foreground/40 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button variant="ghost" className="w-full gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-2xl h-12" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sair da Conta
      </Button>
    </div>
  );
}
