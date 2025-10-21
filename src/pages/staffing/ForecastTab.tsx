import { Card } from "@/components/ui/card";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnDef } from "@/types/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

// Mock data for positions to open
const positionsToOpen = [
  {
    id: "1",
    positionNum: "POS-2025-001",
    jobTitle: "Registered Nurse",
    department: "Emergency Department",
    facilityName: "Memorial Hospital",
    market: "Central",
    FTE: 1.0,
    targetStartDate: "2025-02-15",
    priority: "High",
    reason: "Vacancy - Retirement",
    budgetImpact: "$85,000",
  },
  {
    id: "2",
    positionNum: "POS-2025-002",
    jobTitle: "Clinical Lab Technician",
    department: "Laboratory",
    facilityName: "Memorial Hospital",
    market: "Central",
    FTE: 0.8,
    targetStartDate: "2025-03-01",
    priority: "Medium",
    reason: "Volume Growth",
    budgetImpact: "$52,000",
  },
  {
    id: "3",
    positionNum: "POS-2025-003",
    jobTitle: "Physical Therapist",
    department: "Rehabilitation",
    facilityName: "Valley Medical Center",
    market: "West",
    FTE: 1.0,
    targetStartDate: "2025-02-20",
    priority: "High",
    reason: "New Service Line",
    budgetImpact: "$78,000",
  },
];

// Mock data for positions to close
const positionsToClose = [
  {
    id: "4",
    positionNum: "POS-2020-145",
    jobTitle: "Administrative Assistant",
    department: "Finance",
    facilityName: "Memorial Hospital",
    market: "Central",
    FTE: 0.6,
    targetCloseDate: "2025-03-31",
    reason: "Automation Implementation",
    savings: "$42,000",
    status: "Pending Approval",
  },
  {
    id: "5",
    positionNum: "POS-2019-087",
    jobTitle: "Unit Clerk",
    department: "Medical-Surgical",
    facilityName: "Valley Medical Center",
    market: "West",
    FTE: 0.5,
    targetCloseDate: "2025-02-28",
    reason: "Restructure",
    savings: "$28,000",
    status: "Approved",
  },
];

// Column definitions for Positions to Open
const openPositionsColumns: ColumnDef[] = [
  {
    id: "positionNum",
    label: "Position #",
    type: "text",
    width: 140,
    minWidth: 120,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "jobTitle",
    label: "Job Title",
    type: "text",
    width: 200,
    minWidth: 150,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "department",
    label: "Department",
    type: "text",
    width: 180,
    minWidth: 130,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "facilityName",
    label: "Facility",
    type: "text",
    width: 180,
    minWidth: 130,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "market",
    label: "Market",
    type: "text",
    width: 120,
    minWidth: 100,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "FTE",
    label: "FTE",
    type: "number",
    width: 80,
    minWidth: 70,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "targetStartDate",
    label: "Target Start",
    type: "date",
    width: 130,
    minWidth: 120,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "priority",
    label: "Priority",
    type: "badge",
    width: 110,
    minWidth: 100,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
    renderCell: (data: any) => {
      const variant = data.priority === "High" ? "destructive" : data.priority === "Medium" ? "secondary" : "outline";
      return <Badge variant={variant}>{data.priority}</Badge>;
    },
  },
  {
    id: "reason",
    label: "Reason",
    type: "text",
    width: 170,
    minWidth: 140,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "budgetImpact",
    label: "Budget Impact",
    type: "text",
    width: 130,
    minWidth: 110,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
    className: "font-semibold text-green-600 dark:text-green-400",
  },
];

// Column definitions for Positions to Close
const closePositionsColumns: ColumnDef[] = [
  {
    id: "positionNum",
    label: "Position #",
    type: "text",
    width: 140,
    minWidth: 120,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "jobTitle",
    label: "Job Title",
    type: "text",
    width: 200,
    minWidth: 150,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "department",
    label: "Department",
    type: "text",
    width: 180,
    minWidth: 130,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "facilityName",
    label: "Facility",
    type: "text",
    width: 180,
    minWidth: 130,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "market",
    label: "Market",
    type: "text",
    width: 120,
    minWidth: 100,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "FTE",
    label: "FTE",
    type: "number",
    width: 80,
    minWidth: 70,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "targetCloseDate",
    label: "Target Close",
    type: "date",
    width: 130,
    minWidth: 120,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "reason",
    label: "Reason",
    type: "text",
    width: 170,
    minWidth: 140,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "savings",
    label: "Annual Savings",
    type: "text",
    width: 140,
    minWidth: 110,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
    className: "font-semibold text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "status",
    label: "Status",
    type: "badge",
    width: 140,
    minWidth: 120,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
    renderCell: (data: any) => {
      const variant = data.status === "Approved" ? "default" : "secondary";
      return <Badge variant={variant}>{data.status}</Badge>;
    },
  },
];

export function ForecastTab() {
  return (
    <div className="space-y-6">
      {/* Positions to Open Section */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold">Positions to Open</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Planned position openings based on forecast analysis
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {positionsToOpen.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Positions</div>
            </div>
          </div>
        </div>
        
        <div className="overflow-auto max-h-[400px]">
          <EditableTable
            columns={openPositionsColumns}
            data={positionsToOpen}
            getRowId={(row) => row.id}
            storeNamespace="forecast-open-positions"
          />
        </div>
      </Card>

      {/* Positions to Close Section */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-lg font-semibold">Positions to Close</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Positions planned for closure or elimination
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {positionsToClose.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Positions</div>
            </div>
          </div>
        </div>
        
        <div className="overflow-auto max-h-[400px]">
          <EditableTable
            columns={closePositionsColumns}
            data={positionsToClose}
            getRowId={(row) => row.id}
            storeNamespace="forecast-close-positions"
          />
        </div>
      </Card>
    </div>
  );
}
