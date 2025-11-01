import { cn } from '@/lib/utils';

interface ShimmerProps {
  lines?: number;
  className?: string;
}

export const Shimmer = ({ lines = 3, className }: ShimmerProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
          style={{
            animationDelay: `${i * 100}ms`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  );
};
