import { useState } from "react";
import { ChevronDown, ChevronRight, Check, SlidersHorizontal } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CombinedOptionalFiltersProps {
  selectedSubmarket: string;
  selectedLevel2: string;
  selectedPstat: string;
  onSubmarketChange?: (value: string) => void;
  onLevel2Change?: (value: string) => void;
  onPstatChange?: (value: string) => void;
  submarketOptions: string[];
  level2Options: string[];
  pstatOptions: string[];
  submarketDisabled: boolean;
}

export function CombinedOptionalFilters({
  selectedSubmarket,
  selectedLevel2,
  selectedPstat,
  onSubmarketChange,
  onLevel2Change,
  onPstatChange,
  submarketOptions,
  level2Options,
  pstatOptions,
  submarketDisabled,
}: CombinedOptionalFiltersProps) {
  const [open, setOpen] = useState(false);

  // Count active filters
  const activeCount = [
    selectedSubmarket !== "all-submarkets",
    selectedLevel2 !== "all-level2",
    selectedPstat !== "all-pstat",
  ].filter(Boolean).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-lg border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          More Filters
          {activeCount > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 ml-1 text-[#1D69D2] transition-transform duration-200", open && "rotate-180")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-popover border-border z-50">
        {/* Submarket Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger 
            className={cn(
              "flex items-center justify-between",
              submarketDisabled && "opacity-50 pointer-events-none"
            )}
          >
            <span>Submarket</span>
            {selectedSubmarket !== "all-submarkets" && (
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {selectedSubmarket}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border-border z-50 max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => onSubmarketChange?.("all-submarkets")}
              className="flex items-center gap-2"
            >
              {selectedSubmarket === "all-submarkets" && <Check className="h-4 w-4" />}
              <span className={selectedSubmarket === "all-submarkets" ? "" : "ml-6"}>All Submarkets</span>
            </DropdownMenuItem>
            {submarketOptions.map((submarket) => (
              <DropdownMenuItem
                key={submarket}
                onClick={() => onSubmarketChange?.(submarket)}
                className="flex items-center gap-2"
              >
                {selectedSubmarket === submarket && <Check className="h-4 w-4" />}
                <span className={selectedSubmarket === submarket ? "" : "ml-6"}>{submarket}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Level 2 Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between">
            <span>Level 2</span>
            {selectedLevel2 !== "all-level2" && (
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {selectedLevel2.substring(0, 10)}...
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border-border z-50 max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => onLevel2Change?.("all-level2")}
              className="flex items-center gap-2"
            >
              {selectedLevel2 === "all-level2" && <Check className="h-4 w-4" />}
              <span className={selectedLevel2 === "all-level2" ? "" : "ml-6"}>All Level 2</span>
            </DropdownMenuItem>
            {level2Options.map((level) => (
              <DropdownMenuItem
                key={level}
                onClick={() => onLevel2Change?.(level)}
                className="flex items-center gap-2"
              >
                {selectedLevel2 === level && <Check className="h-4 w-4" />}
                <span className={selectedLevel2 === level ? "" : "ml-6"}>{level}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* PSTAT Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between">
            <span>PSTAT</span>
            {selectedPstat !== "all-pstat" && (
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {selectedPstat.substring(0, 10)}...
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border-border z-50 max-h-[300px] overflow-y-auto">
            <DropdownMenuItem
              onClick={() => onPstatChange?.("all-pstat")}
              className="flex items-center gap-2"
            >
              {selectedPstat === "all-pstat" && <Check className="h-4 w-4" />}
              <span className={selectedPstat === "all-pstat" ? "" : "ml-6"}>All PSTAT</span>
            </DropdownMenuItem>
            {pstatOptions.map((pstat) => (
              <DropdownMenuItem
                key={pstat}
                onClick={() => onPstatChange?.(pstat)}
                className="flex items-center gap-2"
              >
                {selectedPstat === pstat && <Check className="h-4 w-4" />}
                <span className={selectedPstat === pstat ? "" : "ml-6"}>{pstat}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
