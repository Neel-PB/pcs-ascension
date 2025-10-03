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
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl">{employee.employeeName}</SheetTitle>
          <SheetDescription>
            {employee.jobTitle} • Position #{employee.positionNum}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ScrollArea className="h-[calc(100vh-220px)] pr-4">
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <Badge variant={employee.payrollStatus === "Active" ? "default" : "secondary"}>
                    {employee.payrollStatus || "Unknown"}
                  </Badge>
                </div>

                <Separator />

                {/* Position Information */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Position Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Job Title</p>
                      <p className="text-sm font-medium">{employee.jobTitle || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Job Code</p>
                      <p className="text-sm font-medium">{employee.jobcode || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Job Family</p>
                      <p className="text-sm font-medium">{employee.jobFamily || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">FTE</p>
                      <p className="text-sm font-medium">{employee.FTE || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Shift</p>
                      <p className="text-sm font-medium">{employee.shift || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Standard Hours</p>
                      <p className="text-sm font-medium">{employee.standardHours || "—"}</p>
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
                      <p className="text-sm font-medium">{employee.employeeType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employment Type</p>
                      <p className="text-sm font-medium">{employee.employmentType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employment Flag</p>
                      <p className="text-sm font-medium">{employee.employmentFlag || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employee ID</p>
                      <p className="text-sm font-medium">{employee.employeeId || "—"}</p>
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
                      <p className="text-sm font-medium">{employee.market || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Facility</p>
                      <p className="text-sm font-medium">{employee.facilityName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{employee.departmentName || "—"}</p>
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
                      <p className="text-sm font-medium">{employee.managerName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Manager Employee ID</p>
                      <p className="text-sm font-medium">{employee.managerEmployeeId || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments">
            <PositionCommentSection positionId={employee.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
