import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";

import { PositionToCloseDetailsSheet } from "@/components/workforce/PositionToCloseDetailsSheet";
import { PositionBreakdownRow } from "@/components/staffing/PositionBreakdownRow";
import { PositionClosureRow } from "@/components/staffing/PositionClosureRow";
import { 
  useForecastPositionsToOpenWithChildren, 
  useForecastPositionsToClose,
} from "@/hooks/useForecastPositions";
import { useRBAC } from "@/hooks/useRBAC";
import { LogoLoader } from "@/components/ui/LogoLoader";

export function ForecastTab() {
  const [selectedClosePosition, setSelectedClosePosition] = useState<any>(null);
  const [closeSheetOpen, setCloseSheetOpen] = useState(false);

  // Fetch data
  const { data: positionsToOpen = [], isLoading: isLoadingOpen } = useForecastPositionsToOpenWithChildren();
  const { data: positionsToClose = [], isLoading: isLoadingClose } = useForecastPositionsToClose();

  // Check admin status
  const { hasRole } = useRBAC();
  const isAdmin = hasRole('admin');

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
              <h2 className="text-2xl font-bold">FTE Shortage</h2>
              <p className="text-muted-foreground mt-1">
                Forecasting positions to open for FTE shortage
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
                <div className="flex justify-center items-center py-12">
                  <LogoLoader size="md" />
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
          <div>
            <h2 className="text-2xl font-bold">FTE Surplus</h2>
            <p className="text-muted-foreground mt-1">
              Forecasting positions to close for FTE surplus
            </p>
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
          <div className="px-3">Reason to Close</div>
          <div className="px-3">FTE Gap</div>
          <div className="px-3 text-center">Status</div>
        </div>

              {/* Rows */}
              {isLoadingClose ? (
                <div className="flex justify-center items-center py-12">
                  <LogoLoader size="md" />
                </div>
              ) : positionsToClose.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No positions to close found
                </div>
        ) : (
          positionsToClose.map((position) => (
            <PositionClosureRow 
              key={position.id} 
              position={position}
            />
          ))
        )}
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
