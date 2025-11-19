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

          <TabsContent value="details" className="flex-1 min-h-0 flex flex-col">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={position.status === "approved" ? "default" : position.status === "rejected" ? "destructive" : "secondary"}>
                      {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                    </Badge>
                    {position.approved_at && (
                      <span className="text-xs text-muted-foreground">
                        on {new Date(position.approved_at).toLocaleDateString()}
                      </span>
                    )}
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
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{position.department_name || "—"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Selected Employees */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Selected Employees for Closure
                  </h3>
                  {selectedEmployees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No employees selected</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEmployees.map(emp => (
                        <div key={emp.id} className="flex justify-between items-center text-sm py-1">
                          <div>
                            <p className="font-medium">{emp.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                          </div>
                          <span className="text-muted-foreground">{Number(emp.FTE || 0).toFixed(2)} FTE</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-medium pt-1">
                        <span>Total</span>
                        <span>{totalSelectedFte.toFixed(2)} FTE</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col">
            <PositionCommentSection positionId={position.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
