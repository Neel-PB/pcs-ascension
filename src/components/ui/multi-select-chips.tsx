import { useState, useRef } from "react";
import { X, Plus, Search, Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  isSystem?: boolean;
}

interface MultiSelectChipsProps {
  label?: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  icon?: React.ReactNode;
  addButtonText?: string;
  emptyText?: string;
  className?: string;
}

export function MultiSelectChips({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  searchable = true,
  icon,
  addButtonText = "Add",
  emptyText = "No restrictions",
  className,
}: MultiSelectChipsProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="pl-2.5 pr-1 py-1 flex items-center gap-1.5 text-sm"
            >
              {option.isSystem && <Lock className="h-3 w-3 text-muted-foreground" />}
              <span className="max-w-[150px] truncate">{option.label}</span>
              <button
                type="button"
                onClick={() => handleRemove(option.value)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">{emptyText}</span>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2.5 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              {addButtonText}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-72 p-0 bg-popover" 
            align="start"
            onOpenAutoFocus={() => inputRef.current?.focus()}
          >
            {searchable && (
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
              </div>
            )}
            <ScrollArea className="max-h-[250px]">
              <div className="p-1">
                {filteredOptions.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No items found
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors",
                          isSelected 
                            ? "bg-primary/15 border border-primary/30" 
                            : "border border-transparent hover:bg-muted/50"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(option.value)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {option.isSystem && (
                              <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-sm font-medium truncate">
                              {option.label}
                            </span>
                          </div>
                          {option.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {option.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
