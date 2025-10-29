import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDynamicSidebar } from "@/hooks/useDynamicSidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface GlobalSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchCommand({ open, onOpenChange }: GlobalSearchCommandProps) {
  const navigate = useNavigate();
  const { sidebarModules } = useDynamicSidebar();

  const handleSelect = (url: string) => {
    onOpenChange(false);
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {sidebarModules.map((module) =>
            module.items.map((item) =>
              item.url ? (
                <CommandItem
                  key={item.url}
                  value={`${module.label} ${item.title}`}
                  onSelect={() => handleSelect(item.url!)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ) : null
            )
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
