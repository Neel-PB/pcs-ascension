import { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { differenceInDays, format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionCommentSection } from "@/components/positions/PositionCommentSection";

interface RequisitionDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: any;
}

export function RequisitionDetailsSheet({
  open,
  onOpenChange,
  requisition,
}: RequisitionDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!requisition) return null;

  const vacancyAge = requisition.positionStatusDate
    ? differenceInDays(new Date(), new Date(requisition.positionStatusDate))
    : null;

  const getVacancyBadgeVariant = (days: number | null) => {
    if (!days) return "secondary";
    if (days > 60) return "destructive";
    if (days > 30) return "secondary";
    return "default";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-xl flex h-full flex-col p-0" 
        hideCloseButton
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 border-b bg-background" style={{ height: 'var(--header-height)' }}>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">Open Requisition</h2>
            <p className="text-sm text-muted-foreground">{requisition.jobTitle}</p>
          </div>
          <Badge variant={getVacancyBadgeVariant(vacancyAge)}>
            {vacancyAge !== null ? `${vacancyAge} days` : "Unknown"}
          </Badge>
        </div>

        {/* Content Area */}
        <Tabs defaultValue="details" onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="border-b pb-4 px-6 shrink-0">
            <div className="bg-muted p-1.5 rounded-lg">
              <TabsList className="grid w-full grid-cols-2 bg-transparent">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="details" className="flex-1 min-h-0 overflow-hidden !mt-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 px-6 py-4">
              {/* Position Information */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Position Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Position Number</p>
                    <p className="text-sm font-medium text-foreground">{requisition.positionNum || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Job Title</p>
                    <p className="text-sm font-medium text-foreground">{requisition.jobTitle || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Job Code</p>
                    <p className="text-sm font-medium text-foreground">{requisition.jobcode || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Job Family</p>
                    <p className="text-sm font-medium text-foreground">{requisition.jobFamily || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">FTE</p>
                    <p className="text-sm font-medium text-foreground">{requisition.FTE || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Shift</p>
                    <p className="text-sm font-medium text-foreground">{requisition.shift || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Employment Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Employment Type</p>
                    <p className="text-sm font-medium text-foreground">{requisition.employmentType || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Standard Hours</p>
                    <p className="text-sm font-medium text-foreground">{requisition.standardHours || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Position Status Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {requisition.positionStatusDate 
                        ? format(new Date(requisition.positionStatusDate), "MMM dd, yyyy")
                        : "—"}
                    </p>
                  </div>
                  {requisition.positionStatus && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Position Status</p>
                      <p className="text-sm font-medium text-foreground">{requisition.positionStatus}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Location</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Market</p>
                    <p className="text-sm font-medium text-foreground">{requisition.market || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Facility</p>
                    <p className="text-sm font-medium text-foreground">{requisition.facilityName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <p className="text-sm font-medium text-foreground">{requisition.departmentName || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Manager Information */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Manager</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Manager Name</p>
                    <p className="text-sm font-medium text-foreground">{requisition.managerName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Manager Position</p>
                    <p className="text-sm font-medium text-foreground">{requisition.managerPositionNum || "—"}</p>
                  </div>
                </div>
              </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 !mt-0 px-6">
            <PositionCommentSection positionId={requisition.id} onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>

        {/* Fixed Footer with Close Button - Only on Details Tab */}
        {activeTab === "details" && (
          <div className="px-6 py-4 border-t bg-background shrink-0">
            <div className="flex justify-end">
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
