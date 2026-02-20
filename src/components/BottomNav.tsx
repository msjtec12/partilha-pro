import { Link, useLocation } from 'react-router-dom';
import { Home, Package, DollarSign, Settings, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/produtos', label: 'Catálogo', icon: ShoppingBag },
  { path: '/encomendas', label: 'Pedidos', icon: Package },
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
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[96%] max-w-md glass rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-white/5 bg-black/70 backdrop-blur-3xl",
      className
    )}>
      <div className="flex items-stretch justify-around py-2 px-1">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-2xl transition-all duration-300",
                active
                  ? "text-primary"
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {/* Active background glow */}
              {active && (
                <span className="absolute inset-0 rounded-2xl bg-primary/10 border border-primary/10" />
              )}

              {/* Icon */}
              <span className="relative flex items-center justify-center h-6 w-6">
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  active ? "stroke-[2.5px] scale-110" : "stroke-[1.5px]"
                )} />
                {active && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,100,0,1)]" />
                )}
              </span>

              {/* Label — always visible */}
              <span className={cn(
                "relative text-[8px] font-black uppercase tracking-[0.15em] leading-none text-center w-full",
                active ? "opacity-100 text-primary" : "opacity-40"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
