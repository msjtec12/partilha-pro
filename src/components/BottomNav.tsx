import { Link, useLocation } from 'react-router-dom';
import { Home, Package, DollarSign, Settings, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/produtos', label: 'Catálogo', icon: ShoppingBag },
  { path: '/encomendas', label: 'Encomendas', icon: Package },
  { path: '/financas', label: 'Finanças', icon: DollarSign },
  { path: '/ajustes', label: 'Ajustes', icon: Settings },
];


export default function BottomNav({ className }: BottomNavProps) {
  const { pathname } = useLocation();

  return (
    <nav className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md glass rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] safe-bottom border-white/5 animate-slide-up bg-black/40 backdrop-blur-3xl",
      className
    )}>
      <div className="flex items-center justify-around py-4 px-2">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative flex flex-col items-center gap-1.5 transition-all duration-300 px-3 py-1 rounded-2xl",
                active ? "text-primary scale-110" : "text-muted-foreground/40 hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-500",
                active ? "bg-primary/10 shadow-[0_0_20px_rgba(255,100,0,0.2)]" : "bg-transparent"
              )}>
                <Icon className={cn(
                  "h-6 w-6 transition-all",
                  active ? "stroke-[2.5px]" : "stroke-[1.5px]"
                )} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest transition-all duration-300",
                active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              )}>
                {label}
              </span>
              {active && (
                <div className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-primary shadow-[0_0_10px_rgba(255,100,0,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
