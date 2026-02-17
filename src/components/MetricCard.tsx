import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  variant: 'success' | 'expense' | 'reserve';
}

const variantStyles = {
  success: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20',
  expense: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/20',
  reserve: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/20',
};

const iconBackgrounds = {
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  expense: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  reserve: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
};

export default function MetricCard({ title, value, icon, variant }: MetricCardProps) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm border animate-slide-up transition-all hover:scale-[1.02] active:scale-[0.98] ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBackgrounds[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
