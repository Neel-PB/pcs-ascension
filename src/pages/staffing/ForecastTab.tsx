import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnDef } from "@/types/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PositionToOpenDetailsSheet } from "@/components/workforce/PositionToOpenDetailsSheet";
import { PositionToCloseDetailsSheet } from "@/components/workforce/PositionToCloseDetailsSheet";

// Mock data for positions to open
const positionsToOpen = [
  {
    id: "1",
    market: "Central",
    facilityName: "Memorial Hospital",
    departmentName: "Emergency Department",
    skillType: "Clinical RN",
    reasonToOpen: "Vacancy - Retirement",
    FTE: 1.0,
    status: "Approved",
  },
  {
    id: "2",
    market: "Central",
    facilityName: "Memorial Hospital",
    departmentName: "Laboratory",
    skillType: "Lab Technician",
    reasonToOpen: "Volume Growth",
    FTE: 0.8,
    status: "Pending Approval",
  },
  {
    id: "3",
    market: "West",
    facilityName: "Valley Medical Center",
    departmentName: "Rehabilitation",
    skillType: "Physical Therapist",
    reasonToOpen: "New Service Line",
    FTE: 1.0,
    status: "Approved",
  },
];

// Mock data for positions to close
const positionsToClose = [
  {
    id: "4",
    market: "Central",
    facilityName: "Memorial Hospital",
    departmentName: "Finance",
    skillType: "Administrative",
    reasonToClose: "Automation Implementation",
    FTE: 0.6,
    status: "Pending Approval",
  },
  {
    id: "5",
    market: "West",
    facilityName: "Valley Medical Center",
    departmentName: "Medical-Surgical",
    skillType: "Unit Clerk",
    reasonToClose: "Restructure",
    FTE: 0.5,
    status: "Approved",
  },
];

// Column definitions for Positions to Open
const openPositionsColumns: ColumnDef[] = [
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
    id: "departmentName",
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
    id: "skillType",
    label: "Skill Type",
    type: "text",
    width: 150,
    minWidth: 120,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "reasonToOpen",
    label: "Reason to Open",
    type: "text",
    width: 200,
    minWidth: 150,
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

// Column definitions for Positions to Close
const closePositionsColumns: ColumnDef[] = [
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
    id: "departmentName",
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
    id: "skillType",
    label: "Skill Type",
    type: "text",
    width: 150,
    minWidth: 120,
    sortable: true,
    resizable: true,
    draggable: true,
    locked: false,
  },
  {
    id: "reasonToClose",
    label: "Reason to Close",
    type: "text",
    width: 200,
    minWidth: 150,
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
  const [selectedOpenPosition, setSelectedOpenPosition] = useState<any>(null);
  const [selectedClosePosition, setSelectedClosePosition] = useState<any>(null);
  const [openSheetOpen, setOpenSheetOpen] = useState(false);
  const [closeSheetOpen, setCloseSheetOpen] = useState(false);

  const handleOpenRowClick = (row: any) => {
    setSelectedOpenPosition(row);
    setOpenSheetOpen(true);
  };

  const handleCloseRowClick = (row: any) => {
    setSelectedClosePosition(row);
    setCloseSheetOpen(true);
  };

  return (
    <>
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
            onRowClick={handleOpenRowClick}
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
            onRowClick={handleCloseRowClick}
            storeNamespace="forecast-close-positions"
          />
        </div>
      </Card>
      </div>

      {/* Detail Sheets */}
      <PositionToOpenDetailsSheet
        open={openSheetOpen}
        onOpenChange={setOpenSheetOpen}
        position={selectedOpenPosition}
      />
      
      <PositionToCloseDetailsSheet
        open={closeSheetOpen}
        onOpenChange={setCloseSheetOpen}
        position={selectedClosePosition}
      />
    </>
  );
}
