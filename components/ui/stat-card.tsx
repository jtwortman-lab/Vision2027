import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  href,
  onClick,
}: StatCardProps) {
  const iconColors = {
    default: 'text-muted-foreground bg-muted',
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    destructive: 'text-destructive bg-destructive/10',
  };

  const isClickable = href || onClick;

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2.5', iconColors[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              trend.positive
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link 
        to={href} 
        className={cn(
          'stat-card block transition-all hover:shadow-md hover:border-primary/30 cursor-pointer',
          className
        )}
      >
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div 
        onClick={onClick}
        className={cn(
          'stat-card transition-all hover:shadow-md hover:border-primary/30 cursor-pointer',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={cn('stat-card', className)}>
      {content}
    </div>
  );
}
