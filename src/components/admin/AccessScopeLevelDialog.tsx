import { useState, useMemo } from "react";
import { Search } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ScopeItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface AccessScopeLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
  items: ScopeItem[];
  selected: Set<string>;
  onDone: (selected: Set<string>) => void;
  searchable?: boolean;
}

export function AccessScopeLevelDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  items,
  selected,
  onDone,
  searchable = false,
}: AccessScopeLevelDialogProps) {
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set(selected));
  const [search, setSearch] = useState("");

  // Reset on open
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalSelected(new Set(selected));
      setSearch("");
    }
    onOpenChange(isOpen);
  };

  const toggleItem = (id: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setLocalSelected(new Set(filteredItems.map((i) => i.id)));
  };

  const clearAll = () => setLocalSelected(new Set());

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.sublabel && i.sublabel.toLowerCase().includes(q))
    );
  }, [items, search]);

  const handleDone = () => {
    onDone(localSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary shrink-0">
              {icon}
            </div>
            <div>
              <DialogTitle className="text-base">{title}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search bar */}
        {searchable && (
          <div className="px-6 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        )}

        {/* Count bar */}
        <div className="px-6 pb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {localSelected.size} of {items.length} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:underline"
              disabled={localSelected.size === 0}
            >
              Clear
            </button>
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1 min-h-0 px-6">
          <div className="space-y-0.5 pb-3">
            {filteredItems.map((item) => {
              const checked = localSelected.has(item.id);
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    checked
                      ? "bg-primary/10 border border-primary/30"
                      : "border border-transparent hover:bg-muted/50"
                  )}
                >
                  <Checkbox checked={checked} className="shrink-0 pointer-events-none" />
                  <span className="text-sm flex-1 min-w-0 truncate">{item.label}</span>
                  {item.sublabel && (
                    <>
                      <div className="w-px h-4 bg-border shrink-0" />
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        {item.sublabel}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                {search ? "No results found" : "No items available"}
              </p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleDone}>
            Done
            {localSelected.size > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs bg-primary-foreground/20">
                {localSelected.size}
              </Badge>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
