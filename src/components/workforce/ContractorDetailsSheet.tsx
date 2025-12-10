import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex items-center justify-between px-6 border-b bg-background" style={{ height: 'var(--header-height)' }}>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">{contractor.employeeName}</h2>
            <p className="text-sm text-muted-foreground">{contractor.jobTitle}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">Contingent</Badge>
            {contractor.payrollStatus && (
              <Badge variant={contractor.payrollStatus === "Active" ? "default" : "secondary"}>
                {contractor.payrollStatus}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Area */}
        <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
          <div className="bg-muted p-1.5 mx-6 mt-3 rounded-lg">
            <TabsList className="grid w-full grid-cols-2 bg-transparent">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 overflow-auto">
              <div className="space-y-4 px-6 pt-3 pb-4">
                {/* Position Information */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Position Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Position Number</p>
                      <p className="text-sm font-medium text-foreground">{contractor.positionNum || "—"}</p>
                    </div>
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

                {/* Contract Details */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Contract Details</h3>
                  <div className="grid grid-cols-2 gap-3">
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

                {/* Location */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
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

                {/* Manager Information */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Manager</h3>
                  <div className="grid grid-cols-2 gap-3">
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
            </div>
            
            {/* Fixed Footer with Close Button */}
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
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col px-6 py-0">
            <PositionCommentSection positionId={contractor.id} onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
