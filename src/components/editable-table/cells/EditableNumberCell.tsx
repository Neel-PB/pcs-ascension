import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Pencil, RotateCcw } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface EditableNumberCellProps {
  value: number | null | undefined;
  originalValue?: number | null | undefined;
  onSave: (newValue: number | null) => void | Promise<void>;
  className?: string;
  showModified?: boolean;
}

export function EditableNumberCell({ 
  value, 
  originalValue,
  onSave, 
  className,
  showModified = false 
}: EditableNumberCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isModified = showModified && originalValue !== undefined && value !== originalValue;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsEditing(false);
    const numValue = editValue === '' ? null : parseFloat(editValue);
    if (numValue !== value) {
      await onSave(numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value?.toString() || '');
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleRevert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (originalValue !== undefined) {
      await onSave(originalValue);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full h-full flex items-center justify-center px-4">
        <input
          ref={inputRef}
          type="number"
          step="0.01"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full text-center font-medium text-sm bg-background border border-primary rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full h-full px-4",
        "hover:bg-muted/50 transition-colors cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <span className={cn("text-sm font-medium", isModified && "text-destructive")}>
        {value != null ? value : '—'}
      </span>
      {isModified ? (
        <RotateCcw
          className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleRevert(e);
          }}
        />
      ) : (
        <Pencil
          className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        />
      )}
    </div>
  );
}
