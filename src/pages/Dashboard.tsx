import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MetricCard from '@/components/MetricCard';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowUpRight, Landmark, TrendingDown, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  encomendas: number;
  despesas: number;
}

export default function Dashboard() {
  const { user, plan } = useAuth();
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalEncomendas, setTotalEncomendas] = useState(0);
  const [realProfit, setRealProfit] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lateCount, setLateCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pipelineProfit, setPipelineProfit] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  
  const proLaborePercent = user?.user_metadata?.pro_labore_percent ?? 50;
  const reservePercent = 100 - proLaborePercent;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: encomendas } = await supabase
        .from('encomendas')
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

      // Filter recent orders (max 3)
      setRecentOrders(entries.slice(0, 3));

      // Only calculate late orders for logic, but UI will hide for free
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

      // Build chart data by month
      const months: Record<string, { encomendas: number; despesas: number }> = {};
      entregues.forEach(e => {
        const m = new Date(e.created_at).toLocaleDateString('pt-BR', { month: 'short' });
        if (!months[m]) months[m] = { encomendas: 0, despesas: 0 };
        months[m].encomendas += Number(e.valor);
        months[m].despesas += Number(e.custo || 0);
      });
      despesas?.forEach(d => {
        const m = new Date(d.data).toLocaleDateString('pt-BR', { month: 'short' });
        if (!months[m]) months[m] = { encomendas: 0, despesas: 0 };
        months[m].despesas += Number(d.valor);
      });

      setChartData(Object.entries(months).map(([name, v]) => ({ name, ...v })));
    };

    fetchData();
  }, [user]);

  const lucro = realProfit;
  const meuLucro = lucro * (proLaborePercent / 100);
  const reservaLoja = lucro * (reservePercent / 100);

  return (
    <div className="space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">O pulso do seu negócio hoje.</p>
        </div>
        <div className="h-10 w-10 glass rounded-full flex items-center justify-center border-white/10 shadow-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
      </div>

      {plan === 'pro' && lateCount > 0 && (
        <div className="glass p-5 rounded-[2rem] border-rose-500/20 bg-rose-500/5 animate-pulse flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">Ação Necessária</p>
            <p className="text-sm font-medium text-foreground/80 mt-0.5">
              <span className="font-bold underline">{lateCount} encomendas</span> pendentes há mais de 7 dias.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        <div className="relative group overflow-hidden rounded-[2.5rem] p-7 premium-gradient shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform">
          <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Lucro Líquido Acumulado</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black tracking-tighter text-white drop-shadow-sm">{formatCurrency(meuLucro)}</h2>
              <ArrowUpRight className="h-6 w-6 text-white/50" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Sócios/Gastos"
            value={formatCurrency(totalDespesas)}
            icon={<TrendingDown className="h-5 w-5" />}
            variant="expense"
          />
          <MetricCard
            title="Caixa Loja"
            value={formatCurrency(reservaLoja)}
            icon={<Landmark className="h-5 w-5" />}
            variant="reserve"
          />
        </div>
        
        {pipelineValue > 0 && (
          <div className="glass p-5 rounded-[2rem] border-primary/10 bg-primary/5 flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Lucro em Produção</p>
                <p className="text-xl font-black text-foreground">{formatCurrency(pipelineProfit)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">A Receber</p>
              <p className="text-sm font-bold text-foreground/60">{formatCurrency(pipelineValue)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 px-2">Atividades Recentes</h2>
        <div className="space-y-3">
          {recentOrders.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8 glass rounded-[2rem]">Nenhuma atividade recente.</p>
          )}
          {recentOrders.map(order => (
            <div key={order.id} className="glass p-4 rounded-2xl flex items-center justify-between border-white/5 animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{order.cliente}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{order.status}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-success">{formatCurrency(Number(order.valor))}</p>
            </div>
          ))}
        </div>
      </div>

      {plan === 'pro' && chartData.length > 0 ? (
        <div className="glass p-7 rounded-[2.5rem] border-white/5 animate-fade-in shadow-xl">
          <h2 className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 text-center">Desempenho Financeiro</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEnc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDesp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fontWeight: 800 }} 
                stroke="hsl(var(--muted-foreground))" 
                axisLine={false}
                tickLine={false}
                dy={12}
              />
              <YAxis 
                hide
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(var(--card-rgb), 0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  fontSize: 12,
                  fontWeight: 900
                }}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="encomendas" 
                stroke="hsl(var(--success))" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#colorEnc)" 
                name="Ganhos"
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="despesas" 
                stroke="hsl(var(--expense))" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#colorDesp)" 
                name="Gastos"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="glass p-8 rounded-[2.5rem] border-white/5 border-dashed border-2 flex flex-col items-center text-center animate-fade-in">
          <div className="h-16 w-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
            <TrendingUp className="h-8 w-8" />
          </div>
          <p className="text-xl font-black text-foreground mb-2">Análises Avançadas Bloqueadas</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-[240px]">Faça upgrade para o plano Pro e visualize o crescimento do seu negócio com gráficos detalhados.</p>
          <Button className="rounded-2xl h-12 px-8 font-bold premium-gradient" asChild>
            <a href="/ajustes">Assinar Plano Pro</a>
          </Button>
        </div>
      )}
    </div>
  );
}
