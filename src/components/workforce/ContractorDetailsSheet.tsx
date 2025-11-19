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

interface ContractorDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: any;
}

export function ContractorDetailsSheet({
  open,
  onOpenChange,
  contractor,
}: ContractorDetailsSheetProps) {
  if (!contractor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex h-full flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">{contractor.employeeName}</SheetTitle>
          <SheetDescription>
            {contractor.jobTitle} • Position #{contractor.positionNum}
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
