import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, { full_name: fullName, workshop_name: workshopName });

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else if (!isLogin) {
      toast({
        title: 'Conta criada!',
        description: 'Verifique seu e-mail para confirmar o cadastro.',
      });
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden dark">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-sm glass p-10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-slide-up relative z-10 border-white/5">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-auto items-center justify-center">
            <img src="/logo.png?v=2" alt="Mestre Ateliê Logo" className="h-20 object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">Mestre Ateliê</h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-primary/60 italic">
            {isLogin ? 'Sua oficina, seu império.' : 'A jornada oficial começa aqui.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-white/10 border-white/10 placeholder:text-muted-foreground/50 font-bold text-white focus:bg-white/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nome da Oficina"
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-white/10 border-white/10 placeholder:text-muted-foreground/50 font-bold text-white focus:bg-white/20 transition-all"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 rounded-2xl bg-white/10 border-white/10 placeholder:text-muted-foreground/50 font-bold text-white focus:bg-white/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-14 rounded-2xl bg-white/10 border-white/10 placeholder:text-muted-foreground/50 font-bold text-white focus:bg-white/20 transition-all"
            />
          </div>
          <Button type="submit" className="h-14 w-full text-sm font-black uppercase tracking-tighter rounded-full premium-gradient shadow-2xl shadow-primary/30 mt-6 transition-all hover:scale-105 active:scale-95" disabled={loading}>
            {loading ? 'Carregando...' : isLogin ? 'ENTRAR AGORA' : 'CRIAR MINHA CONTA'}
          </Button>
        </form>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {isLogin ? 'Novo por aqui?' : 'Já possui conta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-foreground transition-colors underline underline-offset-4"
          >
            {isLogin ? 'Cadastre-se' : 'Acesse agora'}
          </button>
        </p>
      </div>
    </div>
  );
}

