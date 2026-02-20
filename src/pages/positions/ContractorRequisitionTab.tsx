import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnDef } from "@/types/table";
import { BadgeCell } from "@/components/editable-table/cells/BadgeCell";
import { TruncatedTextCell } from "@/components/editable-table/cells/TruncatedTextCell";
import { ShiftCell } from "@/components/editable-table/cells/ShiftCell";

interface ContractorReqRow {
  id: string;
  requisitionNum: string;
  jobTitle: string;
  shift: string | null;
  employmentType: string;
  status: string;
}

const dummyData: ContractorReqRow[] = [
  { id: "creq-1", requisitionNum: "CREQ-2025-001", jobTitle: "Travel Nurse - ICU", shift: "Night", employmentType: "Contract", status: "Posted" },
  { id: "creq-2", requisitionNum: "CREQ-2025-002", jobTitle: "Agency PCT", shift: "Day", employmentType: "Contract", status: "Screening" },
  { id: "creq-3", requisitionNum: "CREQ-2025-003", jobTitle: "Locum Pharmacist", shift: "Day", employmentType: "Contract", status: "Interview" },
  { id: "creq-4", requisitionNum: "CREQ-2025-004", jobTitle: "Travel Nurse - Med/Surg", shift: "Night", employmentType: "Contract", status: "Offer Extended" },
  { id: "creq-5", requisitionNum: "CREQ-2025-005", jobTitle: "Agency Respiratory Therapist", shift: "Day", employmentType: "Contract", status: "Posted" },
];

const columns: ColumnDef<ContractorReqRow>[] = [
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
    width: 280,
    minWidth: 220,
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

interface ContractorRequisitionTabProps {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
}

export function ContractorRequisitionTab(_props: ContractorRequisitionTabProps) {
  return (
    <div className="min-h-0 max-h-full overflow-hidden">
      <EditableTable
        data={dummyData}
        columns={columns}
        getRowId={(row) => row.id}
        storeNamespace="contractor-requisitions"
      />
    </div>
  );
}
