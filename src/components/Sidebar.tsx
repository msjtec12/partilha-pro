import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Settings, LogOut, ShoppingBag, User, BarChart3, ShoppingCart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: TrendingUp, label: 'Performance', path: '/' },
  { icon: ShoppingBag, label: 'Encomendas', path: '/encomendas' },
  { icon: Package, label: 'Catálogo', path: '/produtos' },
  { icon: Settings, label: 'Ajustes', path: '/ajustes' },
];

export default function Sidebar({ className }: SidebarProps) {
  const { pathname } = useLocation();
  const { user, signOut, workshopName } = useAuth();

  return (
    <aside className={cn(
      "w-80 flex-col bg-background/50 backdrop-blur-3xl border-r border-white/5 p-10 transition-all duration-300 hidden lg:flex",
      className
    )}>
      {/* Profile Header */}
      <div className="flex items-center gap-5 mb-16 p-3 rounded-[2rem] hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5">
        <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-2xl group-hover:scale-110 transition-transform">
           <User className="h-7 w-7 text-primary fill-primary" />
        </div>
        <div className="overflow-hidden">
          <p className="font-black text-base tracking-tighter truncate leading-none mb-1 text-foreground">{user?.email?.split('@')[0]}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 italic truncate">{workshopName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-5 px-6 py-4.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.25em] transition-all group",
                isActive 
                  ? "bg-white/10 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/5" 
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5 hover:tracking-[0.3em]"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform group-hover:scale-110",
                isActive ? "text-primary fill-primary/20" : "text-muted-foreground/30 group-hover:text-primary/60"
              )} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(255,100,0,0.6)] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto pt-10 border-t border-white/5">
        <Button 
          variant="ghost" 
          onClick={() => signOut()}
          className="w-full justify-start gap-5 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 px-6 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Encerrar Sessão
        </Button>
      </div>
    </aside>
  );
}
