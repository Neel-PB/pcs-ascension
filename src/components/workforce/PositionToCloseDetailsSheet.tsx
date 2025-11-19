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
          </TabsContent>

          <TabsContent value="comments" className="flex-1 min-h-0 flex flex-col">
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
