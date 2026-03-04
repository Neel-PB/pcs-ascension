import { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { PositionCommentSection } from "@/components/positions/PositionCommentSection";
import { useEmployeesForClosureGap, useApprovePositionToClose, useRejectPositionToClose, useRevertPositionToClose } from "@/hooks/useForecastPositions";
import { ApprovalButtons } from "@/components/staffing/ApprovalButtons";
import { useRBAC } from "@/hooks/useRBAC";

interface PositionToCloseDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: any;
}

export function PositionToCloseDetailsSheet({
  open,
  onOpenChange,
  position,
}: PositionToCloseDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { data: employees = [] } = useEmployeesForClosureGap(position);
  const { hasPermission } = useRBAC();
  const canApprove = hasPermission('approvals.positions_to_close');
  
  const approvePosition = useApprovePositionToClose();
  const rejectPosition = useRejectPositionToClose();
  const revertPosition = useRevertPositionToClose();
  
  if (!position) return null;

  const handleApprove = () => {
    if (position.status === 'approved') {
      revertPosition.mutate(position.id);
    } else {
      approvePosition.mutate(position.id);
    }
  };

  const handleReject = () => {
    if (position.status === 'rejected') {
      revertPosition.mutate(position.id);
    } else {
      rejectPosition.mutate(position.id);
    }
  };

  const isLoading = approvePosition.isPending || rejectPosition.isPending || revertPosition.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-xl flex h-full flex-col p-0" 
        hideCloseButton
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 border-b bg-background" style={{ height: 'var(--header-height)' }}>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">Position to Close</h2>
            <p className="text-sm text-muted-foreground">
              {position.skill_type} (Job Family) • FTE: {position.fte}
            </p>
          </div>
          <Badge variant={position.status === "approved" ? "default" : position.status === "rejected" ? "destructive" : "secondary"}>
            {position.status}
          </Badge>
        </div>

        {/* Content Area */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="px-6 pb-3 shrink-0">
            <ToggleButtonGroup
              items={[{ id: "details", label: "Details" }, { id: "comments", label: "Comments" }] as const}
              activeId={activeTab}
              onSelect={(id) => setActiveTab(id)}
              layoutId="closeSheetTab"
            />
          </div>

          <TabsContent value="details" className="flex-1 min-h-0 overflow-hidden !mt-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 px-6 py-4">
              {/* Position Information */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Position Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Job Family</p>
                    <p className="text-sm font-medium text-foreground">{position.skill_type || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">FTE</p>
                    <p className="text-sm font-medium text-foreground">{position.fte || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Reason to Close</p>
                    <p className="text-sm font-medium text-foreground">{position.reason_to_close || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Location</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Region</p>
                    <p className="text-sm font-medium text-foreground">{position.region || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Market</p>
                    <p className="text-sm font-medium text-foreground">{position.market || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Facility</p>
                    <p className="text-sm font-medium text-foreground">{position.facility_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <p className="text-sm font-medium text-foreground">{position.department_name || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Selected Employees */}
              {employees && employees.length > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Selected Employees</h3>
                  <div className="space-y-2">
                    {employees.map((emp: any) => (
                      <div key={emp.id} className="flex justify-between items-center p-3 bg-background/60 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">{emp.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                        </div>
                        <Badge variant="outline">{emp.FTE} FTE</Badge>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg font-medium">
                      <span className="text-sm text-foreground">Total FTE</span>
                      <span className="text-sm text-foreground">{employees.reduce((sum: number, emp: any) => sum + (emp.FTE || 0), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 !mt-0 px-[15px]">
            <PositionCommentSection positionId={position.id} onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>

        {/* Fixed Footer with Approval Buttons - Only on Details Tab */}
        {activeTab === "details" && (
          <div className="px-6 py-4 border-t bg-background shrink-0">
            <div className="flex items-center justify-between">
              <ApprovalButtons
                status={position.status}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={isLoading}
                disabled={!canApprove}
              />
              <Button 
                variant="ascension" 
                className="rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
