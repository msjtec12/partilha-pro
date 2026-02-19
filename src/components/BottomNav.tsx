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


interface BottomNavProps {
  className?: string;
}

export default function BottomNav({ className }: BottomNavProps) {
  const { pathname } = useLocation();

  return (
    <nav className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg glass rounded-[2.5rem] shadow-2xl safe-bottom border-white/10 animate-slide-up",
      className
    )}>
      <div className="flex items-center justify-around py-4">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-1.5 transition-all group",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 transition-transform group-active:scale-90",
                active ? "animate-bounce-slow" : ""
              )} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
              {active && (
                <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
