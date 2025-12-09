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

interface EmployeeDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
}

export function EmployeeDetailsSheet({
  open,
  onOpenChange,
  employee,
}: EmployeeDetailsSheetProps) {
  if (!employee) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-xl flex h-full flex-col p-0" 
        hideCloseButton
      >
        {/* Fixed Header */}
        <div className="flex flex-col px-6 py-4 border-b bg-background" style={{ minHeight: 'var(--header-height)' }}>
          <h2 className="text-xl font-semibold text-foreground">{employee.employeeName}</h2>
          <p className="text-sm text-muted-foreground">
            {employee.jobTitle} • Position #{employee.positionNum}
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
            <div className="space-y-6 px-6 py-4">
                {/* Status */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">Status</h3>
                  <Badge variant={employee.payrollStatus === "Active" ? "default" : "secondary"}>
                    {employee.payrollStatus || "Unknown"}
                  </Badge>
                </div>

                <Separator />

                {/* Position Information */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Position Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Job Title</p>
                      <p className="text-sm font-medium text-foreground">{employee.jobTitle || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Job Code</p>
                      <p className="text-sm font-medium text-foreground">{employee.jobcode || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Job Family</p>
                      <p className="text-sm font-medium text-foreground">{employee.jobFamily || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">FTE</p>
                      <p className="text-sm font-medium text-foreground">{employee.FTE || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Shift</p>
                      <p className="text-sm font-medium text-foreground">{employee.shift || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Standard Hours</p>
                      <p className="text-sm font-medium text-foreground">{employee.standardHours || "—"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Employment Details */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Employment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Employee Type</p>
                      <p className="text-sm font-medium text-foreground">{employee.employeeType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Employment Type</p>
                      <p className="text-sm font-medium text-foreground">{employee.employmentType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Employment Flag</p>
                      <p className="text-sm font-medium text-foreground">{employee.employmentFlag || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Employee ID</p>
                      <p className="text-sm font-medium text-foreground">{employee.employeeId || "—"}</p>
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
                      <p className="text-sm font-medium text-foreground">{employee.market || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Facility</p>
                      <p className="text-sm font-medium text-foreground">{employee.facilityName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Department</p>
                      <p className="text-sm font-medium text-foreground">{employee.departmentName || "—"}</p>
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
                      <p className="text-sm font-medium text-foreground">{employee.managerName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Manager Employee ID</p>
                      <p className="text-sm font-medium text-foreground">{employee.managerEmployeeId || "—"}</p>
                    </div>
                  </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col px-6">
            <PositionCommentSection positionId={employee.id} />
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