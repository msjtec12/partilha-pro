import { Link, useLocation } from 'react-router-dom';
import { Home, Package, DollarSign, Settings } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/encomendas', label: 'Encomendas', icon: Package },
  { path: '/financas', label: 'Finanças', icon: DollarSign },
  { path: '/ajustes', label: 'Ajustes', icon: Settings },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-lg items-center justify-around py-3">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
