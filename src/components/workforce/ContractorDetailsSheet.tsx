import {
  Sheet,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
      <SheetContent 
        className="w-full sm:max-w-xl flex h-full flex-col p-0" 
        hideCloseButton
      >
        {/* Fixed Header */}
        <div className="flex flex-col px-6 py-4 border-b bg-background" style={{ minHeight: 'var(--header-height)' }}>
          <h2 className="text-xl font-semibold text-foreground">{contractor.employeeName}</h2>
          <p className="text-sm text-muted-foreground">
            {contractor.jobTitle} • Position #{contractor.positionNum}
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
                {/* Status */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Status</h3>
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
                  <h3 className="text-base font-semibold text-foreground mb-4">Position Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Job Title</p>
                      <p className="text-sm font-medium text-foreground">{contractor.jobTitle || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Job Code</p>
                      <p className="text-sm font-medium text-foreground">{contractor.jobcode || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Job Family</p>
                      <p className="text-sm font-medium text-foreground">{contractor.jobFamily || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">FTE</p>
                      <p className="text-sm font-medium text-foreground">{contractor.FTE || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Shift</p>
                      <p className="text-sm font-medium text-foreground">{contractor.shift || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Standard Hours</p>
                      <p className="text-sm font-medium text-foreground">{contractor.standardHours || "—"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contract Details */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Contract Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Employee Type</p>
                      <p className="text-sm font-medium text-foreground">{contractor.employeeType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Employment Type</p>
                      <p className="text-sm font-medium text-foreground">{contractor.employmentType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Employment Flag</p>
                      <p className="text-sm font-medium text-foreground">{contractor.employmentFlag || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Contractor ID</p>
                      <p className="text-sm font-medium text-foreground">{contractor.employeeId || "—"}</p>
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
                      <p className="text-sm font-medium text-foreground">{contractor.market || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Facility</p>
                      <p className="text-sm font-medium text-foreground">{contractor.facilityName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Department</p>
                      <p className="text-sm font-medium text-foreground">{contractor.departmentName || "—"}</p>
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
                      <p className="text-sm font-medium text-foreground">{contractor.managerName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Manager Employee ID</p>
                      <p className="text-sm font-medium text-foreground">{contractor.managerEmployeeId || "—"}</p>
                    </div>
                  </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col px-6 py-0">
            <PositionCommentSection positionId={contractor.id} />
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