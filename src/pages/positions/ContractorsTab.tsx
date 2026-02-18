import { useState, useMemo, useCallback } from "react";
import { Filter } from "@/lib/icons";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { useContractors } from "@/hooks/useContractors";
import { useCheckExpiredFte } from "@/hooks/useCheckExpiredFte";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { SearchField } from "@/components/ui/search-field";
import { ContractorDetailsSheet } from "@/components/workforce/ContractorDetailsSheet";
import { ContractorsFilterSheet } from "@/components/positions/ContractorsFilterSheet";
import { EditableTable } from "@/components/editable-table/EditableTable";

import { contractorColumns, createContractorColumnsWithComments } from "@/config/contractorColumns";
import { useUpdateActualFte } from "@/hooks/useUpdateActualFte";
import { useUpdateShiftOverride } from "@/hooks/useUpdateShiftOverride";
import { EditableFTECell, FilterDataProvider } from "@/components/editable-table/cells/EditableFTECell";
import { usePositionCommentCounts } from "@/hooks/usePositionCommentCounts";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useFilterData } from "@/hooks/useFilterData";

interface ContractorsTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
}

export function ContractorsTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedPstat,
  selectedLevel2,
  selectedDepartment,
}: ContractorsTabProps) {
  // Check for expired Active FTE overrides once per session
  useCheckExpiredFte();

  const { data: contractors, isFetching } = useContractors({
    selectedRegion,
    selectedMarket,
    selectedFacility,
    selectedDepartment,
  });

  const updateActualFte = useUpdateActualFte();
  const updateShiftOverride = useUpdateShiftOverride();
  
  // Lift filter data to parent - passed to EditableFTECell via props instead of per-cell hook
  const { markets, getFacilitiesByMarket, getDepartmentsByFacility } = useFilterData();
  const filterDataProvider: FilterDataProvider = useMemo(() => ({
    markets,
    getFacilitiesByMarket,
    getDepartmentsByFacility,
  }), [markets, getFacilitiesByMarket, getDepartmentsByFacility]);
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDefaultTab, setSheetDefaultTab] = useState<"details" | "comments">("details");
  const [filterOpen, setFilterOpen] = useState(false);
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch(300);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    employmentType: "all",
    skillType: "",
    shift: "all",
    fteMin: "",
    fteMax: "",
  });

  const handleRowClick = useCallback((contractor: any) => {
    setSelectedContractor(contractor);
    setSheetDefaultTab("details");
    setSheetOpen(true);
  }, []);

  const handleCommentClick = useCallback((contractor: any) => {
    setSelectedContractor(contractor);
    setSheetDefaultTab("comments");
    setSheetOpen(true);
  }, []);

  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  const clearFilters = () => {
    setFilters({
      employmentType: "all",
      skillType: "",
      shift: "all",
      fteMin: "",
      fteMax: "",
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.employmentType !== "all") count++;
    if (filters.skillType) count++;
    if (filters.shift !== "all") count++;
    if (filters.fteMin) count++;
    if (filters.fteMax) count++;
    return count;
  }, [filters]);

  const handleActualFteUpdate = useCallback((
    id: string, 
    previousFte: number | null, 
    previousExpiry: string | null,
    previousStatus: string | null,
    data: {
      actual_fte: number | null;
      actual_fte_expiry: string | null;
      actual_fte_status: string | null;
      actual_fte_shared_with?: string | null;
      actual_fte_shared_fte?: number | null;
      actual_fte_shared_expiry?: string | null;
      comment?: string;
    }
  ) => {
    updateActualFte.mutate({ id, ...data, previousFte, previousExpiry, previousStatus });
  }, [updateActualFte]);

  const handleShiftOverrideUpdate = useCallback((id: string, originalShift: string | null, value: string | null) => {
    updateShiftOverride.mutate({ id, shift_override: value, originalShift });
  }, [updateShiftOverride]);

  const filteredAndSortedContractors = useMemo(() => {
    if (!contractors) return [];

    let filtered = [...contractors];

    // Apply debounced search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((c) => {
        const searchFields = [
          c.employeeName,
          c.positionNum,
          c.jobTitle,
          c.jobFamily,
          c.departmentName,
          c.employmentType,
          c.shift,
        ];
        return searchFields.some((field) => 
          field?.toString().toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    if (filters.employmentType !== "all") {
      filtered = filtered.filter((c) => c.employmentType === filters.employmentType);
    }
    if (filters.skillType) {
      filtered = filtered.filter((c) => 
        c.jobFamily?.toLowerCase().includes(filters.skillType.toLowerCase())
      );
    }
    if (filters.shift !== "all") {
      filtered = filtered.filter((c) => c.shift === filters.shift);
    }
    if (filters.fteMin) {
      const minFte = parseFloat(filters.fteMin);
      filtered = filtered.filter((c) => {
        const fte = typeof c.FTE === 'string' ? parseFloat(c.FTE) : (c.FTE || 0);
        return fte >= minFte;
      });
    }
    if (filters.fteMax) {
      const maxFte = parseFloat(filters.fteMax);
      filtered = filtered.filter((c) => {
        const fte = typeof c.FTE === 'string' ? parseFloat(c.FTE) : (c.FTE || 0);
        return fte <= maxFte;
      });
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Handle numeric values
        if (sortColumn === "FTE") {
          aVal = parseFloat(aVal || "0");
          bVal = parseFloat(bVal || "0");
        }

        // Handle null/undefined
        if (!aVal) return 1;
        if (!bVal) return -1;

        if (typeof aVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return filtered;
  }, [contractors, debouncedSearch, filters, sortColumn, sortDirection]);

  // Extract position IDs for comment count fetching
  const positionIds = useMemo(() => 
    filteredAndSortedContractors.map(c => c.id), 
    [filteredAndSortedContractors]
  );

  // Fetch comment counts
  const commentCounts = usePositionCommentCounts(positionIds);

  const firstRowId = filteredAndSortedContractors[0]?.id;

  const columnsWithHandlers = useMemo(() => {
    const baseColumns = createContractorColumnsWithComments(
      commentCounts, 
      handleCommentClick,
      handleShiftOverrideUpdate
    );
    return baseColumns.map(col => {
      if (col.id === 'actual_fte') {
        return {
          ...col,
          renderCell: (row: any) => {
            const cell = (
              <EditableFTECell
                value={row.actual_fte}
                originalValue={row.FTE}
                expiryDate={row.actual_fte_expiry}
                status={row.actual_fte_status}
                employmentType={row.employmentType}
                sharedWith={row.actual_fte_shared_with}
                sharedFte={row.actual_fte_shared_fte}
                sharedExpiry={row.actual_fte_shared_expiry}
                onSave={(data) => handleActualFteUpdate(
                  row.id, 
                  row.actual_fte, 
                  row.actual_fte_expiry,
                  row.actual_fte_status,
                  data
                )}
                filterDataProvider={filterDataProvider}
              />
            );
            return row.id === firstRowId ? <div data-tour="positions-active-fte-cell" className="w-full h-full">{cell}</div> : cell;
          },
        };
      }
      if (col.id === 'shift') {
        const originalRenderCell = col.renderCell;
        return {
          ...col,
          renderCell: (row: any, colDef: any) => {
            const cell = originalRenderCell ? originalRenderCell(row, colDef) : null;
            return row.id === firstRowId ? <div data-tour="positions-shift-cell" className="w-full h-full">{cell}</div> : cell;
          },
        };
      }
      return col;
    });
  }, [commentCounts, handleCommentClick, handleActualFteUpdate, handleShiftOverrideUpdate, filterDataProvider, firstRowId]);

  const showEmptyState = !isFetching && (!contractors || contractors.length === 0);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex justify-between items-center mb-4 gap-4 flex-shrink-0" data-tour="positions-search-bar">
        <SearchField
          placeholder="Search contractors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-2xl"
        />
        
        <div className="flex gap-2 flex-shrink-0">
          <DataRefreshButton dataSources={['positions_data']} />
          
          <Button
            variant="ascension"
            size="icon"
            onClick={() => setFilterOpen(true)}
            className="relative"
            aria-label="Filters"
            title="Filters"
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
          <p className="text-muted-foreground">No contractors found matching the filters.</p>
        </div>
      ) : (
        <div data-tour="positions-table" className="flex-1 min-h-0 flex flex-col">
          <EditableTable
            columns={columnsWithHandlers}
            data={filteredAndSortedContractors}
            getRowId={(row) => row.id}
            sortField={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={handleRowClick}
            storeNamespace="contractors-columns-v2"
            className="flex-1 min-h-0"
          />
        </div>
      )}

      <ContractorDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        contractor={selectedContractor}
        defaultTab={sheetDefaultTab}
      />

      <ContractorsFilterSheet
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
