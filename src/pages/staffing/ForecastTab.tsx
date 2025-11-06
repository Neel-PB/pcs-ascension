import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnDef } from "@/types/table";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";

import { PositionToCloseDetailsSheet } from "@/components/workforce/PositionToCloseDetailsSheet";
import { ApprovalButtons } from "@/components/staffing/ApprovalButtons";
import { PositionBreakdownRow } from "@/components/staffing/PositionBreakdownRow";
import { 
  useForecastPositionsToOpenWithChildren, 
  useForecastPositionsToClose,
  useApprovePositionToClose,
  useRejectPositionToClose,
  useRevertPositionToClose
} from "@/hooks/useForecastPositions";
import { useRBAC } from "@/hooks/useRBAC";

export function ForecastTab() {
  const [selectedClosePosition, setSelectedClosePosition] = useState<any>(null);
  const [closeSheetOpen, setCloseSheetOpen] = useState(false);

  // Fetch data
  const { data: positionsToOpen = [], isLoading: isLoadingOpen } = useForecastPositionsToOpenWithChildren();
  const { data: positionsToClose = [], isLoading: isLoadingClose } = useForecastPositionsToClose();

  // Mutations for close positions
  const { mutate: approveClose, isPending: isApprovingClose } = useApprovePositionToClose();
  const { mutate: rejectClose, isPending: isRejectingClose } = useRejectPositionToClose();
  const { mutate: revertClose, isPending: isRevertingClose } = useRevertPositionToClose();

  // Check admin status
  const { hasRole } = useRBAC();
  const isAdmin = hasRole('admin');

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
      id: "facility_name",
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
      id: "department_name",
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
      id: "skill_type",
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
      id: "reason_to_close",
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
      id: "fte",
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
      id: "actions",
      label: "Actions",
      type: "custom",
      width: 180,
      minWidth: 150,
      sortable: false,
      resizable: true,
      draggable: false,
      locked: true,
      renderCell: (data: any) => {
        const handleApprove = () => {
          if (data.status === 'approved') {
            revertClose(data.id);
          } else {
            approveClose(data.id);
          }
        };

        const handleReject = () => {
          if (data.status === 'rejected') {
            revertClose(data.id);
          } else {
            rejectClose(data.id);
          }
        };

        return (
          <ApprovalButtons
            status={data.status}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isApprovingClose || isRejectingClose || isRevertingClose}
            disabled={!isAdmin}
          />
        );
      },
    },
  ];

  const handleCloseRowClick = (row: any) => {
    setSelectedClosePosition(row);
    setCloseSheetOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Positions to Open Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Positions to Open</h2>
              <p className="text-muted-foreground mt-1">
                Break down FTE gaps into individual position requests
              </p>
            </div>
            <DataRefreshButton dataSources={['forecast_data', 'staffing_grid']} />
          </div>
          <Card className="overflow-hidden">
            <div className="border rounded-md">
              {/* Header */}
              <div
                className="grid h-10 items-center bg-muted font-medium text-sm border-b"
                style={{
                  gridTemplateColumns: "40px 120px 180px 180px 150px 1fr 100px 80px",
                }}
              >
                <div />
                <div className="px-3">Market</div>
                <div className="px-3">Facility</div>
                <div className="px-3">Department</div>
                <div className="px-3">Skill Type</div>
                <div className="px-3">Reason to Open</div>
                <div className="px-3">FTE Gap</div>
                <div className="px-3 text-center">Status</div>
              </div>

              {/* Rows */}
              {isLoadingOpen ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading positions...
                </div>
              ) : positionsToOpen.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No positions to open found
                </div>
              ) : (
                positionsToOpen.map((position) => (
                  <PositionBreakdownRow key={position.id} position={position} />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Positions to Close Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Positions to Close</h2>
          <Card className="overflow-hidden">
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
      </div>

      {/* Detail Sheet for Positions to Close */}
      <PositionToCloseDetailsSheet
        open={closeSheetOpen}
        onOpenChange={setCloseSheetOpen}
        position={selectedClosePosition}
      />
    </>
  );
}
