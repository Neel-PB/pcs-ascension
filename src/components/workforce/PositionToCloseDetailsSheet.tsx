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
import { useEmployeesForClosureGap } from "@/hooks/useForecastPositions";

interface PositionToCloseDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: any;
}

export function PositionToCloseDetailsSheet({
  open,
  onOpenChange,
  position,
}: PositionToCloseDetailsSheetProps) {
  const { data: employees = [] } = useEmployeesForClosureGap(position);
  
  if (!position) return null;

  const selectedEmployees = employees.filter(emp => 
    position.selected_position_ids?.includes(emp.id)
  );
  
  const totalSelectedFte = selectedEmployees.reduce(
    (sum, emp) => sum + Number(emp.FTE || 0), 
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-xl flex h-full flex-col p-0" 
        hideCloseButton
      >
        {/* Fixed Header */}
        <div className="flex flex-col px-6 py-4 border-b bg-background" style={{ minHeight: 'var(--header-height)' }}>
          <h2 className="text-xl font-semibold text-foreground">Position to Close</h2>
          <p className="text-sm text-muted-foreground">
            {position.skill_type} (Job Family) • FTE: {position.fte}
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
                  <div className="flex items-center gap-2">
                    <Badge variant={position.status === "approved" ? "default" : position.status === "rejected" ? "destructive" : "secondary"}>
                      {position.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Position Information */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Position Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Job Family</p>
                      <p className="text-sm font-medium text-foreground">{position.skill_type || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">FTE</p>
                      <p className="text-sm font-medium text-foreground">{position.fte || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Reason to Close</p>
                      <p className="text-sm font-medium text-foreground">{position.reason_to_close || "—"}</p>
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
                      <p className="text-sm font-medium text-foreground">{position.market || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Facility</p>
                      <p className="text-sm font-medium text-foreground">{position.facility_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Department</p>
                      <p className="text-sm font-medium text-foreground">{position.department_name || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Employees */}
                {employees && employees.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-4">Selected Employees</h3>
                      <div className="space-y-2">
                        {employees.map((emp: any) => (
                          <div key={emp.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-foreground">{emp.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                            </div>
                            <Badge variant="outline">{emp.FTE} FTE</Badge>
                          </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg font-medium">
                          <span className="text-sm text-foreground">Total FTE</span>
                          <span className="text-sm text-foreground">{employees.reduce((sum: number, emp: any) => sum + (emp.FTE || 0), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col px-6">
            <PositionCommentSection positionId={position.id} />
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