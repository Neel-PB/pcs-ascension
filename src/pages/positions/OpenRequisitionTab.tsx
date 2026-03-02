import { useState, useMemo } from "react";
import { Filter } from "@/lib/icons";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnDef } from "@/types/table";
import { BadgeCell } from "@/components/editable-table/cells/BadgeCell";
import { TruncatedTextCell } from "@/components/editable-table/cells/TruncatedTextCell";
import { ShiftCell } from "@/components/editable-table/cells/ShiftCell";
import { SearchField } from "@/components/ui/search-field";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { Button } from "@/components/ui/button";
import { PositionKPICards } from "@/components/positions/PositionKPICards";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePositionsByFlag } from "@/hooks/usePositionsByFlag";
import { LogoLoader } from "@/components/ui/LogoLoader";

const columns: ColumnDef<any>[] = [
  { id: "requisitionNum", label: "Requisition #", type: "text", width: 180, minWidth: 160, sortable: true, resizable: false, draggable: true, locked: true },
  { id: "jobTitle", label: "Job Title", type: "custom", width: 260, minWidth: 200, sortable: true, resizable: false, draggable: true, renderCell: (row) => <TruncatedTextCell value={row.jobTitle} maxLength={30} /> },
  { id: "shift", label: "Shift", type: "custom", width: 180, minWidth: 160, sortable: true, resizable: false, draggable: true, renderCell: (row) => <ShiftCell value={row.shift} /> },
  { id: "employmentType", label: "Employment Type", type: "custom", width: 180, minWidth: 170, sortable: true, resizable: false, draggable: true, renderCell: (row) => <TruncatedTextCell value={row.employmentType} maxLength={30} /> },
  { id: "status", label: "Status", type: "custom", width: 160, minWidth: 140, sortable: true, resizable: false, draggable: true, renderCell: (row) => <BadgeCell value={row.positionLifecycle || row.status} variant={row.positionLifecycle === "Offer Extended" ? "default" : "secondary"} maxLength={30} /> },
];

interface OpenRequisitionTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
}

export function OpenRequisitionTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: OpenRequisitionTabProps) {
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch(300);

  const { data: requisitions, isFetching } = usePositionsByFlag('open_requisition_flag', {
    selectedRegion, selectedMarket, selectedFacility, selectedDepartment,
  });

  const filteredData = useMemo(() => {
    if (!requisitions) return [];
    if (!debouncedSearch) return requisitions;
    const q = debouncedSearch.toLowerCase();
    return requisitions.filter((r: any) => [r.requisitionNum, r.positionNum, r.jobTitle, r.shift, r.employmentType, r.positionLifecycle].some(f => f?.toLowerCase().includes(q)));
  }, [requisitions, debouncedSearch]);

  const showEmptyState = !isFetching && (!requisitions || requisitions.length === 0);

  return (
    <div className="flex flex-col gap-4 min-h-0 max-h-full overflow-hidden">
      <div className="flex items-center gap-4 flex-shrink-0">
        <SearchField placeholder="Search requisitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[32rem]" />
        <div className="flex gap-2 items-center flex-shrink-0 ml-auto">
          <PositionKPICards items={[{ label: "Open Requisitions", value: filteredData.length }]} />
          <DataRefreshButton dataSources={['positions_data']} />
          <Button variant="ascension" size="icon" aria-label="Filters" title="Filters">
            <Filter className="h-4 w-4" />
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
          <EditableTable data={filteredData} columns={columns} getRowId={(row) => row.id} storeNamespace="open-requisitions" className="min-h-0 max-h-full" />
        </div>
      )}
    </div>
  );
}
