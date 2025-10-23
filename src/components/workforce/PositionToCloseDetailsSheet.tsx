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
  if (!position) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex h-full flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">Position to Close</SheetTitle>
          <SheetDescription>
            {position.skillType} • FTE: {position.FTE}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6 flex flex-col flex-1 min-h-0">
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
                  <Badge variant={position.status === "Approved" ? "default" : "secondary"}>
                    {position.status}
                  </Badge>
                </div>

                <Separator />

                {/* Position Information */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Position Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Skill Type</p>
                      <p className="text-sm font-medium">{position.skillType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">FTE</p>
                      <p className="text-sm font-medium">{position.FTE || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Reason to Close</p>
                      <p className="text-sm font-medium">{position.reasonToClose || "—"}</p>
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
                      <p className="text-sm font-medium">{position.facilityName || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{position.departmentName || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0">
            <PositionCommentSection positionId={position.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
