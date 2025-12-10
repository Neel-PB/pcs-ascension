import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionCommentSection } from "@/components/positions/PositionCommentSection";

interface PositionToOpenDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: any;
}

export function PositionToOpenDetailsSheet({
  open,
  onOpenChange,
  position,
}: PositionToOpenDetailsSheetProps) {
  if (!position) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-xl flex h-full flex-col p-0" 
        hideCloseButton
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 border-b bg-background" style={{ height: 'var(--header-height)' }}>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">Position to Open</h2>
            <p className="text-sm text-muted-foreground">
              {position.skill_type} (Skill Type) • FTE: {position.fte}
            </p>
          </div>
          <Badge variant={position.status === "approved" ? "default" : position.status === "rejected" ? "destructive" : "secondary"}>
            {position.status}
          </Badge>
        </div>

        {/* Content Area */}
        <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0 pt-2">
          <div className="bg-muted p-1.5 mx-6 rounded-lg">
            <TabsList className="grid w-full grid-cols-2 bg-transparent">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="mt-3 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 overflow-auto">
              <div className="space-y-4 px-6 pb-4">
                {/* Position Information */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Position Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Skill Type</p>
                      <p className="text-sm font-medium text-foreground">{position.skill_type || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">FTE</p>
                      <p className="text-sm font-medium text-foreground">{position.fte || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Reason to Open</p>
                      <p className="text-sm font-medium text-foreground">{position.reason_to_open || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
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

          <TabsContent value="comments" className="mt-3 flex-1 min-h-0 flex flex-col px-6 py-0">
            <PositionCommentSection positionId={position.id} onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
