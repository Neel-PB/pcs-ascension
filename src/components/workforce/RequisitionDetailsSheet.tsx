import {
  Sheet,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
        <div className="flex flex-col px-6 py-4 border-b bg-background" style={{ minHeight: 'var(--header-height)' }}>
          <h2 className="text-xl font-semibold text-foreground">Open Requisition</h2>
          <p className="text-sm text-muted-foreground">
            {requisition.jobTitle} • Position #{requisition.positionNum}
          </p>
        </div>

        {/* Content Area */}
        <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="mt-0 overflow-auto">
            <div className="space-y-6 px-6 py-6">
                {/* Status & Vacancy Age */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Status</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={getVacancyBadgeVariant(vacancyAge)}>
                      Vacancy Age: {vacancyAge} days
                    </Badge>
                    {requisition.positionStatus && (
                      <Badge variant="outline">{requisition.positionStatus}</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Position Information */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Position Information</h3>
                  <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-xs text-muted-foreground mb-1">Position Number</p>
                      <p className="text-sm font-medium text-foreground">{requisition.positionNum || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Shift</p>
                      <p className="text-sm font-medium text-foreground">{requisition.shift || "—"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Employment Details */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Employment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Location</h3>
                  <div className="grid grid-cols-2 gap-4">
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

                <Separator />

                {/* Manager Information */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Manager</h3>
                  <div className="grid grid-cols-2 gap-4">
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
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col px-6 py-0">
            <PositionCommentSection positionId={requisition.id} />
          </TabsContent>
        </Tabs>

        {/* Fixed Footer */}
        <SheetFooter className="border-t px-6 py-4 bg-background flex justify-end">
          <Button variant="ascension" onClick={() => onOpenChange(false)} className="px-6">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}