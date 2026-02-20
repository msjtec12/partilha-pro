import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ShoppingBag, Search, Tag } from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  valor: number;
  custo: number;
  created_at: string;
}

export default function Produtos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', valor: '', custo: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProdutos = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return;
    }
    setProdutos((data as Produto[]) ?? []);
  };

  useEffect(() => { fetchProdutos(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const valorFloat = parseFloat(form.valor.replace(',', '.'));
    const custoFloat = parseFloat(form.custo.replace(',', '.') || '0');

    if (isNaN(valorFloat)) {
      toast({ title: 'Valor inválido', description: 'Por favor, insira um valor de venda válido.', variant: 'destructive' });
      return;
    }

    // TODO: Reabilitar envio de 'custo' assim que o banco for migrado
    const { error } = await supabase.from('produtos').insert({
      user_id: user.id,
      nome: form.nome,
      valor: valorFloat,
      custo: custoFloat,
    });

    if (error) {
      console.error('Erro ao criar produto:', error);
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Produto cadastrado!' });
      setForm({ nome: '', valor: '', custo: '' });
      setOpen(false);
      fetchProdutos();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Produto removido' });
      fetchProdutos();
    }
  };

  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Catálogo</h1>
          <p className="text-sm text-muted-foreground mt-1">Seus produtos e serviços cadastrados.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 rounded-xl premium-gradient shadow-lg shadow-primary/20 h-10 px-4">
              <Plus className="h-4 w-4" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md rounded-3xl border-white/10 glass p-5 sm:p-7">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tighter">Novo Produto/Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-3">
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Identificação</p>
                <Input 
                  placeholder="Nome do Produto (ex: Bolo de Pote)" 
                  value={form.nome} 
                  onChange={e => setForm({ ...form, nome: e.target.value })} 
                  required 
                  className="rounded-xl border-white/10 bg-background/50 h-12 px-4 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Valor Venda</p>
                  <Input 
                    placeholder="0,00" 
                    value={form.valor} 
                    onChange={e => setForm({ ...form, valor: e.target.value })} 
                    required 
                    inputMode="decimal"
                    className="rounded-xl border-white/10 bg-background/50 h-12 px-4 text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Custo Médio</p>
                  <Input 
                    placeholder="0,00" 
                    value={form.custo} 
                    onChange={e => setForm({ ...form, custo: e.target.value })} 
                    inputMode="decimal"
                    className="rounded-xl border-white/10 bg-background/50 h-12 px-4 text-sm" 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl premium-gradient h-12 text-sm font-bold mt-1">Salvar no Catálogo</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Input 
          placeholder="Buscar no catálogo..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="rounded-xl border-white/10 bg-background/50 h-11 pl-10"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/50" />
      </div>

      <div className="grid gap-4">
        {filteredProdutos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-[2rem] border-dashed border-2 border-white/10">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Catálogo vazio.<br/>Adicione seu primeiro produto!</p>
          </div>
        )}
        {filteredProdutos.map(produto => (
          <div key={produto.id} className="glass p-5 rounded-[2rem] border-white/5 flex items-center justify-between group animate-fade-in hover:scale-[1.01] transition-all">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-tight">{produto.nome}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-success">{formatCurrency(Number(produto.valor))}</span>
                  <span className="text-[10px] text-muted-foreground">Custo: {formatCurrency(Number(produto.custo))}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(produto.id)} 
              className="p-2.5 rounded-xl text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
