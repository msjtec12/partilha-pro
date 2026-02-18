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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-success/10 blur-3xl animate-pulse" />
      
      <div className="w-full max-w-sm glass p-8 rounded-[2rem] shadow-2xl animate-slide-up relative z-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-auto items-center justify-center">
            <img src="/logo.png" alt="Partilha Pro Logo" className="h-20 object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Partilha Pro</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin ? 'Sua oficina organizada, lucro no bolso.' : 'Comece sua jornada profissional hoje.'}
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
                  className="h-12 rounded-xl bg-background/50 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nome da Oficina"
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-background/50 border-white/10"
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
              className="h-12 rounded-xl bg-background/50 border-white/10"
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
              className="h-12 rounded-xl bg-background/50 border-white/10"
            />
          </div>
          <Button type="submit" className="h-12 w-full text-base font-semibold rounded-xl premium-gradient shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Crie sua conta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? 'Novo por aqui?' : 'Já possui conta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-primary hover:text-success transition-colors"
          >
            {isLogin ? 'Cadastre-se' : 'Acesse agora'}
          </button>
        </p>
      </div>
    </div>
  );
}
