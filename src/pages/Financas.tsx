import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { exportToPDF } from '@/lib/pdfExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus, Trash2, FileText, Share2, Download, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}

interface Fechamento {
  id: string;
  periodo: string;
  lucro_total: number;
  minha_parte: number;
  parte_loja: number;
  data: string;
}

const categorias = ['Produtos', 'Funcionários', 'Outros'] as const;

const categoriaBadge: Record<string, string> = {
  Produtos: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Funcionários': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Outros: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export default function Financas() {
  const { user, plan, proLaborePercent, workshopName } = useAuth();
  const { toast } = useToast();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ descricao: '', valor: '', categoria: 'Produtos' });
  const [summary, setSummary] = useState({ faturamento: 0, custos: 0, despesas: 0, lucro: 0 });

  const fetchDespesas = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('despesas')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });
    setDespesas((data as Despesa[]) ?? []);
  };

  const fetchFechamentos = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('fechamentos')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });
    setFechamentos((data as Fechamento[]) ?? []);
  };

  useEffect(() => { 
    fetchDespesas();
    fetchFechamentos();
    fetchMonthlyStats();
  }, [user]);

  const fetchMonthlyStats = async () => {
    if (!user) return;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: pData } = await supabase
      .from('pedidos')
      .select('valor, custo')
      .eq('user_id', user.id)
      .eq('status', 'Recebido')
      .gte('created_at', startOfMonth);

    const { data: dData } = await supabase
      .from('despesas')
      .select('valor')
      .eq('user_id', user.id)
      .gte('data', startOfMonth.split('T')[0]);

    const fat = pData?.reduce((s, p) => s + Number(p.valor), 0) ?? 0;
    const cProd = pData?.reduce((s, p) => s + Number(p.custo || 0), 0) ?? 0;
    const desp = dData?.reduce((s, d) => s + Number(d.valor), 0) ?? 0;

    setSummary({
      faturamento: fat,
      custos: cProd,
      despesas: desp,
      lucro: fat - (cProd + desp)
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    console.log("Financeiro: Iniciando salvamento de despesa...", form);
    
    try {
      const { error } = await Promise.race([
        supabase.from('despesas').insert({
          user_id: user.id,
          descricao: form.descricao,
          valor: parseFloat(form.valor.replace(',', '.')),
          categoria: form.categoria,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tempo de resposta excedido ao salvar')), 10000))
      ]) as any;

      if (error) {
        console.error('Erro ao criar despesa:', error);
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } else {
        console.log("Financeiro: Despesa salva com sucesso");
        toast({ title: 'Despesa registrada!' });
        setForm({ descricao: '', valor: '', categoria: 'Produtos' });
        setOpen(false);
        fetchDespesas();
        fetchMonthlyStats();
      }
    } catch (err: any) {
      console.error('Exceção ao criar despesa:', err);
      toast({ title: 'Erro de Conexão', description: err.message || 'O banco de dados não respondeu.', variant: 'destructive' });
    }
  };

  const handleGerarFechamento = async () => {
    if (!user) return;
    setLoading(true);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: encomendas } = await supabase
      .from('pedidos')
      .select('valor, custo, status')
      .eq('user_id', user.id)
      .in('status', ['Entregue', 'Recebido'])
      .gte('created_at', startOfMonth.toISOString());

    const { data: despesasData } = await supabase
      .from('despesas')
      .select('valor')
      .eq('user_id', user.id)
      .gte('data', startOfMonth.toISOString().split('T')[0]);

    const totalEncValue = encomendas?.reduce((s, e) => s + Number(e.valor), 0) ?? 0;
    const totalEncCost = encomendas?.reduce((s, e) => s + Number(e.custo || 0), 0) ?? 0;
    const totalDesp = despesasData?.reduce((s, d) => s + Number(d.valor), 0) ?? 0;
    const lucro = Math.max(totalEncValue - (totalEncCost + totalDesp), 0);

    const periodo = `${startOfMonth.toLocaleDateString('pt-BR')} - ${now.toLocaleDateString('pt-BR')}`;
    const reservePercent = 100 - proLaborePercent;

    const { error } = await supabase.from('fechamentos').insert({
      user_id: user.id,
      periodo,
      lucro_total: lucro,
      minha_parte: lucro * (proLaborePercent / 100),
      parte_loja: lucro * (reservePercent / 100),
    });

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Fechamento realizado!' });
      fetchFechamentos();
    }
    setLoading(false);
  };

  const handleShare = (f: Fechamento) => {
    const text = `📊 *Performance Ateliê - ${workshopName}*\n\n📅 Período: ${f.periodo}\n💰 Resultado Bruto: ${formatCurrency(Number(f.lucro_total))}\n👤 Seu Pro-Labore: ${formatCurrency(Number(f.minha_parte))}\n🏪 Reserva Ateliê: ${formatCurrency(Number(f.parte_loja))}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDeleteSub = async (id: string) => {
    await supabase.from('despesas').delete().eq('id', id);
    toast({ title: 'Despesa removida' });
    fetchDespesas();
  };

  return (
    <div className="space-y-12 md:space-y-16 animate-fade-in max-w-5xl mx-auto px-2 md:px-0 pb-24 md:pb-0">
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground leading-none">Despesas</h1>
            <p className="text-[10px] md:text-xs text-primary/70 font-black uppercase tracking-[0.3em] mt-4 italic">Controle de Insumos & Operação</p>
          </div>
          <div className="flex items-center gap-4">
            {plan === 'pro' && (
              <Button size="lg" variant="outline" className="h-14 w-14 rounded-2xl border-white/5 glass shadow-xl" onClick={() => exportToPDF('Fluxo de Caixa', despesas, [
                { header: 'Descrição', dataKey: 'descricao' },
                { header: 'Categoria', dataKey: 'categoria' },
                { header: 'Valor', dataKey: 'valor' },
                { header: 'Data', dataKey: 'data' }
              ])}>
                <Download className="h-5 w-5" />
              </Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="h-14 px-8 gap-3 rounded-full premium-gradient shadow-2xl shadow-primary/30 font-black uppercase tracking-tighter text-xs">
                  <Plus className="h-5 w-5" /> NOVA DESPESA
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[3rem] border-white/10 glass p-10 max-w-md">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-3xl font-black tracking-tighter">Registrar Saída</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-6">
                  <Input placeholder="Descrição do Gasto" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} required className="h-14 rounded-2xl border-white/10 bg-white/10 px-6 font-bold text-white focus:bg-white/20 transition-all placeholder:text-muted-foreground/50" />
                  <Input placeholder="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required className="h-14 rounded-2xl border-white/10 bg-white/10 px-6 font-bold text-white focus:bg-white/20 transition-all placeholder:text-muted-foreground/50" />
                  <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/10 px-6 font-bold text-white focus:bg-white/20 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/10 glass">
                      {categorias.map(c => (
                        <SelectItem key={c} value={c} className="font-bold py-3">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="h-16 w-full rounded-full premium-gradient font-black uppercase tracking-tighter shadow-2xl shadow-primary/30">SALVAR REGISTRO</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo Financeiro do Mês */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-slide-up">
          <div className="glass p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.02] relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 bg-emerald-500/5 rounded-full blur-2xl" />
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 leading-none flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Faturamento (Mês)
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-emerald-500 tracking-tighter">{formatCurrency(summary.faturamento)}</h3>
          </div>
          
          <div className="glass p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.02] relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 bg-rose-500/5 rounded-full blur-2xl" />
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 leading-none flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-rose-500" /> Custo Produção
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-rose-500/80 tracking-tighter">{formatCurrency(summary.custos)}</h3>
          </div>

          <div className="glass p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.02] relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 bg-amber-500/5 rounded-full blur-2xl" />
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 leading-none flex items-center gap-2">
              <PieChart className="h-3 w-3 text-amber-500" /> Despesas Operac.
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-amber-500/80 tracking-tighter">{formatCurrency(summary.despesas)}</h3>
          </div>

          <div className="premium-gradient p-6 md:p-8 rounded-[2rem] shadow-xl shadow-primary/20 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 bg-white/10 rounded-full blur-2xl" />
            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-3 leading-none flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-white" /> Lucro Líquido
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter">{formatCurrency(summary.lucro)}</h3>
          </div>
        </div>

        <div className="space-y-4">
          {despesas.length === 0 && (
            <div className="py-20 text-center glass rounded-[3rem] border-white/5">
               <p className="text-muted-foreground/40 font-black uppercase tracking-widest text-[10px]">Sem registros de saída no momento</p>
            </div>
          )}
          {despesas.map(d => (
            <div key={d.id} className="flex items-center justify-between glass p-8 rounded-[2.5rem] animate-fade-in transition-all hover:translate-x-2 border-white/5 group bg-white/[0.01]">
              <div className="flex items-center gap-6">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner", categoriaBadge[d.categoria] ? "bg-primary/5" : "bg-white/5")}>
                   <Trash2 className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity text-destructive cursor-pointer" onClick={() => handleDeleteSub(d.id)} />
                </div>
                <div>
                  <p className="font-black text-xl tracking-tight text-foreground">{d.descricao}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-full border border-white/5 text-muted-foreground/60">
                      {d.categoria}
                    </span>
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground/30">{formatDate(d.data)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-2xl tracking-tighter text-rose-500/80">{formatCurrency(Number(d.valor))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-10 pt-16 border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">Resultados</h1>
            <p className="text-xs text-primary/70 font-black uppercase tracking-[0.3em] mt-4 italic">Apuração de Performance & Pró-labore</p>
          </div>
          <div className="flex items-center gap-4">
            {plan === 'pro' && (
              <Button size="lg" variant="outline" className="h-14 w-14 rounded-2xl border-white/5 glass shadow-xl" onClick={() => exportToPDF('Relatório de Retiradas', fechamentos, [
                { header: 'Período', dataKey: 'periodo' },
                { header: 'Lucro Total', dataKey: 'lucro_total' },
                { header: 'Minha Parte', dataKey: 'minha_parte' },
                { header: 'Parte Loja', dataKey: 'parte_loja' }
              ])}>
                <Download className="h-5 w-5" />
              </Button>
            )}
            <Button size="lg" onClick={handleGerarFechamento} disabled={loading} className="h-14 px-8 gap-3 rounded-full bg-foreground text-background font-black uppercase tracking-tighter text-xs shadow-2xl transition-all hover:scale-105 active:scale-95">
              <FileText className="h-5 w-5" /> {loading ? 'GERANDO...' : 'FECHAR MÊS ATUAL'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fechamentos.length === 0 && (
            <div className="md:col-span-2 py-20 text-center glass rounded-[3rem] border-white/5">
               <p className="text-muted-foreground/40 font-black uppercase tracking-widest text-[10px]">Aguardando primeiro fechamento oficial</p>
            </div>
          )}
          {fechamentos.map(f => (
            <div key={f.id} className="glass p-10 rounded-[3.5rem] animate-fade-in border-white/5 relative overflow-hidden group bg-white/[0.01] shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-primary/10 transition-all duration-1000" />
              <div className="flex items-start justify-between relative z-10 mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-3 italic">Ciclo Artisanal</p>
                  <p className="text-sm font-black text-muted-foreground/50 tracking-tight">{f.periodo}</p>
                </div>
                <button onClick={() => handleShare(f)} className="h-12 w-12 rounded-2xl bg-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center border border-white/5">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-12 relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-2">Resultado Líquido</p>
                 <h2 className="text-6xl font-black tracking-tighter text-foreground leading-none">{formatCurrency(Number(f.lucro_total))}</h2>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="rounded-[2rem] bg-emerald-500/5 p-6 border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-colors">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 mb-3">Seu Ganho</p>
                  <p className="text-xl font-black text-emerald-500 tracking-tight">{formatCurrency(Number(f.minha_parte))}</p>
                </div>
                <div className="rounded-[2rem] bg-orange-500/5 p-6 border border-orange-500/10 group-hover:bg-orange-500/10 transition-colors">
                  <p className="text-[9px] font-black uppercase tracking-widest text-orange-500/60 mb-3">Reinvestimento</p>
                  <p className="text-xl font-black text-orange-500 tracking-tight">{formatCurrency(Number(f.parte_loja))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

