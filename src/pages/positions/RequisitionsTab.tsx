import { useState, useMemo, useCallback } from "react";
import { Filter } from "@/lib/icons";
import { differenceInDays } from "date-fns";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { usePositionsByFlag } from "@/hooks/usePositionsByFlag";
import { getLatestTimestamp } from "@/lib/getLatestTimestamp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { SearchField } from "@/components/ui/search-field";
import { RequisitionDetailsSheet } from "@/components/workforce/RequisitionDetailsSheet";
import { PositionsFilterSheet, PositionsFilterValues, DEFAULT_POSITION_FILTERS, getActiveFilterCount, applyPositionFilters } from "@/components/positions/PositionsFilterSheet";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { PositionKPICards } from "@/components/positions/PositionKPICards";

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
  selectedRegion, selectedMarket, selectedFacility, selectedPstat, selectedLevel2, selectedDepartment,
}: RequisitionsTabProps) {
  const { data: requisitions, isFetching } = usePositionsByFlag('open_position_flag', {
    selectedRegion, selectedMarket, selectedFacility, selectedDepartment,
  });

  const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDefaultTab, setSheetDefaultTab] = useState<"details" | "comments">("details");
  const [filterOpen, setFilterOpen] = useState(false);
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch(300);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<PositionsFilterValues>({ ...DEFAULT_POSITION_FILTERS });

  const skillMixOptions = useMemo(() => [...new Set((requisitions || []).map(r => (r as any).skillMix ?? (r as any).skill_mix).filter(Boolean))].sort() as string[], [requisitions]);
  const employeeTypeOptions = useMemo(() => [...new Set((requisitions || []).map(r => r.employeeType).filter(Boolean))].sort() as string[], [requisitions]);

  const activeFilterCount = useMemo(() => getActiveFilterCount(filters, false), [filters]);

  const handleRowClick = useCallback((requisition: any) => {
    setSelectedRequisition(requisition); setSheetDefaultTab("details"); setSheetOpen(true);
  }, []);

  const handleCommentClick = useCallback((requisition: any) => {
    setSelectedRequisition(requisition); setSheetDefaultTab("comments"); setSheetOpen(true);
  }, []);

  const getVacancyAge = (statusDate: string | null) => {
    if (!statusDate) return null;
    return differenceInDays(new Date(), new Date(statusDate));
  };

  const handleSort = (columnId: string, direction: "asc" | "desc") => { setSortColumn(columnId); setSortDirection(direction); };
  const clearFilters = () => setFilters({ ...DEFAULT_POSITION_FILTERS });

  const filteredAndSortedRequisitions = useMemo(() => {
    if (!requisitions) return [];
    let filtered = requisitions.map((req) => ({ ...req, vacancyAge: getVacancyAge(req.positionStatusDate) }));

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((r) => {
        const fields = [r.positionNum, r.jobTitle, r.jobFamily, r.departmentName, r.employmentType, r.shift];
        return fields.some((f) => f?.toString().toLowerCase().includes(query));
      });
    }

    filtered = applyPositionFilters(filtered, filters, false);

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn]; let bVal = b[sortColumn];
        if (sortColumn === "vacancyAge") { aVal = a.vacancyAge ?? 0; bVal = b.vacancyAge ?? 0; }
        if (!aVal && aVal !== 0) return 1; if (!bVal && bVal !== 0) return -1;
        if (typeof aVal === "string") return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return filtered;
  }, [requisitions, debouncedSearch, filters, sortColumn, sortDirection]);

  const positionIds = useMemo(() => filteredAndSortedRequisitions.map(r => r.id), [filteredAndSortedRequisitions]);
  const commentCounts = usePositionCommentCounts(positionIds);
  const totalCount = useMemo(() => filteredAndSortedRequisitions.length, [filteredAndSortedRequisitions]);

  const columnsWithComments = useMemo(() =>
    createRequisitionColumnsWithComments(commentCounts, handleCommentClick),
    [commentCounts, handleCommentClick]
  );

  const showEmptyState = !isFetching && (!requisitions || requisitions.length === 0);

  return (
    <div className="flex flex-col gap-4 min-h-0 max-h-full overflow-hidden">
      <div className="flex items-center gap-4 flex-shrink-0">
        <SearchField placeholder="Search requisitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[32rem]" data-tour="positions-search" />
        <div className="flex gap-2 items-center flex-shrink-0 ml-auto">
          <PositionKPICards items={[{ label: "Open Positions", value: totalCount }]} />
          <span data-tour="positions-refresh"><DataRefreshButton lastUpdated={latestTimestamp} /></span>
          <Button variant="ascension" size="icon" onClick={() => setFilterOpen(true)} className="relative" aria-label="Filters" title="Filters" data-tour="positions-filter-btn">
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>
      </div>

      {isFetching ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]"><LogoLoader size="lg" /></div>
      ) : showEmptyState ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-muted/20 rounded-xl border border-border/50">
          <p className="text-muted-foreground">No open requisitions found matching the filters.</p>
        </div>
      ) : (
        <div data-tour="positions-table" className="min-h-0 max-h-full flex flex-col">
          <EditableTable columns={columnsWithComments} data={filteredAndSortedRequisitions} getRowId={(row) => row.id} sortField={sortColumn} sortDirection={sortDirection} onSort={handleSort} onRowClick={handleRowClick} storeNamespace="requisitions-columns-v2" className="min-h-0 max-h-full" />
        </div>
      )}

      <RequisitionDetailsSheet open={sheetOpen} onOpenChange={setSheetOpen} requisition={selectedRequisition} defaultTab={sheetDefaultTab} />
      <PositionsFilterSheet open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} activeFilterCount={activeFilterCount} skillMixOptions={skillMixOptions} employeeTypeOptions={employeeTypeOptions} title="Filter Open Positions" />
    </div>
  );
}
