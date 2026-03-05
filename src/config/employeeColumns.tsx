import { ColumnDef } from "@/types/table";
import { Position } from "@/types/position";
import { BadgeCell } from "@/components/editable-table/cells/BadgeCell";
import { CommentIndicatorCell } from "@/components/editable-table/cells/CommentIndicatorCell";
import { ShiftCell } from "@/components/editable-table/cells/ShiftCell";
import { TruncatedTextCell } from "@/components/editable-table/cells/TruncatedTextCell";
import { MessageSquare } from "@/lib/icons";

// Type for the shift override handler
type ShiftOverrideHandler = (positionId: string, originalShift: string | null, value: string | null) => void;

export const employeeColumns: ColumnDef<Position>[] = [
  {
    id: "positionNum",
    label: "Position No",
    type: "text",
    width: 150,
    minWidth: 130,
    maxWidth: 150,
    sortable: true,
    resizable: false,
    draggable: true,
    locked: true,
  },
  {
    id: "employeeName",
    label: "Employee Name",
    type: "custom",
    width: 240,
    minWidth: 180,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => <TruncatedTextCell value={row.employeeName} maxLength={30} />,
  },
  {
    id: "jobTitle",
    label: "Job Title",
    type: "custom",
    width: 240,
    minWidth: 180,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => <TruncatedTextCell value={row.jobTitle} maxLength={30} />,
  },
  {
    id: "SkillMix",
    label: "Skill Mix",
    type: "custom",
    width: 120,
    minWidth: 100,
    maxWidth: 120,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => <TruncatedTextCell value={(row as any).skillMix} maxLength={30} />,
  },
  {
    id: "FTE",
    label: "Hired FTE",
    type: "number",
    width: 130,
    minWidth: 110,
    maxWidth: 130,
    sortable: true,
    resizable: false,
    draggable: true,
  },
  {
    id: "actual_fte",
    label: "Active FTE",
    type: "custom",
    width: 130,
    minWidth: 110,
    maxWidth: 130,
    sortable: true,
    resizable: false,
    draggable: true,
    renderHeader: () => <span data-tour="positions-active-fte">Active FTE</span>,
  },
  {
    id: "shift",
    label: "Shift",
    type: "custom",
    width: 160,
    minWidth: 140,
    maxWidth: 160,
    sortable: true,
    resizable: false,
    draggable: true,
    renderHeader: () => <span data-tour="positions-shift">Shift</span>,
    renderCell: (row) => <ShiftCell value={row.shift} />,
  },
  {
    id: "payrollStatus",
    label: "Status",
    type: "badge",
    width: 140,
    minWidth: 100,
    maxWidth: 140,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => (
      <BadgeCell
        value={row.payrollStatus}
        variant={row.payrollStatus === "Active" ? "default" : "secondary"}
        maxLength={30}
      />
    ),
  },
  {
    id: "employmentType",
    label: "Staff Type",
    type: "custom",
    width: 130,
    minWidth: 110,
    maxWidth: 130,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => <TruncatedTextCell value={row.employmentType} maxLength={30} />,
  },
];

// Function to create columns with comment counts and handlers
export const createEmployeeColumnsWithComments = (
  commentCounts: Map<string, number>,
  onRowClick: (row: Position) => void,
  onUpdateShiftOverride?: ShiftOverrideHandler,
): ColumnDef<Position>[] => {
  const columnsWithEnhancements = employeeColumns.map((col) => {
    if (col.id === "shift") {
      return {
        ...col,
        renderCell: (row: Position) => (
          <ShiftCell
            value={row.shift}
            selectedDayNight={row.shift_override}
            onSave={(val) => onUpdateShiftOverride?.(row.id, row.shift, val)}
          />
        ),
      };
    }
    return col;
  });

  return [
    ...columnsWithEnhancements,
    {
      id: "comments",
      label: "Comments",
      type: "custom",
      width: 60,
      minWidth: 60,
      maxWidth: 60,
      sortable: false,
      resizable: false,
      draggable: true,
      renderHeader: () => (
        <span data-tour="positions-comments">
          <MessageSquare className="h-4 w-4" />
        </span>
      ),
      renderCell: (row) => (
        <CommentIndicatorCell count={commentCounts.get(row.id) ?? 0} onClick={() => onRowClick(row)} />
      ),
    },
  ];
};
