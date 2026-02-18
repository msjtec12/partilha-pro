import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Package, TrendingUp, Shield, Zap, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 glass rounded-xl flex items-center justify-center p-2 shadow-xl border-white/10">
            <img src="/logo.png" alt="Logo" className="h-full object-contain" />
          </div>
          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Partilha Pro
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth?mode=login">
            <Button variant="ghost" className="font-bold text-sm hidden md:flex">Entrar</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button className="premium-gradient rounded-xl font-bold px-6 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              Começar Agora
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="animate-fade-in space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-xs font-bold uppercase tracking-widest text-primary mb-4 shadow-sm">
            <Star className="h-3 w-3 fill-primary" /> O Futuro da sua Oficina
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl mx-auto leading-[1.1]">
            Sua oficina <span className="text-primary italic">organizada</span>, seu negócio <span className="premium-text-gradient">profissional</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            A ferramenta definitiva para artesãos e donos de oficinas que buscam profissionalismo, clareza financeira e crescimento real.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="h-14 px-8 rounded-2xl text-lg font-bold premium-gradient shadow-2xl shadow-primary/30 gap-2 transition-all hover:gap-4">
                Criar minha conta grátis <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" /> Sem cartão de crédito
            </div>
          </div>

          {/* Hero Image / Mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 -z-10" />
            <div className="glass rounded-[2.5rem] p-4 border-white/10 shadow-3xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=2070" 
                alt="Artesanato Manual Profissional" 
                className="rounded-[2rem] w-full object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] aspect-video md:aspect-[21/9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Tudo o que você precisa</h2>
            <p className="text-muted-foreground font-medium">Funcionalidades pensadas para quem põe a mão na massa.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Package className="h-6 w-6" />}
              title="Gestão de Encomendas"
              description="Acompanhe cada pedido do início ao fim com status visíveis e alertas de atraso."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-6 w-6" />}
              title="Fluxo de Caixa"
              description="Visualize suas finanças, despesas e organização com relatórios inteligentes e práticos."
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6" />}
              title="Catálogo de Produtos"
              description="Gerencie seu inventário e precifique suas criações de forma profissional e rápida."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-left">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Preço justo para <br /><span className="text-primary">todo tamanho de negócio.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Comece de graça e evolua conforme sua produção aumenta. Nosso foco é o seu sucesso.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 font-bold text-foreground">
                <Shield className="h-5 w-5 text-primary" /> Pagamento Seguro via Stripe
              </li>
              <li className="flex items-center gap-3 font-bold text-foreground">
                <Users className="h-5 w-5 text-primary" /> Gestão de Equipe no Pro
              </li>
            </ul>
          </div>
          
          <div className="w-full md:w-96 glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">Plano Business</span>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black">R$ 49,90</span>
                <span className="text-muted-foreground font-bold">/mês</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground font-medium">Acesso total a todas as funcionalidades premium.</p>
              
              <ul className="mt-8 space-y-4">
                {['Encomendas Ilimitadas', 'Gestão de Colaboradores', 'Relatórios em PDF', 'Suporte Prioritário'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {item}
                  </li>
                ))}
              </ul>
              
              <Link to="/auth?mode=signup">
                <Button className="w-full mt-10 h-14 rounded-2xl text-lg font-bold premium-gradient shadow-xl transition-transform hover:scale-105">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 text-center text-muted-foreground">
        <p className="text-sm font-bold tracking-widest uppercase">Partilha Pro © 2024</p>
        <p className="mt-2 text-[10px] uppercase tracking-tighter opacity-50">Sua oficina, seu império.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 rounded-[2rem] border-white/5 hover:border-primary/20 transition-all hover:translate-y-[-4px] group">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed font-medium">{description}</p>
    </div>
  );
}
