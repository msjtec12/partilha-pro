import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Package, TrendingUp, Shield, Zap, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden dark">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-10 py-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="h-14 w-14 glass rounded-[1.25rem] flex items-center justify-center p-3 shadow-2xl border-white/5 bg-white/[0.03] group-hover:bg-white/[0.08] transition-all">
            <img src="/logo.png" alt="Logo" className="h-full object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase leading-none">
            PARTILHA <span className="text-primary italic">PRO</span>
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          <a href="#features" className="hover:text-primary transition-all hover:tracking-[0.4em]">O Ateliê</a>
          <a href="#about" className="hover:text-primary transition-all hover:tracking-[0.4em]">Soluções</a>
          <a href="#contact" className="hover:text-primary transition-all hover:tracking-[0.4em]">Mentoria</a>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/auth?mode=login">
            <Button variant="ghost" className="font-black text-[11px] hidden md:flex uppercase tracking-[0.3em] hover:text-primary">Entrar</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button className="premium-gradient rounded-full font-black px-10 h-14 shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter text-xs">
              Mudar de Nível
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-60 px-10 max-w-7xl mx-auto text-center lg:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="animate-fade-in space-y-12">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 mb-2">
              <Star className="h-3 w-3 fill-primary/50" /> O Futuro da sua Arte
            </div>
            <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter leading-[0.85] text-balance">
              Sua oficina <br />
              <span className="text-primary italic">organizada</span>, <br />
              sua arte <br />
              <span className="premium-text-gradient">lucrativa</span>.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl font-medium leading-relaxed opacity-80">
              Gestão de alta precisão para artesãos que elevam seu trabalho ao nível profissional. Controle total, do esboço à entrega.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-8 pt-8">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                <Button size="lg" className="h-20 px-16 rounded-full text-xl font-black premium-gradient shadow-2xl shadow-primary/30 gap-4 transition-all hover:px-20 uppercase tracking-tighter">
                  COMEÇAR AGORA <ArrowRight className="h-6 w-6" />
                </Button>
              </Link>
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 text-muted-foreground/60 font-black uppercase tracking-widest text-[9px]">
                   <CheckCircle2 className="h-4 w-4 text-primary" /> 7 dias de acesso total
                </div>
                <div className="flex items-center gap-2 text-muted-foreground/60 font-black uppercase tracking-widest text-[9px]">
                   <CheckCircle2 className="h-4 w-4 text-primary" /> Sem compromisso
                </div>
              </div>
            </div>
          </div>

          {/* Artistic Image Mockup */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute -inset-16 bg-primary/20 blur-[150px] rounded-full opacity-40 -z-10 animate-pulse" />
            <div className="glass rounded-[4rem] p-6 border-white/5 shadow-[0_0_120px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              <div className="aspect-[4/5] md:aspect-square overflow-hidden rounded-[3.25rem] relative">
                <img 
                  src="/mockup.png" 
                  alt="Partilha Pro Mockup" 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
                
                {/* Floating UI Elements matching mockup */}
                <div className="absolute bottom-10 left-10 right-10 glass p-8 rounded-[2rem] border-white/10 shadow-3xl animate-bounce-slow bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-[1rem] bg-primary/20 flex items-center justify-center text-primary border border-primary/10">
                      <Zap className="h-6 w-6 fill-primary" />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-muted-foreground/80">Performance Artisanal</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[72%] premium-gradient rounded-full shadow-[0_0_20px_rgba(255,100,0,0.4)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-48 px-10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">O Essencial para o seu Ateliê</h2>
            <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto leading-relaxed">Desenvolvido por quem entende de mão na massa e de números.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <FeatureCard 
              icon={<Package className="h-10 w-10" />}
              title="Encomendas Sob Medida"
              description="Controle cada etapa da obra, do orçamento à entrega final com status visuais intuitivos."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-10 w-10" />}
              title="Clareza Financeira"
              description="Saiba exatamente onde cada centavo está sendo investido e qual o lucro real da sua arte."
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10" />}
              title="Escalabilidade"
              description="Ferramentas prontas para transformar seu pequeno ateliê em uma operação de alto nível."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-32 px-10 border-t border-white/5 text-center">
        <div className="flex justify-center mb-10">
          <div className="h-16 w-16 glass rounded-2xl flex items-center justify-center p-4 border-white/5">
            <img src="/logo.png" alt="Logo" className="h-full object-contain grayscale opacity-50" />
          </div>
        </div>
        <p className="text-[11px] font-black tracking-[0.6em] uppercase text-muted-foreground/30 mb-2">PARTILHA PRO © 2024</p>
        <p className="text-[10px] uppercase tracking-widest text-primary/30 font-bold italic">A excelência em cada detalhe, como sua arte.</p>
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
