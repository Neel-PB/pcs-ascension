import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionCommentSection } from "@/components/positions/PositionCommentSection";

interface EmployeeDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
}

export function EmployeeDetailsSheet({ open, onOpenChange, employee }: EmployeeDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!employee) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex h-full flex-col p-0" hideCloseButton>
        {/* Fixed Header */}
        <div
          className="flex items-center justify-between px-6 border-b bg-background"
          style={{ height: "var(--header-height)" }}
        >
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">{employee.employeeName}</h2>
            <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
          </div>
          <Badge variant={employee.payrollStatus === "Active" ? "default" : "secondary"}>
            {employee.payrollStatus || "Unknown"}
          </Badge>
        </div>

        {/* Content Area */}
        <Tabs
          defaultValue="details"
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="bg-muted p-1.5 mx-6 rounded-lg shrink-0">
            <TabsList className="grid w-full grid-cols-2 bg-transparent">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="flex-1 min-h-0 overflow-hidden !mt-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 px-6 pb-4">
                {/* Position Information */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Position Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Position Number</p>
                      <p className="text-sm font-medium text-foreground">{employee.positionNum || "—"}</p>
                    </div>
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

                {/* Employment Details */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Employment Details</h3>
                  <div className="grid grid-cols-2 gap-3">
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

                {/* Location */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
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

                {/* Manager Information */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Manager</h3>
                  <div className="grid grid-cols-2 gap-3">
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
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 !mt-0 px-6">
            <PositionCommentSection positionId={employee.id} onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>

        {/* Fixed Footer with Close Button - Only on Details Tab */}
        {activeTab === "details" && (
          <div className="px-6 py-4 border-t bg-background shrink-0">
            <div className="flex justify-end">
              <Button variant="ascension" className="rounded-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
