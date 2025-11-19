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
import { Button } from "@/components/ui/button";
import { differenceInDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionCommentSection } from "@/components/positions/PositionCommentSection";

interface RequisitionDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: any;
}

export function RequisitionDetailsSheet({
  open,
  onOpenChange,
  requisition,
}: RequisitionDetailsSheetProps) {
  if (!requisition) return null;

  const vacancyAge = requisition.positionStatusDate
    ? differenceInDays(new Date(), new Date(requisition.positionStatusDate))
    : null;

  const getVacancyBadgeVariant = (days: number | null) => {
    if (!days) return "secondary";
    if (days > 60) return "destructive";
    if (days > 30) return "secondary";
    return "default";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex h-full flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">Open Requisition</SheetTitle>
          <SheetDescription>
            {requisition.jobTitle} • Position #{requisition.positionNum}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 min-h-0 flex flex-col">
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col">
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
