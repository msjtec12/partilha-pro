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
  const { user, plan } = useAuth();
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
    <div className="space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Encomendas</h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">Gerencie suas produções ativas.</p>
        </div>
        <div className="flex items-center gap-2">
          {plan === 'pro' && (
            <Button size="sm" variant="outline" className="h-10 rounded-xl border-white/10 glass px-3" onClick={() => exportToPDF('Relatório de Encomendas', encomendas, [
              { header: 'Cliente', dataKey: 'cliente' },
              { header: 'Descrição', dataKey: 'descricao' },
              { header: 'Venda (R$)', dataKey: 'valor' },
              { header: 'Custo (R$)', dataKey: 'custo' },
              { header: 'Status', dataKey: 'status' },
              { header: 'Data', dataKey: 'created_at' }
            ])}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 rounded-xl premium-gradient shadow-lg shadow-primary/20 h-10 px-4" disabled={limitReached}>
                <Plus className="h-4 w-4" /> Nova
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-white/10 glass">
              <DialogHeader>
                <DialogTitle>Nova Encomenda</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4 px-1">
                {catalog.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Usar do Catálogo</p>
                    <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                      {catalog.map((p: any) => (
                        <Button
                          key={p.id}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-white/10 h-8 text-[10px] bg-white/5 flex-shrink-0"
                          onClick={() => setForm({ ...form, descricao: p.nome, valor: p.valor.toString().replace('.', ','), custo: p.custo.toString().replace('.', ',') })}
                        >
                          <ShoppingBag className="h-3 w-3 mr-1.5" /> {p.nome}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {clients.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Selecionar Cliente</p>
                    <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                      {clients.map((c: any) => (
                        <Button
                          key={c.id}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-white/10 h-8 text-[10px] bg-white/5 flex-shrink-0"
                          onClick={() => setForm({ ...form, cliente: c.nome })}
                        >
                          <User className="h-3 w-3 mr-1.5" /> {c.nome}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <Input placeholder="Nome do Cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} required className="rounded-xl border-white/10 bg-background/50 h-12" />
                <Input placeholder="O que ele encomendou?" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} required className="rounded-xl border-white/10 bg-background/50 h-12" />
                <Input placeholder="Valor de Venda (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required className="rounded-xl border-white/10 bg-background/50 h-12" />
                <Input placeholder="Custo de Produção (R$)" value={form.custo} onChange={e => setForm({ ...form, custo: e.target.value })} required className="rounded-xl border-white/10 bg-background/50 h-12" />
                <Button type="submit" className="w-full rounded-xl premium-gradient h-12 text-base font-bold">Salvar Encomenda</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input 
            placeholder="Buscar por cliente ou descrição..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-xl border-white/10 bg-background/50 h-11 pl-10"
          />
          <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/50" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl bg-background/50 border-white/10 h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl glass border-white/10">
            <SelectItem value="all">Todos</SelectItem>
            {statusList.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {limitReached && (
        <div className="glass p-4 rounded-2xl border-amber-500/20 bg-amber-500/5 animate-slide-up flex flex-col gap-3">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
               <AlertCircle className="h-5 w-5" />
             </div>
             <div>
               <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Limite Grátis Atingido</p>
               <p className="text-xs font-medium text-foreground/80 mt-0.5">Você atingiu o limite de 10 encomendas do plano atual.</p>
             </div>
          </div>
          <Button variant="outline" size="sm" className="w-full h-8 rounded-xl border-amber-500/20 text-amber-500 hover:bg-amber-500/10" asChild>
            <a href="/ajustes">Fazer Upgrade</a>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {filteredEncomendas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-[2rem] border-dashed border-2 border-white/10">
            <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma encomenda encontrada.<br/>Tente outros filtros.</p>
          </div>
        )}
        {filteredEncomendas.map(enc => {
          const late = plan === 'pro' && isLate(enc.created_at) && !['Entregue', 'Recebido'].includes(enc.status);
          return (
            <div key={enc.id} className="relative glass p-5 rounded-[2rem] animate-fade-in transition-all hover:scale-[1.01] border-white/5 active:scale-[0.99]">
              {late && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest animate-pulse border border-rose-500/20">
                  <AlertCircle className="h-3 w-3" />
                  Urgente
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground leading-tight">{enc.cliente}</h3>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">{enc.descricao}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/50">Venda</span>
                      <span className="text-base font-bold text-success">{formatCurrency(Number(enc.valor))}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/50">Custo</span>
                      <span className="text-base font-bold text-rose-500">{formatCurrency(Number(enc.custo || 0))}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/50">Lucro</span>
                      <span className="text-base font-bold text-primary">{formatCurrency(Number(enc.valor) - Number(enc.custo || 0))}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 self-end mb-1">{formatDate(enc.created_at)}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(enc.id)} className="p-2 rounded-xl text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors self-end sm:self-auto">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <StatusBadge status={enc.status} />
                <Select value={enc.status} onValueChange={(v) => handleStatusChange(enc.id, v)}>
                  <SelectTrigger className="h-9 w-32 text-xs rounded-xl bg-background/40 border-white/10 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl glass border-white/10">
                    {statusList.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
