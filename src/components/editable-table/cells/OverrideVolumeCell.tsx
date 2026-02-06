import { useState, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pencil, Check, X, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

type CellState = 'idle' | 'editing' | 'saved';

interface BadgeConfig {
  icon: LucideIcon;
  label: string;
  className: string;
  tooltip: string;
}

interface OverrideVolumeCellProps {
  value: number | null | undefined;
  isPending?: boolean; // NEW: Whether this value is pending (stored in memory, not DB)
  onSave: (value: number | null) => Promise<void>;
  onDelete: () => Promise<void>;
  badge: BadgeConfig;
  showWarning?: boolean;
  warningTooltip?: string;
}

export function OverrideVolumeCell({
  value,
  isPending = false,
  onSave,
  onDelete,
  badge,
  showWarning = false,
  warningTooltip,
}: OverrideVolumeCellProps) {
  // Determine initial state: pending shows value but not as 'saved', idle shows nothing
  const [state, setState] = useState<CellState>(
    isPending ? 'saved' : (value != null ? 'saved' : 'idle')
  );
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when value changes externally
  useEffect(() => {
    setState(value != null ? 'saved' : 'idle');
    setEditValue(value?.toString() || '');
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (state === 'editing' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [state]);

  const handleStartEdit = () => {
    setEditValue(value?.toString() || '');
    setState('editing');
  };

  const handleAccept = async () => {
    const numValue = editValue.trim() === '' ? null : parseFloat(editValue);
    if (numValue !== null && isNaN(numValue)) return;

    setIsLoading(true);
    try {
      await onSave(numValue);
      setState(numValue != null ? 'saved' : 'idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setState(value != null ? 'saved' : 'idle');
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();
      setState('idle');
      setEditValue('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAccept();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const BadgeIcon = badge.icon;

  return (
    <div className="flex items-center gap-2 px-3 py-2 w-full">
      {/* Status Badge */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn('shrink-0 gap-1', badge.className)}>
            <BadgeIcon className="h-3 w-3" />
            <span className="text-xs">{badge.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {badge.tooltip}
        </TooltipContent>
      </Tooltip>

      {/* Value / Edit Area */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {state === 'idle' && (
          <>
            <span className="text-sm text-muted-foreground">—</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={handleStartEdit}
                  disabled={isLoading}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add override volume</TooltipContent>
            </Tooltip>
            {showWarning && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-destructive ml-1">⚠</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{warningTooltip}</TooltipContent>
              </Tooltip>
            )}
          </>
        )}

        {state === 'editing' && (
          <>
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-20 text-sm font-medium bg-background border border-input rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={handleAccept}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Accept</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cancel</TooltipContent>
            </Tooltip>
          </>
        )}

        {state === 'saved' && (
          <>
            <span className="text-sm font-medium">{value}</span>
            {/* Only show Revert button after full save (not pending) */}
            {!isPending && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Revert override</TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  );
}
