import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  Pendente: { label: 'Pendente', className: 'bg-status-pendente text-white' },
  Fazer: { label: 'Fazer', className: 'bg-status-fazer text-white' },
  Entregar: { label: 'Entregar', className: 'bg-status-entregar text-white' },
  Entregue: { label: 'Entregue', className: 'bg-status-entregue text-white' },
  Recebido: { label: 'Recebido', className: 'bg-status-recebido text-white' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
