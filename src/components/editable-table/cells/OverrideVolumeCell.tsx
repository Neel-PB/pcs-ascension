import { useState, useRef, useEffect } from 'react';
import type { LucideIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Pencil, Check, X, RotateCcw } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type CellState = 'idle' | 'editing' | 'saved';

interface BadgeConfig {
  icon: LucideIcon;
  label: string;
  className: string;
  tooltip: string;
}

interface OverrideVolumeCellProps {
  value: number | null | undefined;
  isPending?: boolean;
  maxVolume?: number | null;
  onSave: (value: number | null) => Promise<void>;
  onDelete: () => Promise<void>;
  badge?: BadgeConfig;
  showWarning?: boolean;
  warningTooltip?: string;
}

export function OverrideVolumeCell({
  value,
  isPending = false,
  maxVolume,
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

    if (numValue !== null) {
      if (numValue < 0) {
        toast.error('Value must be at least 0');
        return;
      }
      if (maxVolume != null && numValue > maxVolume) {
        toast.error(`Value must not exceed ${maxVolume}`);
        return;
      }
    }

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

  const BadgeIcon = badge?.icon;

  return (
    <div className="flex items-center justify-between w-full h-full px-4">
      {state === 'idle' && (
        <>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">—</span>
            {showWarning && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-destructive">⚠</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{warningTooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <Pencil
            className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            onClick={handleStartEdit}
          />
        </>
      )}

      {state === 'editing' && (
        <div className="flex items-center gap-1">
          <div className="flex flex-col gap-0.5">
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              min="0"
              max={maxVolume ?? undefined}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-24 text-sm font-medium bg-background border border-input rounded px-2 py-1 focus:outline-none"
              disabled={isLoading}
            />
            {maxVolume != null && (
              <span className="text-[10px] text-muted-foreground leading-none">Max: {maxVolume}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
            onClick={handleAccept}
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {state === 'saved' && (
        <>
          <span className="text-sm font-medium">{value}</span>
          {!isPending ? (
            <RotateCcw
              className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              onClick={handleDelete}
            />
          ) : (
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </>
      )}
    </div>
  );
}
