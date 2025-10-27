import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HelixSelectProps {
  label: string;
  required?: boolean;
  helperText?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

export const HelixSelect: React.FC<HelixSelectProps> = ({
  label,
  required = false,
  helperText,
  value,
  onValueChange,
  disabled = false,
  placeholder,
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col", className)}>
      <label className="text-sm font-semibold text-foreground mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{children}</SelectGroup>
        </SelectContent>
      </Select>
      {helperText && (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      )}
    </div>
  );
};
