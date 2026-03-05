import { useState, useMemo } from "react";
import { Filter } from "@/lib/icons";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { SearchField } from "@/components/ui/search-field";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PositionKPICards } from "@/components/positions/PositionKPICards";
import { PositionsFilterSheet, PositionsFilterValues, DEFAULT_POSITION_FILTERS, getActiveFilterCount, applyPositionFilters } from "@/components/positions/PositionsFilterSheet";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePositionsByFlag } from "@/hooks/usePositionsByFlag";
import { useUpdateShiftOverride } from "@/hooks/useUpdateShiftOverride";
import { usePositionCommentCounts } from "@/hooks/usePositionCommentCounts";
import { createRequisitionColumnsWithComments } from "@/config/requisitionColumns";
import { RequisitionDetailsSheet } from "@/components/workforce/RequisitionDetailsSheet";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { ShiftCell } from "@/components/editable-table/cells/ShiftCell";
import { Position } from "@/types/position";

interface OpenRequisitionTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
}

export function OpenRequisitionTab({
  selectedRegion, selectedMarket, selectedFacility, selectedDepartment,
}: OpenRequisitionTabProps) {
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch(300);
  const { mutate: updateShiftOverride } = useUpdateShiftOverride();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<PositionsFilterValues>({ ...DEFAULT_POSITION_FILTERS });
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const { data: requisitions, isFetching } = usePositionsByFlag("open_requisition_flag", {
    selectedRegion, selectedMarket, selectedFacility, selectedDepartment,
  });

  const positionIds = useMemo(() => (requisitions || []).map(r => r.id), [requisitions]);
  const commentCounts = usePositionCommentCounts(positionIds);

  const skillMixOptions = useMemo(() => [...new Set((requisitions || []).map(r => (r as any).skillMix ?? (r as any).skill_mix).filter(Boolean))].sort() as string[], [requisitions]);
  const employeeTypeOptions = useMemo(() => [...new Set((requisitions || []).map(r => r.employeeType).filter(Boolean))].sort() as string[], [requisitions]);
  const activeFilterCount = useMemo(() => getActiveFilterCount(filters, false), [filters]);
  const clearFilters = () => setFilters({ ...DEFAULT_POSITION_FILTERS });

  const handleShiftOverride = (positionId: string, originalShift: string | null, value: string | null, overrideId?: string | null) => {
    updateShiftOverride({ id: positionId, overrideId, shift_override: value, originalShift });
  };

  const handleRowClick = (row: Position) => {
    setSelectedPosition(row);
  };

  const columns = useMemo(() => {
    const baseCols = createRequisitionColumnsWithComments(commentCounts, handleRowClick);
    // Override shift column to be editable
    return baseCols.map(col => {
      if (col.id === "shift") {
        return {
          ...col,
          editable: true,
          renderCell: (row: Position) => (
            <ShiftCell
              value={row.shift}
              selectedDayNight={row.shift_override}
              onSave={(val) => handleShiftOverride(row.id, row.shift, val, row.overrideId)}
            />
          ),
        };
      }
      return col;
    });
  }, [commentCounts]);

  const filteredData = useMemo(() => {
    if (!requisitions) return [];
    let filtered = [...requisitions];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter((r: any) =>
        [r.positionNum, r.jobTitle, r.jobFamily, r.shift, r.employmentType].some((f) => f?.toLowerCase().includes(q)),
      );
    }
    filtered = applyPositionFilters(filtered, filters, false);
    return filtered;
  }, [requisitions, debouncedSearch, filters]);

  const showEmptyState = !isFetching && (!requisitions || requisitions.length === 0);

  return (
    <div className="flex flex-col gap-4 min-h-0 max-h-full overflow-hidden">
      <div className="flex items-center gap-4 flex-shrink-0">
        <SearchField placeholder="Search requisitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[32rem]" />
        <div className="flex gap-2 items-center flex-shrink-0 ml-auto">
          <PositionKPICards items={[{ label: "Open Requisitions", value: filteredData.length }]} />
          <DataRefreshButton dataSources={["positions_data"]} />
          <Button variant="ascension" size="icon" onClick={() => setFilterOpen(true)} className="relative" aria-label="Filters" title="Filters">
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
          <p className="text-muted-foreground">No open requisitions found.</p>
        </div>
      ) : (
        <div className="min-h-0 max-h-full flex flex-col">
          <EditableTable data={filteredData} columns={columns} getRowId={(row) => row.id} onRowClick={handleRowClick} storeNamespace="open-requisitions" className="min-h-0 max-h-full" />
        </div>
      )}

      <PositionsFilterSheet open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} activeFilterCount={activeFilterCount} skillMixOptions={skillMixOptions} employeeTypeOptions={employeeTypeOptions} title="Filter Open Requisitions" />

      {selectedPosition && (
        <RequisitionDetailsSheet
          requisition={selectedPosition}
          open={!!selectedPosition}
          onOpenChange={(open) => { if (!open) setSelectedPosition(null); }}
        />
      )}
    </div>
  );
}
