import { useNavigate } from "react-router-dom";
import { useDynamicSidebar } from "@/hooks/useDynamicSidebar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GlobalSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function GlobalSearchCommand({ open, onOpenChange, children }: GlobalSearchCommandProps) {
  const navigate = useNavigate();
  const { sidebarModules } = useDynamicSidebar();

  const handleSelect = (url: string) => {
    onOpenChange(false);
    navigate(url);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[400px]" 
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <Command>
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}
