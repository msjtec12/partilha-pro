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
import { Plus, Trash2, FileText, Share2, Download } from 'lucide-react';

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
  const { user, plan } = useAuth();
  const { toast } = useToast();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ descricao: '', valor: '', categoria: 'Produtos' });

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
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('despesas').insert({
      user_id: user.id,
      descricao: form.descricao,
      valor: parseFloat(form.valor.replace(',', '.')),
      categoria: form.categoria,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Despesa registrada!' });
      setForm({ descricao: '', valor: '', categoria: 'Produtos' });
      setOpen(false);
      fetchDespesas();
    }
  };

  const handleGerarFechamento = async () => {
    if (!user) return;
    setLoading(true);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: encomendas } = await supabase
      .from('encomendas')
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

    const proLaborePercent = user?.user_metadata?.pro_labore_percent ?? 50;
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
    const text = `📊 *Fechamento Partilha Pro*\n\n📅 Período: ${f.periodo}\n💰 Lucro Total: ${formatCurrency(Number(f.lucro_total))}\n👤 Minha Parte: ${formatCurrency(Number(f.minha_parte))}\n🏪 Reserva Loja: ${formatCurrency(Number(f.parte_loja))}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDeleteSub = async (id: string) => {
    await supabase.from('despesas').delete().eq('id', id);
    toast({ title: 'Despesa removida' });
    fetchDespesas();
  };

  return (
    <div className="space-y-8 p-4 pb-24">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Fluxo de Caixa</h1>
          <div className="flex items-center gap-2">
            {plan === 'pro' && (
              <Button size="sm" variant="outline" className="h-9 rounded-xl border-white/10 glass px-3" onClick={() => exportToPDF('Fluxo de Caixa', despesas, [
                { header: 'Descrição', dataKey: 'descricao' },
                { header: 'Categoria', dataKey: 'categoria' },
                { header: 'Valor', dataKey: 'valor' },
                { header: 'Data', dataKey: 'data' }
              ])}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 rounded-xl premium-gradient shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" /> Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-white/10 glass">
                <DialogHeader>
                  <DialogTitle>Registrar Despesa</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <Input placeholder="Descrição (ex: Aluguel, Peças)" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} required className="rounded-xl border-white/10 bg-background/50" />
                  <Input placeholder="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required className="rounded-xl border-white/10 bg-background/50" />
                  <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                    <SelectTrigger className="rounded-xl border-white/10 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full rounded-xl premium-gradient">Salvar Despesa</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-3">
          {despesas.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma despesa registrada.</p>
          )}
          {despesas.map(d => (
            <div key={d.id} className="flex items-center justify-between glass p-4 rounded-2xl animate-fade-in transition-all hover:scale-[1.01] border-white/5">
              <div>
                <p className="font-bold text-foreground">{d.descricao}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoriaBadge[d.categoria] ?? categoriaBadge.Outros}`}>
                    {d.categoria}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(d.data)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-rose-500">{formatCurrency(Number(d.valor))}</span>
                <button onClick={() => handleDeleteSub(d.id)} className="p-1 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Retiradas</h1>
          <div className="flex items-center gap-2">
            {plan === 'pro' && (
              <Button size="sm" variant="outline" className="h-9 rounded-xl border-white/10 glass px-3" onClick={() => exportToPDF('Relatório de Retiradas', fechamentos, [
                { header: 'Período', dataKey: 'periodo' },
                { header: 'Lucro Total', dataKey: 'lucro_total' },
                { header: 'Minha Parte', dataKey: 'minha_parte' },
                { header: 'Parte Loja', dataKey: 'parte_loja' }
              ])}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" onClick={handleGerarFechamento} disabled={loading} className="gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity">
              <FileText className="h-4 w-4" /> {loading ? 'Fechando...' : 'Fechar Período'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {fechamentos.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum fechamento realizado.</p>
          )}
          {fechamentos.map(f => (
            <div key={f.id} className="glass p-5 rounded-[2rem] animate-fade-in border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Período de Retirada</p>
                  <p className="text-sm font-semibold text-muted-foreground">{f.periodo}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tighter text-foreground">{formatCurrency(Number(f.lucro_total))}</p>
                </div>
                <button onClick={() => handleShare(f)} className="p-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 relative z-10">
                <div className="rounded-[1.5rem] bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-500/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Pró-Labore</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(Number(f.minha_parte))}</p>
                </div>
                <div className="rounded-[1.5rem] bg-blue-50/50 dark:bg-blue-950/20 p-4 border border-blue-500/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Caixa da Loja</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(Number(f.parte_loja))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
