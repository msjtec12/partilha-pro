import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Crown, CheckCircle2, ArrowRight, Download, Users, UserPlus, Shield, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { redirectToCheckout } from '@/lib/stripe';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';

export default function Ajustes() {
  const { user, plan, signOut } = useAuth();
  const { toast } = useToast();

  const proLaborePercent = user?.user_metadata?.pro_labore_percent ?? 50;
  const catalog = user?.user_metadata?.catalog ?? [];
  const [newProduct, setNewProduct] = useState({ nome: '', valor: '', custo: '' });
  const [newClient, setNewClient] = useState({ nome: '', contato: '' });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const clients = user?.user_metadata?.clients ?? [];

  const handleUpdateSetting = async (key: string, value: any) => {
    const { error } = await supabase.auth.updateUser({
      data: { [key]: value }
    });

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configuração salva!" });
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleUpdatePlan = async (newPlan: 'free' | 'pro') => {
    // For demo purposes, we still allow manual toggle, 
    // but we'll call redirectToCheckout for 'pro'
    if (newPlan === 'pro' && plan === 'free') {
      await redirectToCheckout('price_placeholder');
    }

    const { error } = await supabase.auth.updateUser({
      data: { plan: newPlan }
    });

    if (error) {
      toast({ title: "Erro ao atualizar plano", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Plano ${newPlan.toUpperCase()} ativado!`, description: "As funcionalidades foram atualizadas." });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Ajustes</h1>
        {plan === 'pro' && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 shadow-sm animate-fade-in">
            <Crown className="h-3 w-3" /> Plano Pro
          </span>
        )}
      </div>

      <div className="glass p-6 rounded-[2rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 -mr-12 -mt-12 bg-primary/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg overflow-hidden">
            <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-foreground">Partilha Pro</p>
            <p className="text-sm font-medium text-muted-foreground">{user?.email}</p>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Assinatura</h2>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Mensal
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${billingCycle === 'annual' ? 'bg-amber-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Anual
            </button>
          </div>
        </div>
        
        <div className={`glass p-6 rounded-[2rem] border-white/5 transition-all ${plan === 'free' ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
          {/* ... Free Plan Content ... */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-foreground">Plano Starter</p>
              <p className="text-xs text-muted-foreground mt-0.5">Gestão essencial para sua oficina.</p>
            </div>
            {plan === 'free' ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px]" onClick={() => handleUpdatePlan('free')}>Migrar</Button>
            )}
          </div>
          <p className="text-2xl font-black text-foreground mb-4">Grátis</p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-primary/50" /> Até 10 encomendas ativas
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-primary/50" /> Fluxo de caixa básico
            </li>
          </ul>
        </div>

        <div className={`glass p-6 rounded-[2rem] border-white/5 transition-all relative overflow-hidden group ${plan === 'pro' ? 'ring-2 ring-amber-500/20 bg-amber-500/5' : ''}`}>
          <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">Plano Business</p>
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-[8px] font-black text-white uppercase">Recomendado</span>
            </div>
            {plan === 'pro' ? (
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
            ) : (
              <Button size="sm" className="h-8 rounded-lg text-[10px] premium-gradient border-0 shadow-lg" onClick={() => handleUpdatePlan('pro')}>Upgrade</Button>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-4 relative z-10">
            <p className="text-3xl font-black text-foreground">
              {billingCycle === 'monthly' ? 'R$ 49,90' : 'R$ 399,90'}
            </p>
            <span className="text-xs font-medium text-muted-foreground">
              {billingCycle === 'monthly' ? '/mês' : '/ano'}
            </span>
            {billingCycle === 'annual' && (
              <span className="ml-auto px-2 py-1 rounded-lg bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-tighter border border-green-500/20">
                Economize 33%
              </span>
            )}
          </div>
          <ul className="space-y-2 mb-6 relative z-10">
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-amber-500/50" /> Encomendas ilimitadas
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-amber-500/50" /> Suporte a Equipe & Colaboradores
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-amber-500/50" /> Exportação Profissional (PDF)
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-amber-500/50" /> Alertas de Urgência & Atraso
            </li>
          </ul>
          {plan !== 'pro' && (
            <Button className="w-full gap-2 rounded-xl h-12 font-bold premium-gradient shadow-lg" onClick={() => handleUpdatePlan('pro')}>
              Assinar via Stripe <ArrowRight className="h-4 w-4" />
            </Button>
          )}
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
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 px-2">Catálogo de Produtos</h2>
        <div className="glass p-6 rounded-[2rem] border-white/5 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Input 
                placeholder="Nome do Produto (ex: Camiseta Personalizada)" 
                value={newProduct.nome}
                onChange={e => setNewProduct({...newProduct, nome: e.target.value})}
                className="rounded-xl border-white/10 bg-background/40"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Venda (R$)" 
                  value={newProduct.valor}
                  onChange={e => setNewProduct({...newProduct, valor: e.target.value})}
                  className="rounded-xl border-white/10 bg-background/40"
                />
                <Input 
                  placeholder="Custo (R$)" 
                  value={newProduct.custo}
                  onChange={e => setNewProduct({...newProduct, custo: e.target.value})}
                  className="rounded-xl border-white/10 bg-background/40"
                />
              </div>
              <Button 
                onClick={() => {
                  if(!newProduct.nome || !newProduct.valor) return;
                  const item = { id: Date.now().toString(), ...newProduct };
                  handleUpdateSetting('catalog', [...catalog, item]);
                  setNewProduct({ nome: '', valor: '', custo: '' });
                }}
                className="w-full rounded-xl premium-gradient gap-2 h-11"
              >
                <Plus className="h-4 w-4" /> Adicionar ao Catálogo
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              {catalog.length === 0 && (
                <p className="text-[10px] text-center text-muted-foreground py-4">Nenhum produto cadastrado.</p>
              )}
              {catalog.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-foreground">{p.nome}</p>
                    <p className="text-[10px] text-muted-foreground">Venda: {formatCurrency(Number(p.valor))} | Custo: {formatCurrency(Number(p.custo))}</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSetting('catalog', catalog.filter((i: any) => i.id !== p.id))}
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
                onClick={() => {
                  if(!newClient.nome) return;
                  const item = { id: Date.now().toString(), ...newClient };
                  handleUpdateSetting('clients', [...clients, item]);
                  setNewClient({ nome: '', contato: '' });
                }}
                className="w-full rounded-xl glass border-white/10 gap-2 h-11"
              >
                <Plus className="h-4 w-4" /> Adicionar Cliente
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              {clients.length === 0 && (
                <p className="text-[10px] text-center text-muted-foreground py-4">Nenhum cliente cadastrado.</p>
              )}
              {clients.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-foreground">{c.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{c.contato}</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSetting('clients', clients.filter((i: any) => i.id !== c.id))}
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
