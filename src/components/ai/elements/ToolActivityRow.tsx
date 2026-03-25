import { cn } from '@/lib/utils';
import { Loader2 } from '@/lib/icons';
import { toolActivityParts, toolActivityPhrase } from '@/lib/toolDisplayLabels';
import type { ToolActivityStep } from '@/types/contentBlock';

interface ToolActivityRowProps {
  step: ToolActivityStep;
}

/** One tool per row: plain “verb target” copy (no pills), aligned with assistant message text. */
export function ToolActivityRow({ step }: ToolActivityRowProps) {
  const running = step.status === 'running';
  const phase = running ? 'running' : 'done';
  const { verb, target } = toolActivityParts(step.apiName, phase, step.displayTarget);
  const ariaLabel = toolActivityPhrase(step.apiName, phase, step.displayTarget);

  return (
    <div
      className="flex items-center gap-2 text-sm leading-relaxed"
      role="status"
      aria-label={ariaLabel}
      aria-live={running ? 'polite' : 'off'}
    >
      <p className={cn('min-w-0', !running && 'text-muted-foreground/90')}>
        <span className="font-bold text-muted-foreground">{verb}</span>
        <span
          className={cn(
            'font-medium',
            running ? 'text-muted-foreground' : 'text-primary',
          )}
        >
          {' '}
          {target}
        </span>
      </p>
      {running && (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
      )}
    </div>
  );
}
