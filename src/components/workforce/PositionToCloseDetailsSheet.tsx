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
      <SheetContent className="w-full sm:max-w-xl flex h-full flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">Position to Close</SheetTitle>
          <SheetDescription>
            {position.skill_type} (Job Family) • FTE: {position.fte}
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
                <div className="flex items-center gap-2">
                  <Badge variant={position.status === "approved" ? "default" : position.status === "rejected" ? "destructive" : "secondary"}>
                    {position.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Position Information */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Position Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Job Family</p>
                    <p className="text-sm font-medium">{position.skill_type || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">FTE</p>
                    <p className="text-sm font-medium">{position.fte || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Reason to Close</p>
                    <p className="text-sm font-medium">{position.reason_to_close || "—"}</p>
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
                    <p className="text-sm font-medium">{position.market || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Facility</p>
                    <p className="text-sm font-medium">{position.facility_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{position.department_name || "—"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Selected Employees */}
              {employees && employees.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Selected Employees</h3>
                  <div className="space-y-2">
                    {employees.map((emp: any) => (
                      <div key={emp.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">{emp.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                        </div>
                        <Badge variant="outline">{emp.FTE} FTE</Badge>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-2 bg-primary/10 rounded font-medium">
                      <span className="text-sm">Total FTE</span>
                      <span className="text-sm">{employees.reduce((sum: number, emp: any) => sum + (emp.FTE || 0), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col">
            <PositionCommentSection positionId={position.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
