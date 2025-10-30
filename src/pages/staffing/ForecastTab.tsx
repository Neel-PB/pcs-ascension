import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EditableTable } from "@/components/editable-table/EditableTable";
import { ColumnDef } from "@/types/table";

import { PositionToOpenDetailsSheet } from "@/components/workforce/PositionToOpenDetailsSheet";
import { PositionToCloseDetailsSheet } from "@/components/workforce/PositionToCloseDetailsSheet";
import { ApprovalButtons } from "@/components/staffing/ApprovalButtons";
import { 
  useForecastPositionsToOpen, 
  useForecastPositionsToClose,
  useApprovePositionToOpen,
  useRejectPositionToOpen,
  useApprovePositionToClose,
  useRejectPositionToClose,
  useRevertPositionToOpen,
  useRevertPositionToClose
} from "@/hooks/useForecastPositions";
import { useRBAC } from "@/hooks/useRBAC";

export function ForecastTab() {
  const [selectedOpenPosition, setSelectedOpenPosition] = useState<any>(null);
  const [selectedClosePosition, setSelectedClosePosition] = useState<any>(null);
  const [openSheetOpen, setOpenSheetOpen] = useState(false);
  const [closeSheetOpen, setCloseSheetOpen] = useState(false);

  // Fetch data
  const { data: positionsToOpen = [], isLoading: isLoadingOpen } = useForecastPositionsToOpen();
  const { data: positionsToClose = [], isLoading: isLoadingClose } = useForecastPositionsToClose();

  // Mutations
  const { mutate: approveOpen, isPending: isApprovingOpen } = useApprovePositionToOpen();
  const { mutate: rejectOpen, isPending: isRejectingOpen } = useRejectPositionToOpen();
  const { mutate: revertOpen, isPending: isRevertingOpen } = useRevertPositionToOpen();
  const { mutate: approveClose, isPending: isApprovingClose } = useApprovePositionToClose();
  const { mutate: rejectClose, isPending: isRejectingClose } = useRejectPositionToClose();
  const { mutate: revertClose, isPending: isRevertingClose } = useRevertPositionToClose();

  // Check admin status
  const { hasRole } = useRBAC();
  const isAdmin = hasRole('admin');

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
      id: "reason_to_open",
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
            revertOpen(data.id);
          } else {
            approveOpen(data.id);
          }
        };

        const handleReject = () => {
          if (data.status === 'rejected') {
            revertOpen(data.id);
          } else {
            rejectOpen(data.id);
          }
        };

        return (
          <ApprovalButtons
            status={data.status}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isApprovingOpen || isRejectingOpen || isRevertingOpen}
            disabled={!isAdmin}
          />
        );
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
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Positions to Open</h2>
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
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Positions to Close</h2>
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
