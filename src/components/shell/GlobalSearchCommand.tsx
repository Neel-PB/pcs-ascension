import { useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { supabase } from "@/integrations/supabase/client";
import { Users, Briefcase, FileText, MessageSquare, Loader2 } from "@/lib/icons";
import { SearchField } from "@/components/ui/search-field";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function GlobalSearchCommand() {
  const navigate = useNavigate();
  const { inputValue, debouncedValue, setInputValue } = useDebouncedSearch(300);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOpen = inputValue.length > 0;

  const searchEnabled = debouncedValue.length >= 2;
  const searchTerm = `%${debouncedValue}%`;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setInputValue]);



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
  const hasResults = (employees?.length || 0) + (contractors?.length || 0) + (requisitions?.length || 0) + (feedback?.length || 0) > 0;

  const handleSelect = useCallback((url: string) => {
    setInputValue("");
    navigate(url);
  }, [navigate, setInputValue]);

  const ResultItem = ({ icon: Icon, label, sub, onClick }: { icon: React.ElementType; label: string; sub: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 text-left rounded-md hover:bg-accent transition-colors"
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground truncate">{sub}</span>
      </div>
    </button>
  );

  return (
    <div ref={containerRef} className="relative w-full" data-tour="header-search">
      <SearchField
        placeholder="Search..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onClear={() => setInputValue("")}
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-popover text-popover-foreground shadow-lg z-50 max-h-80 overflow-y-auto">
          {inputValue.length < 2 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Type 2+ characters to search...</p>
          )}

          {searchEnabled && isLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />Searching...
            </div>
          )}

          {searchEnabled && !isLoading && !hasResults && (
            <p className="py-4 text-center text-sm text-muted-foreground">No results found.</p>
          )}

          {employees && employees.length > 0 && (
            <div className="p-1">
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Employees</p>
              {employees.map((emp) => (
                <ResultItem key={emp.id} icon={Users} label={emp.employeeName || ""} sub={`${emp.jobTitle} · ${emp.facilityName}`} onClick={() => handleSelect("/positions?tab=employees")} />
              ))}
            </div>
          )}

          {contractors && contractors.length > 0 && (
            <div className="p-1">
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Contractors</p>
              {contractors.map((c) => (
                <ResultItem key={c.id} icon={Briefcase} label={c.employeeName || ""} sub={`${c.jobTitle} · ${c.facilityName}`} onClick={() => handleSelect("/positions?tab=contractors")} />
              ))}
            </div>
          )}

          {requisitions && requisitions.length > 0 && (
            <div className="p-1">
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Requisitions</p>
              {requisitions.map((r) => (
                <ResultItem key={r.id} icon={FileText} label={r.positionNum || ""} sub={`${r.jobTitle} · ${r.departmentName}`} onClick={() => handleSelect("/positions?tab=requisitions")} />
              ))}
            </div>
          )}

          {feedback && feedback.length > 0 && (
            <div className="p-1">
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Feedback</p>
              {feedback.map((fb) => (
                <button key={fb.id} onClick={() => handleSelect("/feedback")} className="flex items-center gap-2 w-full px-3 py-2 text-left rounded-md hover:bg-accent transition-colors">
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium truncate text-foreground">{fb.title}</span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{fb.type}</Badge>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{fb.priority}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
