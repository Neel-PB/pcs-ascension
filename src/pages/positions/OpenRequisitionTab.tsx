import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnDef } from "@/types/table";
import { BadgeCell } from "@/components/editable-table/cells/BadgeCell";
import { TruncatedTextCell } from "@/components/editable-table/cells/TruncatedTextCell";
import { ShiftCell } from "@/components/editable-table/cells/ShiftCell";

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
  {
    id: "requisitionNum",
    label: "Requisition #",
    type: "text",
    width: 180,
    minWidth: 160,
    sortable: true,
    resizable: false,
    draggable: true,
    locked: true,
  },
  {
    id: "jobTitle",
    label: "Job Title",
    type: "custom",
    width: 260,
    minWidth: 200,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => <TruncatedTextCell value={row.jobTitle} maxLength={30} />,
  },
  {
    id: "shift",
    label: "Shift",
    type: "custom",
    width: 180,
    minWidth: 160,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => <ShiftCell value={row.shift} />,
  },
  {
    id: "employmentType",
    label: "Employment Type",
    type: "custom",
    width: 180,
    minWidth: 170,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => <TruncatedTextCell value={row.employmentType} maxLength={30} />,
  },
  {
    id: "status",
    label: "Status",
    type: "custom",
    width: 160,
    minWidth: 140,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => {
      const variant = row.status === "Offer Extended" ? "default" : "secondary";
      return <BadgeCell value={row.status} variant={variant} maxLength={30} />;
    },
  },
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
  return (
    <EditableTable
      data={dummyData}
      columns={columns}
      getRowId={(row) => row.id}
      storeNamespace="open-requisitions"
    />
  );
}
