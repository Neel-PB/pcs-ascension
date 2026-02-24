import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDynamicSidebar } from "@/hooks/useDynamicSidebar";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { supabase } from "@/integrations/supabase/client";
import { Users, Briefcase, FileText, MessageSquare, Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface GlobalSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchCommand({ open, onOpenChange }: GlobalSearchCommandProps) {
  const navigate = useNavigate();
  const { sidebarModules } = useDynamicSidebar();
  const { inputValue, debouncedValue, setInputValue } = useDebouncedSearch(300);

  const searchEnabled = debouncedValue.length >= 2;
  const searchTerm = `%${debouncedValue}%`;

  const { data: employees, isFetching: fetchingEmployees } = useQuery({
    queryKey: ["search-employees", debouncedValue],
    enabled: searchEnabled,
    queryFn: async () => {
      const { data } = await supabase
        .from("positions")
        .select("id, employeeName, employeeId, jobTitle, facilityName, positionNum")
        .eq("positionLifecycle", "Filled")
        .not("employmentFlag", "like", "%Contingent%")
        .or(`employeeName.ilike.${searchTerm},employeeId.ilike.${searchTerm},jobTitle.ilike.${searchTerm},positionNum.ilike.${searchTerm}`)
        .limit(5);
      return data || [];
    },
  });

  const { data: contractors, isFetching: fetchingContractors } = useQuery({
    queryKey: ["search-contractors", debouncedValue],
    enabled: searchEnabled,
    queryFn: async () => {
      const { data } = await supabase
        .from("positions")
        .select("id, employeeName, employeeId, jobTitle, facilityName")
        .eq("positionLifecycle", "Filled")
        .like("employmentFlag", "%Contingent%")
        .or(`employeeName.ilike.${searchTerm},employeeId.ilike.${searchTerm}`)
        .limit(5);
      return data || [];
    },
  });

  const { data: requisitions, isFetching: fetchingRequisitions } = useQuery({
    queryKey: ["search-requisitions", debouncedValue],
    enabled: searchEnabled,
    queryFn: async () => {
      const { data } = await supabase
        .from("positions")
        .select("id, positionNum, jobTitle, departmentName, facilityName")
        .neq("positionLifecycle", "Filled")
        .or(`positionNum.ilike.${searchTerm},jobTitle.ilike.${searchTerm},departmentName.ilike.${searchTerm}`)
        .limit(5);
      return data || [];
    },
  });

  const { data: feedback, isFetching: fetchingFeedback } = useQuery({
    queryKey: ["search-feedback", debouncedValue],
    enabled: searchEnabled,
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback")
        .select("id, title, type, priority")
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);
      return data || [];
    },
  });

  const isLoading = fetchingEmployees || fetchingContractors || fetchingRequisitions || fetchingFeedback;
  const hasEntityResults = (employees?.length || 0) + (contractors?.length || 0) + (requisitions?.length || 0) + (feedback?.length || 0) > 0;

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setInputValue("");
    navigate(url);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setInputValue("");
    onOpenChange(nextOpen);
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search pages, employees, requisitions..."
        value={inputValue}
        onValueChange={setInputValue}
      />
      <CommandList>
        {/* Loading indicator */}
        {searchEnabled && isLoading && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}

        {/* Hint when input is too short */}
        {inputValue.length > 0 && inputValue.length < 2 && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Type 2+ characters to search...
          </div>
        )}

        {/* Empty state - only when we searched and found nothing */}
        {searchEnabled && !isLoading && !hasEntityResults && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {/* Navigation - always visible, filtered by cmdk */}
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

        {/* Employees */}
        {employees && employees.length > 0 && (
          <CommandGroup heading="Employees">
            {employees.map((emp) => (
              <CommandItem
                key={emp.id}
                value={`employee ${emp.employeeName} ${emp.employeeId} ${emp.jobTitle}`}
                onSelect={() => handleSelect("/positions?tab=employees")}
              >
                <Users className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{emp.employeeName}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {emp.jobTitle} · {emp.facilityName}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Contractors */}
        {contractors && contractors.length > 0 && (
          <CommandGroup heading="Contractors">
            {contractors.map((c) => (
              <CommandItem
                key={c.id}
                value={`contractor ${c.employeeName} ${c.employeeId}`}
                onSelect={() => handleSelect("/positions?tab=contractors")}
              >
                <Briefcase className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{c.employeeName}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {c.jobTitle} · {c.facilityName}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Requisitions */}
        {requisitions && requisitions.length > 0 && (
          <CommandGroup heading="Requisitions">
            {requisitions.map((r) => (
              <CommandItem
                key={r.id}
                value={`requisition ${r.positionNum} ${r.jobTitle} ${r.departmentName}`}
                onSelect={() => handleSelect("/positions?tab=requisitions")}
              >
                <FileText className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{r.positionNum}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {r.jobTitle} · {r.departmentName}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Feedback */}
        {feedback && feedback.length > 0 && (
          <CommandGroup heading="Feedback">
            {feedback.map((fb) => (
              <CommandItem
                key={fb.id}
                value={`feedback ${fb.title}`}
                onSelect={() => handleSelect("/feedback")}
              >
                <MessageSquare className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate font-medium">{fb.title}</span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{fb.type}</Badge>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{fb.priority}</Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
