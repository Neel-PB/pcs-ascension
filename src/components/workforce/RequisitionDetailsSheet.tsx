import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <SheetContent className="w-full sm:max-w-xl flex h-full flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">Open Requisition</SheetTitle>
          <SheetDescription>
            {requisition.jobTitle} • Position #{requisition.positionNum}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1">
            <div className="space-y-6 pb-6">
              {/* Status & Vacancy Age */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
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
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Position Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Job Title</p>
                    <p className="text-sm font-medium">{requisition.jobTitle || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Job Code</p>
                    <p className="text-sm font-medium">{requisition.jobcode || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Job Family</p>
                    <p className="text-sm font-medium">{requisition.jobFamily || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">FTE</p>
                    <p className="text-sm font-medium">{requisition.FTE || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Position Number</p>
                    <p className="text-sm font-medium">{requisition.positionNum || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Shift</p>
                    <p className="text-sm font-medium">{requisition.shift || "—"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Employment Details */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Employment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Employment Type</p>
                    <p className="text-sm font-medium">{requisition.employmentType || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Standard Hours</p>
                    <p className="text-sm font-medium">{requisition.standardHours || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Position Status Date</p>
                    <p className="text-sm font-medium">
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
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Market</p>
                    <p className="text-sm font-medium">{requisition.market || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Facility</p>
                    <p className="text-sm font-medium">{requisition.facilityName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{requisition.departmentName || "—"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Manager Information */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Manager</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Manager Name</p>
                    <p className="text-sm font-medium">{requisition.managerName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Manager Position</p>
                    <p className="text-sm font-medium">{requisition.managerPositionNum || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col">
            <PositionCommentSection positionId={requisition.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
