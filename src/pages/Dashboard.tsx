import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowUpRight, Clock, Landmark, MoreHorizontal, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
  name: string;
  encomendas: number;
  despesas: number;
}

export default function Dashboard() {
  const { user, plan, proLaborePercent, workshopName } = useAuth();
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalEncomendas, setTotalEncomendas] = useState(0);
  const [realProfit, setRealProfit] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lateCount, setLateCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pipelineProfit, setPipelineProfit] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  
  const reservePercent = 100 - proLaborePercent;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: encomendas } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: despesas } = await supabase
        .from('despesas')
        .select('valor, data')
        .eq('user_id', user.id);

      const entries = encomendas ?? [];
      const entregues = entries.filter(e => e.status === 'Entregue' || e.status === 'Recebido');
      const sumEncomendasValue = entregues.reduce((s, e) => s + Number(e.valor), 0);
      const sumEncomendasCost = entregues.reduce((s, e) => s + Number(e.custo || 0), 0);
      const sumDespesas = despesas?.reduce((s, d) => s + Number(d.valor), 0) ?? 0;

      const totalCosts = sumEncomendasCost + sumDespesas;
      const realProfit = Math.max(sumEncomendasValue - totalCosts, 0);

      setRecentOrders(entries.slice(0, 5));

      const late = entries.filter(e => {
        const isNotDone = !['Entregue', 'Recebido'].includes(e.status);
        const diff = new Date().getTime() - new Date(e.created_at).getTime();
        return isNotDone && (diff > 7 * 24 * 60 * 60 * 1000);
      });
      setLateCount(late.length);

      const pending = entries.filter(e => !['Entregue', 'Recebido'].includes(e.status));
      const sumPendingValue = pending.reduce((s, e) => s + Number(e.valor), 0);
      const sumPendingCost = pending.reduce((s, e) => s + Number(e.custo || 0), 0);

      setTotalEncomendas(sumEncomendasValue);
      setTotalDespesas(totalCosts);
      setRealProfit(realProfit);
      setPipelineValue(sumPendingValue);
      setPipelineProfit(sumPendingValue - sumPendingCost);

      const months: Record<string, { encomendas: number; despesas: number }> = {};
      entregues.forEach(e => {
        const m = new Date(e.created_at).toLocaleDateString('pt-BR', { month: 'short' });
        if (!months[m]) months[m] = { encomendas: 0, despesas: 0 };
        months[m].encomendas += Number(e.valor);
        months[m].despesas += Number(e.custo || 0);
      });
      setChartData(Object.entries(months).map(([name, v]) => ({ name, ...v })));
    };

    fetchData();
  }, [user]);

  const lucro = realProfit;
  const meuLucro = lucro * (proLaborePercent / 100);

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in max-w-6xl mx-auto px-2 md:px-0">
      {/* Header matching mockup */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground leading-none">Visão Geral</h1>
          <div className="flex items-center gap-3 mt-4">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] md:text-xs text-primary/70 font-black uppercase tracking-[0.3em] italic">{workshopName}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="rounded-2xl glass border-white/5 font-black uppercase tracking-[0.2em] text-[10px] h-14 px-8 shadow-xl">
            Relatório Semanal <Clock className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
        {/* Metric Card 1: Faturamento */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 relative group overflow-hidden shadow-2xl bg-white/[0.02]">
          <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1 leading-none">Vendas (Mês)</p>
            <h2 className="text-3xl font-black tracking-tighter text-foreground">{formatCurrency(totalEncomendas)}</h2>
          </div>
        </div>

        {/* Metric Card 2: Despesas */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 relative group overflow-hidden shadow-2xl bg-white/[0.02]">
          <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1 leading-none">Despesas (Mês)</p>
            <h2 className="text-3xl font-black tracking-tighter text-foreground">{formatCurrency(totalDespesas)}</h2>
          </div>
        </div>

        {/* Metric Card 3: Lucro Líquido */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 relative group overflow-hidden shadow-2xl bg-white/[0.02]">
          <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1 leading-none">Lucro Real</p>
            <h2 className="text-3xl font-black tracking-tighter text-foreground">{formatCurrency(realProfit)}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Stats Column */}
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-8">
            {/* Omitted redundant cards, now handled above */}
          </div>

          {/* Latest Orders List/Table */}
          <div className="glass p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-white/5 shadow-2xl bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8 md:mb-12">
               <h3 className="text-xl md:text-2xl font-black tracking-tighter">Últimas Encomendas</h3>
               <Button variant="ghost" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-full px-4 md:px-6">Ver Tudo</Button>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 border-b border-white/5">
                    <th className="pb-6 text-left">Obra / Cliente</th>
                    <th className="pb-6 text-left">Fase</th>
                    <th className="pb-6 text-left">Saúde</th>
                    <th className="pb-6 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-8">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-white/[0.03] overflow-hidden flex items-center justify-center p-1 border border-white/5 group-hover:border-primary/20 transition-all">
                            <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${order.id}`} className="w-full h-full object-contain opacity-40 group-hover:opacity-80 transition-opacity" />
                          </div>
                          <div>
                            <p className="text-base font-black tracking-tight">{order.cliente}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Ref: {order.id.slice(0, 6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-primary/5 text-primary/80 rounded-full border border-primary/10">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-8">
                        <div className="flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                           <span className="text-xs font-black opacity-60 italic">{Math.floor(Math.random() * 20) + 80}%</span>
                        </div>
                      </td>
                      <td className="py-8 text-right">
                        <p className="text-base font-black tracking-tight">{formatCurrency(Number(order.valor))}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                      <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${order.id}`} className="w-8 h-8 opacity-40" />
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight leading-none mb-1">{order.cliente}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 italic">{order.status}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black tracking-tighter text-foreground">{formatCurrency(Number(order.valor))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chart Column */}
        <div className="space-y-10">
           <div className="glass p-10 rounded-[3.5rem] border-white/5 shadow-2xl bg-white/[0.01]">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-xl font-black tracking-tighter">Segmentos</h3>
              <div className="h-10 w-10 glass border-white/5 rounded-full flex items-center justify-center text-primary shadow-lg">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={[
                { name: 'Cerâmica', val: 4200 },
                { name: 'Madeira', val: 3100 },
                { name: 'Têxtil', val: 1800 },
              ]}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 900}} stroke="rgba(255,255,255,0.2)" axisLine={false} tickLine={false} dy={15} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', backdropFilter: 'blur(10px)'}}
                />
                <Bar dataKey="val" radius={[10, 10, 10, 10]} barSize={35}>
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : index === 1 ? 'hsl(var(--primary)/0.6)' : 'hsl(var(--primary)/0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-12 space-y-4">
              {[
                { label: 'Cerâmica', color: 'bg-primary' },
                { label: 'Madeira', color: 'bg-primary/60' },
                { label: 'Têxtil', color: 'bg-primary/30' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full shadow-lg", item.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{item.label}</span>
                  </div>
                  <span className="text-xs font-black opacity-40 italic">{Math.floor(Math.random() * 30 + 20)}%</span>
                </div>
              ))}
            </div>
           </div>

           {/* Call to Action */}
           <div className="glass p-10 rounded-[3.5rem] border-white/5 bg-primary/5 group cursor-pointer hover:bg-primary/10 transition-all shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              <div className="flex items-center gap-8 relative z-10">
                <div className="h-16 w-16 glass rounded-[1.5rem] flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border-white/5">
                  <Landmark className="h-8 w-8" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">Próximo Passo</p>
                   <h4 className="text-2xl font-black tracking-tighter leading-none">Expandir Ateliê</h4>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

