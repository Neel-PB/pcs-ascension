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

interface RequisitionRow {
  id: string;
  requisitionNum: string;
  jobTitle: string;
  shift: string | null;
  employmentType: string;
  status: string;
}

const dummyData: RequisitionRow[] = [
  { id: "req-1", requisitionNum: "REQ-2025-001", jobTitle: "Registered Nurse", shift: "Day", employmentType: "Full Time", status: "Posted" },
  { id: "req-2", requisitionNum: "REQ-2025-002", jobTitle: "Clinical Lab Technician", shift: "Night", employmentType: "Full Time", status: "Screening" },
  { id: "req-3", requisitionNum: "REQ-2025-003", jobTitle: "Respiratory Therapist", shift: "Day", employmentType: "Part Time", status: "Interview" },
  { id: "req-4", requisitionNum: "REQ-2025-004", jobTitle: "Patient Care Technician", shift: "Night", employmentType: "Full Time", status: "Offer Extended" },
  { id: "req-5", requisitionNum: "REQ-2025-005", jobTitle: "Pharmacy Technician", shift: "Day", employmentType: "Full Time", status: "Posted" },
];

const columns: ColumnDef<RequisitionRow>[] = [
  { id: "requisitionNum", label: "Requisition #", type: "text", width: 180, minWidth: 160, sortable: true, resizable: false, draggable: true, locked: true },
  { id: "jobTitle", label: "Job Title", type: "custom", width: 260, minWidth: 200, sortable: true, resizable: false, draggable: true, renderCell: (row) => <TruncatedTextCell value={row.jobTitle} maxLength={30} /> },
  { id: "shift", label: "Shift", type: "custom", width: 180, minWidth: 160, sortable: true, resizable: false, draggable: true, renderCell: (row) => <ShiftCell value={row.shift} /> },
  { id: "employmentType", label: "Employment Type", type: "custom", width: 180, minWidth: 170, sortable: true, resizable: false, draggable: true, renderCell: (row) => <TruncatedTextCell value={row.employmentType} maxLength={30} /> },
  { id: "status", label: "Status", type: "custom", width: 160, minWidth: 140, sortable: true, resizable: false, draggable: true, renderCell: (row) => <BadgeCell value={row.status} variant={row.status === "Offer Extended" ? "default" : "secondary"} maxLength={30} /> },
];

interface OpenRequisitionTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
}

export function OpenRequisitionTab(_props: OpenRequisitionTabProps) {
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch(300);

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return dummyData;
    const q = debouncedSearch.toLowerCase();
    return dummyData.filter(r => [r.requisitionNum, r.jobTitle, r.shift, r.employmentType, r.status].some(f => f?.toLowerCase().includes(q)));
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-4 min-h-0 max-h-full overflow-hidden">
      <div className="flex items-center gap-4 flex-shrink-0">
        <SearchField placeholder="Search requisitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[32rem]" />
        <PositionKPICards items={[{ label: "Open Requisitions", value: filteredData.length }]} />
        <div className="flex gap-2 flex-shrink-0 ml-auto">
          <DataRefreshButton dataSources={['positions_data']} />
          <Button variant="ascension" size="icon" aria-label="Filters" title="Filters">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 max-h-full flex flex-col">
        <EditableTable data={filteredData} columns={columns} getRowId={(row) => row.id} storeNamespace="open-requisitions" className="min-h-0 max-h-full" />
      </div>
    </div>
  );
}
