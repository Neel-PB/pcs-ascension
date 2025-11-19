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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionCommentSection } from "@/components/positions/PositionCommentSection";

interface ContractorDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: any;
}

export function ContractorDetailsSheet({
  open,
  onOpenChange,
  contractor,
}: ContractorDetailsSheetProps) {
  if (!contractor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex h-full flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">{contractor.employeeName}</SheetTitle>
          <SheetDescription>
            {contractor.jobTitle} • Position #{contractor.positionNum}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1">
            <div className="space-y-6 pb-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">Contingent</Badge>
                  {contractor.payrollStatus && (
                    <Badge variant={contractor.payrollStatus === "Active" ? "default" : "secondary"}>
                      {contractor.payrollStatus}
                    </Badge>
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
                    <p className="text-sm font-medium">{contractor.jobTitle || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Job Code</p>
                    <p className="text-sm font-medium">{contractor.jobcode || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Job Family</p>
                    <p className="text-sm font-medium">{contractor.jobFamily || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">FTE</p>
                    <p className="text-sm font-medium">{contractor.FTE || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Shift</p>
                    <p className="text-sm font-medium">{contractor.shift || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Standard Hours</p>
                    <p className="text-sm font-medium">{contractor.standardHours || "—"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contract Details */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Contract Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Employee Type</p>
                    <p className="text-sm font-medium">{contractor.employeeType || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employment Type</p>
                    <p className="text-sm font-medium">{contractor.employmentType || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employment Flag</p>
                    <p className="text-sm font-medium">{contractor.employmentFlag || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contractor ID</p>
                    <p className="text-sm font-medium">{contractor.employeeId || "—"}</p>
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
                    <p className="text-sm font-medium">{contractor.market || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Facility</p>
                    <p className="text-sm font-medium">{contractor.facilityName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{contractor.departmentName || "—"}</p>
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
                    <p className="text-sm font-medium">{contractor.managerName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Manager Employee ID</p>
                    <p className="text-sm font-medium">{contractor.managerEmployeeId || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col">
            <PositionCommentSection positionId={contractor.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
