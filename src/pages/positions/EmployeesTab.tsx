import { useState, useMemo, useCallback } from "react";
import { Filter } from "@/lib/icons";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { usePositionsByFlag } from "@/hooks/usePositionsByFlag";
import { useCheckExpiredFte } from "@/hooks/useCheckExpiredFte";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { SearchField } from "@/components/ui/search-field";
import { EmployeeDetailsSheet } from "@/components/workforce/EmployeeDetailsSheet";
import { PositionsFilterSheet, PositionsFilterValues, DEFAULT_POSITION_FILTERS, getActiveFilterCount, applyPositionFilters } from "@/components/positions/PositionsFilterSheet";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { PositionKPICards } from "@/components/positions/PositionKPICards";

import { employeeColumns, createEmployeeColumnsWithComments } from "@/config/employeeColumns";
import { useUpdateActualFte } from "@/hooks/useUpdateActualFte";
import { useUpdateShiftOverride } from "@/hooks/useUpdateShiftOverride";
import { EditableFTECell, FilterDataProvider } from "@/components/editable-table/cells/EditableFTECell";
import { usePositionCommentCounts } from "@/hooks/usePositionCommentCounts";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useFilterData } from "@/hooks/useFilterData";
import { useAuthContext } from "@/contexts/AuthContext";

interface EmployeesTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
}

export function EmployeesTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedPstat,
  selectedLevel2,
  selectedDepartment,
}: EmployeesTabProps) {
  const { user, msalUser } = useAuthContext();
  const currentUserId = user?.id || msalUser?.id;
  useCheckExpiredFte();

  const { data: employees, isFetching } = usePositionsByFlag('employee_flag', {
    selectedRegion, selectedMarket, selectedFacility, selectedDepartment,
  });

  const updateActualFte = useUpdateActualFte();
  const updateShiftOverride = useUpdateShiftOverride();
  
  const { markets, getFacilitiesByMarket, getDepartmentsByFacility } = useFilterData();
  const filterDataProvider: FilterDataProvider = useMemo(() => ({
    markets, getFacilitiesByMarket, getDepartmentsByFacility,
  }), [markets, getFacilitiesByMarket, getDepartmentsByFacility]);

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDefaultTab, setSheetDefaultTab] = useState<"details" | "comments">("details");
  const [filterOpen, setFilterOpen] = useState(false);
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch(300);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<PositionsFilterValues>({ ...DEFAULT_POSITION_FILTERS });

  const skillMixOptions = useMemo(() => [...new Set((employees || []).map(e => (e as any).skillMix ?? (e as any).skill_mix).filter(Boolean))].sort() as string[], [employees]);
  const employeeTypeOptions = useMemo(() => [...new Set((employees || []).map(e => e.employeeType).filter(Boolean))].sort() as string[], [employees]);
  const lifecycleOptions = useMemo(() => [...new Set((employees || []).map(e => (e as any).positionLifecycle).filter(Boolean))].sort() as string[], [employees]);

  const activeFilterCount = useMemo(() => getActiveFilterCount(filters, true, true), [filters]);

  const handleRowClick = useCallback((employee: any) => {
    setSelectedEmployee(employee); setSheetDefaultTab("details"); setSheetOpen(true);
  }, []);

  const handleCommentClick = useCallback((employee: any) => {
    setSelectedEmployee(employee); setSheetDefaultTab("comments"); setSheetOpen(true);
  }, []);

  const handleSort = (columnId: string, direction: "asc" | "desc") => { setSortColumn(columnId); setSortDirection(direction); };
  const clearFilters = () => setFilters({ ...DEFAULT_POSITION_FILTERS });

  const handleActualFteUpdate = useCallback((
    id: string, previousFte: number | null, previousExpiry: string | null, previousStatus: string | null,
    data: { actual_fte: number | null; actual_fte_expiry: string | null; actual_fte_status: string | null; actual_fte_shared_with?: string | null; actual_fte_shared_fte?: number | null; actual_fte_shared_expiry?: string | null; comment?: string; },
    overrideId?: string | null,
  ) => {
    updateActualFte.mutate({ id, overrideId, ...data, previousFte, previousExpiry, previousStatus, updatedBy: currentUserId });
  }, [updateActualFte, currentUserId]);

  const handleShiftOverrideUpdate = useCallback((id: string, originalShift: string | null, value: string | null, overrideId?: string | null, previousOverride?: string | null) => {
    updateShiftOverride.mutate({ id, overrideId, shift_override: value, originalShift, previousOverride, updatedBy: currentUserId });
  }, [updateShiftOverride, currentUserId]);

  const filteredAndSortedEmployees = useMemo(() => {
    if (!employees) return [];
    let filtered = [...employees];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((e) => {
        const searchFields = [e.employeeName, e.positionNum, e.jobTitle, e.jobFamily, e.departmentName, e.employmentType, e.shift];
        return searchFields.some((field) => field?.toString().toLowerCase().includes(query));
      });
    }

    filtered = applyPositionFilters(filtered, filters, true);

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn]; let bVal = b[sortColumn];
        if (sortColumn === "FTE") { aVal = parseFloat(aVal || "0"); bVal = parseFloat(bVal || "0"); }
        if (!aVal) return 1; if (!bVal) return -1;
        if (typeof aVal === "string") return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return filtered;
  }, [employees, debouncedSearch, filters, sortColumn, sortDirection]);

  const positionIds = useMemo(() => filteredAndSortedEmployees.map(e => e.id), [filteredAndSortedEmployees]);
  const commentCounts = usePositionCommentCounts(positionIds);

  const totals = useMemo(() => {
    if (!employees) return { totalCount: 0, totalHiredFTE: 0, totalActiveFTE: 0 };
    return {
      totalCount: employees.length,
      totalHiredFTE: employees.reduce((sum, e) => sum + (Number(e.FTE) || 0), 0),
      totalActiveFTE: employees.reduce((sum, e) => sum + (Number(e.actual_fte ?? e.FTE) || 0), 0),
    };
  }, [employees]);

  const firstRowId = filteredAndSortedEmployees[0]?.id;

  const columnsWithHandlers = useMemo(() => {
    const baseColumns = createEmployeeColumnsWithComments(commentCounts, handleCommentClick, handleShiftOverrideUpdate);
    return baseColumns.map(col => {
      if (col.id === 'actual_fte') {
        return {
          ...col,
          renderCell: (row: any) => {
            const cell = (
              <EditableFTECell
                value={row.actual_fte} originalValue={row.FTE} expiryDate={row.actual_fte_expiry}
                status={row.actual_fte_status} employmentType={row.employmentType}
                sharedWith={row.actual_fte_shared_with} sharedFte={row.actual_fte_shared_fte}
                sharedExpiry={row.actual_fte_shared_expiry}
                onSave={(data) => handleActualFteUpdate(row.id, row.actual_fte, row.actual_fte_expiry, row.actual_fte_status, data, row.overrideId)}
                filterDataProvider={filterDataProvider}
              />
            );
            return row.id === firstRowId ? <div data-tour="positions-active-fte-cell" className="w-full min-h-[48px] flex items-center">{cell}</div> : cell;
          },
        };
      }
      if (col.id === 'shift') {
        const originalRenderCell = col.renderCell;
        return {
          ...col,
          renderCell: (row: any, colDef: any) => {
            const cell = originalRenderCell ? originalRenderCell(row, colDef) : null;
            return row.id === firstRowId ? <div data-tour="positions-shift-cell" className="w-full min-h-[48px] flex items-center">{cell}</div> : cell;
          },
        };
      }
      return col;
    });
  }, [commentCounts, handleCommentClick, handleActualFteUpdate, handleShiftOverrideUpdate, filterDataProvider, firstRowId]);

  const showEmptyState = !isFetching && (!employees || employees.length === 0);

  return (
    <div className="flex flex-col gap-4 min-h-0 max-h-full overflow-hidden">
      <div className="flex items-center gap-4 flex-shrink-0">
        <SearchField placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[32rem]" data-tour="positions-search" />
        <div className="flex gap-2 items-center flex-shrink-0 ml-auto">
          <PositionKPICards items={[
            { label: "Employees", value: totals.totalCount },
            { label: "Hired FTE", value: totals.totalHiredFTE },
            { label: "Active FTE", value: totals.totalActiveFTE },
          ]} />
          <span data-tour="positions-refresh"><DataRefreshButton dataSources={['positions_data']} /></span>
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
          <p className="text-muted-foreground">No employees found matching the filters.</p>
        </div>
      ) : (
        <div data-tour="positions-table" className="min-h-0 max-h-full flex flex-col">
          <EditableTable columns={columnsWithHandlers} data={filteredAndSortedEmployees} getRowId={(row) => row.id} sortField={sortColumn} sortDirection={sortDirection} onSort={handleSort} onRowClick={handleRowClick} storeNamespace="employees-columns-v3" className="min-h-0 max-h-full" />
        </div>
      )}

      <EmployeeDetailsSheet open={sheetOpen} onOpenChange={setSheetOpen} employee={selectedEmployee} defaultTab={sheetDefaultTab} />
      <PositionsFilterSheet open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} activeFilterCount={activeFilterCount} showStatus skillMixOptions={skillMixOptions} employeeTypeOptions={employeeTypeOptions} title="Filter Employees" />
    </div>
  );
}
