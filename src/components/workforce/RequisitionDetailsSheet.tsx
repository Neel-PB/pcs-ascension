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
import { differenceInDays } from "date-fns";
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

        <Tabs defaultValue="details" className="mt-6 flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 flex flex-col relative">
            <ScrollArea className="h-[calc(100%-80px)] pr-4">
              <div className="space-y-6">
                {/* Status & Vacancy Age */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={getVacancyBadgeVariant(vacancyAge)}>
                      {vacancyAge ? `${vacancyAge} days vacant` : "Vacant"}
                    </Badge>
                    {requisition.positionLifecycle && (
                      <Badge variant="outline">{requisition.positionLifecycle}</Badge>
                    )}
                    {requisition.positionStatus && (
                      <Badge variant="secondary">{requisition.positionStatus}</Badge>
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
                      <p className="text-xs text-muted-foreground">Shift</p>
                      <p className="text-sm font-medium">{requisition.shift || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Standard Hours</p>
                      <p className="text-sm font-medium">{requisition.standardHours || "—"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Employment Details */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Employment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Employee Type</p>
                      <p className="text-sm font-medium">{requisition.employeeType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employment Type</p>
                      <p className="text-sm font-medium">{requisition.employmentType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Position Status Date</p>
                      <p className="text-sm font-medium">
                        {requisition.positionStatusDate
                          ? new Date(requisition.positionStatusDate).toLocaleDateString()
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
                      <p className="text-xs text-muted-foreground">Manager Position #</p>
                      <p className="text-sm font-medium">{requisition.managerPositionNum || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Edit Requisition
                </Button>
                <Button className="flex-1">Send to Oracle</Button>
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
