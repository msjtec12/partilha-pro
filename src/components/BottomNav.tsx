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
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-md glass rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.6)] safe-bottom border-white/5 animate-slide-up bg-black/60 backdrop-blur-3xl",
      className
    )}>
      <div className="flex items-center justify-around py-4 px-3">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative flex flex-col items-center gap-2 transition-all duration-500",
                active ? "text-primary scale-110" : "text-white/20 hover:text-white/60"
              )}
            >
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500 relative",
                active ? "bg-primary/20 shadow-[0_0_25px_rgba(255,100,0,0.3)]" : "bg-transparent"
              )}>
                <Icon className={cn(
                  "h-6 w-6 transition-all duration-500",
                  active ? "stroke-[2.5px] scale-110" : "stroke-[1.5px]"
                )} />
                {active && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,100,0,1)]" />
                )}
              </div>
              <span className={cn(
                "text-[7px] font-black uppercase tracking-[0.2em] transition-all duration-500 leading-none",
                active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              )}>
                {label}
              </span>
              {active && (
                <div className="absolute -bottom-1 h-1 w-1.5 rounded-full bg-primary shadow-[0_0_15px_rgba(255,100,0,1)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
