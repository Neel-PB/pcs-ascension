import { useState, useMemo, useCallback } from "react";
import { Filter } from "@/lib/icons";
import { differenceInDays } from "date-fns";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { useRequisitions } from "@/hooks/useRequisitions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { SearchField } from "@/components/ui/search-field";
import { RequisitionDetailsSheet } from "@/components/workforce/RequisitionDetailsSheet";
import { RequisitionsFilterSheet } from "@/components/positions/RequisitionsFilterSheet";
import { EditableTable } from "@/components/editable-table/EditableTable";

import { requisitionColumns, createRequisitionColumnsWithComments } from "@/config/requisitionColumns";
import { usePositionCommentCounts } from "@/hooks/usePositionCommentCounts";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

interface RequisitionsTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
}

export function RequisitionsTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedPstat,
  selectedLevel2,
  selectedDepartment,
}: RequisitionsTabProps) {
  const { data: requisitions, isFetching } = useRequisitions({
    selectedRegion,
    selectedMarket,
    selectedFacility,
    selectedDepartment,
  });

  const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDefaultTab, setSheetDefaultTab] = useState<"details" | "comments">("details");
  const [filterOpen, setFilterOpen] = useState(false);
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch(300);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    vacancyAgeMin: "",
    vacancyAgeMax: "",
    positionLifecycle: "all",
    skillType: "",
    shift: "all",
    employmentType: "all",
  });

  const handleRowClick = useCallback((requisition: any) => {
    setSelectedRequisition(requisition);
    setSheetDefaultTab("details");
    setSheetOpen(true);
  }, []);

  const handleCommentClick = useCallback((requisition: any) => {
    setSelectedRequisition(requisition);
    setSheetDefaultTab("comments");
    setSheetOpen(true);
  }, []);

  const getVacancyAge = (statusDate: string | null) => {
    if (!statusDate) return null;
    return differenceInDays(new Date(), new Date(statusDate));
  };

  const getVacancyBadge = (days: number | null) => {
    if (!days) return { variant: "secondary" as const, label: "—", className: "" };
    if (days > 60)
      return { variant: "outline" as const, label: `${days}d - Urgent`, className: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400" };
    if (days > 30)
      return { variant: "outline" as const, label: `${days}d - Attention`, className: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400" };
    return { variant: "outline" as const, label: `${days}d - On Track`, className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
  };

  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  const clearFilters = () => {
    setFilters({
      vacancyAgeMin: "",
      vacancyAgeMax: "",
      positionLifecycle: "all",
      skillType: "",
      shift: "all",
      employmentType: "all",
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.vacancyAgeMin) count++;
    if (filters.vacancyAgeMax) count++;
    if (filters.positionLifecycle !== "all") count++;
    if (filters.skillType) count++;
    if (filters.shift !== "all") count++;
    if (filters.employmentType !== "all") count++;
    return count;
  }, [filters]);

  const filteredAndSortedRequisitions = useMemo(() => {
    if (!requisitions) return [];

    let filtered = requisitions.map((req) => ({
      ...req,
      vacancyAge: getVacancyAge(req.positionStatusDate),
    }));

    // Apply debounced search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((r) => {
        const searchFields = [
          r.positionNum,
          r.jobTitle,
          r.jobFamily,
          r.departmentName,
          r.positionLifecycle,
          r.employmentType,
          r.shift,
        ];
        return searchFields.some((field) => 
          field?.toString().toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    if (filters.vacancyAgeMin) {
      const minAge = parseInt(filters.vacancyAgeMin);
      filtered = filtered.filter((r) => (r.vacancyAge ?? 0) >= minAge);
    }
    if (filters.vacancyAgeMax) {
      const maxAge = parseInt(filters.vacancyAgeMax);
      filtered = filtered.filter((r) => (r.vacancyAge ?? 0) <= maxAge);
    }
    if (filters.positionLifecycle !== "all") {
      filtered = filtered.filter((r) => r.positionLifecycle === filters.positionLifecycle);
    }
    if (filters.skillType) {
      filtered = filtered.filter((r) => 
        r.jobFamily?.toLowerCase().includes(filters.skillType.toLowerCase())
      );
    }
    if (filters.shift !== "all") {
      filtered = filtered.filter((r) => r.shift === filters.shift);
    }
    if (filters.employmentType !== "all") {
      filtered = filtered.filter((r) => r.employmentType === filters.employmentType);
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Handle vacancy age sorting
        if (sortColumn === "vacancyAge") {
          aVal = a.vacancyAge ?? 0;
          bVal = b.vacancyAge ?? 0;
        }

        // Handle null/undefined
        if (!aVal && aVal !== 0) return 1;
        if (!bVal && bVal !== 0) return -1;

        if (typeof aVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return filtered;
  }, [requisitions, debouncedSearch, filters, sortColumn, sortDirection]);

  // Extract position IDs for comment count fetching
  const positionIds = useMemo(() => 
    filteredAndSortedRequisitions.map(r => r.id), 
    [filteredAndSortedRequisitions]
  );

  // Fetch comment counts
  const commentCounts = usePositionCommentCounts(positionIds);

  const columnsWithComments = useMemo(() => 
    createRequisitionColumnsWithComments(commentCounts, handleCommentClick),
    [commentCounts, handleCommentClick]
  );

  const showEmptyState = !isFetching && (!requisitions || requisitions.length === 0);

  return (
    <div className="flex flex-col min-h-0 max-h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 gap-4 flex-shrink-0">
        <SearchField
          placeholder="Search requisitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-2xl"
          data-tour="positions-search"
        />
        
        <div className="flex gap-2 flex-shrink-0">
          <span data-tour="positions-refresh">
            <DataRefreshButton dataSources={['positions_data']} />
          </span>
          
          <Button
            variant="ascension"
            size="icon"
            onClick={() => setFilterOpen(true)}
            className="relative"
            aria-label="Filters"
            title="Filters"
            data-tour="positions-filter-btn"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {isFetching ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <LogoLoader size="lg" />
        </div>
      ) : showEmptyState ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-muted/20 rounded-xl border border-border/50">
          <p className="text-muted-foreground">No open requisitions found matching the filters.</p>
        </div>
      ) : (
        <div data-tour="positions-table" className="min-h-0 max-h-full flex flex-col">
          <EditableTable
            columns={columnsWithComments}
            data={filteredAndSortedRequisitions}
            getRowId={(row) => row.id}
            sortField={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={handleRowClick}
            storeNamespace="requisitions-columns-v2"
            className="min-h-0 max-h-full"
          />
        </div>
      )}

      <RequisitionDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        requisition={selectedRequisition}
        defaultTab={sheetDefaultTab}
      />

      <RequisitionsFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
