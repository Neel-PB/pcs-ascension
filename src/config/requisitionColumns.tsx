import { ColumnDef } from "@/types/table";
import { Position } from "@/types/position";
import { BadgeCell } from "@/components/editable-table/cells/BadgeCell";
import { CommentIndicatorCell } from "@/components/editable-table/cells/CommentIndicatorCell";

import { TruncatedTextCell } from "@/components/editable-table/cells/TruncatedTextCell";
import { differenceInDays } from "date-fns";
import { MessageSquare } from "@/lib/icons";

// Helper to calculate vacancy age
const getVacancyAge = (statusDate: string | null) => {
  if (!statusDate) return null;
  return differenceInDays(new Date(), new Date(statusDate));
};

// Helper to get vacancy badge
const getVacancyBadge = (days: number | null) => {
  if (!days) return { variant: "secondary" as const, label: "—", className: "" };
  if (days > 60)
    return {
      variant: "outline" as const,
      label: `${days}d - Urgent`,
      className: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400",
    };
  if (days > 30)
    return {
      variant: "outline" as const,
      label: `${days}d - Attention`,
      className: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    };
  return {
    variant: "outline" as const,
    label: `${days}d - On Track`,
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  };
};

export const requisitionColumns: ColumnDef<Position>[] = [
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
    id: "skillMix",
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
    id: "vacancyAge",
    label: "Vacancy Age",
    type: "custom",
    width: 160,
    minWidth: 140,
    maxWidth: 160,
    sortable: true,
    resizable: false,
    draggable: true,
    getValue: (row) => getVacancyAge(row.positionStatusDate),
    renderCell: (row) => {
      const days = getVacancyAge(row.positionStatusDate);
      const badge = getVacancyBadge(days);
      return <BadgeCell value={badge.label} variant={badge.variant} className={badge.className} maxLength={30} />;
    },
    sortFn: (a, b) => {
      const aDays = getVacancyAge(a.positionStatusDate) ?? 0;
      const bDays = getVacancyAge(b.positionStatusDate) ?? 0;
      return aDays - bDays;
    },
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
    id: "shift",
    label: "Shift",
    type: "custom",
    width: 160,
    minWidth: 140,
    maxWidth: 160,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => <TruncatedTextCell value={row.shift} maxLength={30} />,
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
export const createRequisitionColumnsWithComments = (
  commentCounts: Map<string, number>,
  onRowClick: (row: Position) => void,
): ColumnDef<Position>[] => {
  return [
    ...requisitionColumns,
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
