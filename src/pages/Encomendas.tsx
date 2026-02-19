import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/formatters';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Clock, AlertCircle, Download, ShoppingBag, User } from 'lucide-react';
import { exportToPDF } from '@/lib/pdfExport';

interface Encomenda {
  id: string;
  cliente: string;
  descricao: string;
  valor: number;
  custo: number;
  status: string;
  created_at: string;
}

const statusList = ['Pendente', 'Fazer', 'Entregar', 'Entregue', 'Recebido'] as const;

export default function Encomendas() {
  const { user, plan, workshopName } = useAuth();
  const { toast } = useToast();
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ cliente: '', descricao: '', valor: '', custo: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const limitReached = plan === 'free' && encomendas.length >= 10;

  const fetchEncomendas = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('encomendas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setEncomendas((data as Encomenda[]) ?? []);
  };

  const fetchCatalog = async () => {
    if (!user) return;
    const { data } = await supabase.from('produtos').select('*').order('nome');
    setCatalog(data ?? []);
  };

  const fetchClients = async () => {
    if (!user) return;
    const { data } = await supabase.from('clientes').select('*').order('nome');
    setClients(data ?? []);
  };

  useEffect(() => { 
    fetchEncomendas(); 
    fetchCatalog();
    fetchClients();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (limitReached) {
      toast({ title: "Limite atingido!", description: "Usuários do plano Free podem ter até 10 encomendas. Faça upgrade para o Pro!", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('encomendas').insert({
      user_id: user.id,
      cliente: form.cliente,
      descricao: form.descricao,
      valor: parseFloat(form.valor.replace(',', '.')),
      custo: parseFloat(form.custo.replace(',', '.') || '0'),
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Encomenda criada!' });
      setForm({ cliente: '', descricao: '', valor: '', custo: '' });
      setOpen(false);
      fetchEncomendas();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('encomendas').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Status atualizado para "${newStatus}"` });
      fetchEncomendas();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('encomendas').delete().eq('id', id);
    toast({ title: 'Encomenda removida' });
    fetchEncomendas();
  };

  const isLate = (createdAt: string) => {
    const diff = new Date().getTime() - new Date(createdAt).getTime();
    return diff > 7 * 24 * 60 * 60 * 1000;
  };

  const filteredEncomendas = encomendas.filter(enc => {
    const matchesSearch = enc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         enc.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">Encomendas</h1>
          <p className="text-xs text-primary/70 font-black uppercase tracking-[0.3em] mt-4 italic">Gestão de Produção Artisanal</p>
        </div>
        <div className="flex items-center gap-4">
          {plan === 'pro' && (
            <Button size="lg" variant="outline" className="h-14 w-14 rounded-2xl border-white/5 glass shadow-xl" onClick={() => exportToPDF('Relatório de Encomendas', encomendas, [
              { header: 'Cliente', dataKey: 'cliente' },
              { header: 'Descrição', dataKey: 'descricao' },
              { header: 'Venda (R$)', dataKey: 'valor' },
              { header: 'Custo (R$)', dataKey: 'custo' },
              { header: 'Status', dataKey: 'status' },
              { header: 'Data', dataKey: 'created_at' }
            ])}>
              <Download className="h-5 w-5" />
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-8 gap-3 rounded-full premium-gradient shadow-2xl shadow-primary/30 font-black uppercase tracking-tighter text-xs" disabled={limitReached}>
                <Plus className="h-5 w-5" /> NOVA ENCOMENDA
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[3rem] border-white/10 glass p-10 max-w-2xl">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-4xl font-black tracking-tighter">Iniciando Arte</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   {catalog.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Usar do Catálogo</p>
                      <div className="grid grid-cols-2 gap-2">
                        {catalog.slice(0, 6).map((p: any) => (
                          <Button
                            key={p.id}
                            variant="outline"
                            className="rounded-xl border-white/5 h-12 text-[10px] bg-white/5 font-black uppercase tracking-widest justify-start px-4 truncate"
                            onClick={() => setForm({ ...form, descricao: p.nome, valor: p.valor.toString().replace('.', ','), custo: p.custo.toString().replace('.', ',') })}
                          >
                            <ShoppingBag className="h-3 w-3 mr-2 shrink-0" /> {p.nome}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {clients.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Selecionar Cliente</p>
                      <div className="grid grid-cols-2 gap-2">
                        {clients.slice(0, 6).map((c: any) => (
                          <Button
                            key={c.id}
                            variant="outline"
                            className="rounded-xl border-white/5 h-12 text-[10px] bg-white/5 font-black uppercase tracking-widest justify-start px-4 truncate"
                            onClick={() => setForm({ ...form, cliente: c.nome })}
                          >
                            <User className="h-3 w-3 mr-2 shrink-0" /> {c.nome}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleCreate} className="space-y-4 bg-white/5 p-8 rounded-[2rem] border border-white/5">
                  <Input placeholder="Artesão / Cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} required className="h-14 rounded-2xl border-white/10 bg-background/50 px-6 font-bold" />
                  <Input placeholder="Descrição da Arte" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} required className="h-14 rounded-2xl border-white/10 bg-background/50 px-6 font-bold" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Venda (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required className="h-14 rounded-2xl border-white/10 bg-background/50 px-6 font-bold" />
                    <Input placeholder="Custo (R$)" value={form.custo} onChange={e => setForm({ ...form, custo: e.target.value })} required className="h-14 rounded-2xl border-white/10 bg-background/50 px-6 font-bold" />
                  </div>
                  <Button type="submit" className="w-full rounded-full premium-gradient h-16 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 mt-4">SALVAR NO LIVRO</Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Input 
            placeholder="Buscar por cliente ou descrição..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-[2rem] border-white/5 bg-white/5 h-16 pl-14 font-bold tracking-tight shadow-xl group-hover:bg-white/[0.08] transition-all"
          />
          <Clock className="absolute left-6 top-6 h-5 w-5 text-primary/40 group-hover:text-primary transition-colors" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-56 rounded-[2rem] bg-white/5 border-white/5 h-16 px-8 font-black uppercase tracking-widest text-[10px]">
             <SelectValue placeholder="STATUS" />
          </SelectTrigger>
          <SelectContent className="rounded-[2rem] glass border-white/10 p-2">
            <SelectItem value="all" className="rounded-xl font-bold py-3 px-6">TODOS</SelectItem>
            {statusList.map(s => (
              <SelectItem key={s} value={s} className="rounded-xl font-bold py-3 px-6 uppercase tracking-widest text-[9px]">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {limitReached && (
        <div className="glass p-10 rounded-[3rem] border-amber-500/10 bg-amber-500/5 animate-slide-up flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 shadow-2xl">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Capacidade Gratuita Esgotada</p>
                <p className="text-base font-bold text-foreground/60 tracking-tight">Você atingiu o máximo de 10 produções simultâneas.</p>
              </div>
           </div>
           <Button className="h-14 px-10 rounded-full premium-gradient font-black uppercase tracking-tighter text-xs shadow-2xl shadow-primary/30" asChild>
             <a href="/ajustes">MUDAR DE NÍVEL AGORA</a>
           </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredEncomendas.length === 0 && (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-32 text-center glass rounded-[4rem] border-white/5 bg-white/[0.01]">
            <div className="h-24 w-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/5">
               <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
            </div>
            <p className="text-lg font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Nada em produção no momento</p>
          </div>
        )}
        {filteredEncomendas.map(enc => {
          const late = plan === 'pro' && isLate(enc.created_at) && !['Entregue', 'Recebido'].includes(enc.status);
          return (
            <div key={enc.id} className="relative glass p-10 rounded-[3.5rem] animate-fade-in transition-all hover:translate-y-[-8px] border-white/5 bg-white/[0.01] shadow-2xl group">
              {late && (
                <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest animate-pulse border border-rose-500/20 shadow-lg">
                  <AlertCircle className="h-3 w-3" />
                  PRIORITÁRIO
                </div>
              )}
              
              <div className="space-y-8">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-3 italic">Cliente / Artesão</p>
                   <h3 className="text-3xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{enc.cliente}</h3>
                   <p className="text-base font-bold text-muted-foreground/60 tracking-tight mt-2">{enc.descricao}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Venda</span>
                    <span className="text-xl font-black text-success tracking-tighter">{formatCurrency(Number(enc.valor))}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Custo</span>
                    <span className="text-xl font-black text-rose-500/80 tracking-tighter">{formatCurrency(Number(enc.custo || 0))}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Lucro</span>
                    <span className="text-xl font-black text-primary tracking-tighter">{formatCurrency(Number(enc.valor) - Number(enc.custo || 0))}</span>
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <StatusBadge status={enc.status} className="scale-110" />
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-muted-foreground/30">{formatDate(enc.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={enc.status} onValueChange={(v) => handleStatusChange(enc.id, v)}>
                      <SelectTrigger className="h-12 w-12 rounded-2xl bg-white/5 border-white/5 font-black flex items-center justify-center p-0 hover:bg-white/10 transition-all">
                        <Plus className="h-5 w-5 text-muted-foreground/40" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl glass border-white/10 p-2">
                        {statusList.map(s => (
                          <SelectItem key={s} value={s} className="rounded-xl font-bold py-3 px-6 uppercase tracking-widest text-[9px]">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button onClick={() => handleDelete(enc.id)} className="h-12 w-12 rounded-2xl bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center border border-rose-500/5">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
