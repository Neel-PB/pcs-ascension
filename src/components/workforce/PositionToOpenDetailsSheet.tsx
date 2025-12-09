import {
  Sheet,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        <div className="flex flex-col px-6 py-4 border-b bg-background" style={{ minHeight: 'var(--header-height)' }}>
          <h2 className="text-xl font-semibold text-foreground">Position to Open</h2>
          <p className="text-sm text-muted-foreground">
            {position.skill_type} (Skill Type) • FTE: {position.fte}
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

          <TabsContent value="details" className="flex-1 min-h-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
            <ScrollArea className="flex-1">
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
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col px-6">
            <PositionCommentSection positionId={position.id} />
          </TabsContent>
        </Tabs>

        {/* Fixed Footer */}
        <SheetFooter className="border-t px-6 py-4 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}