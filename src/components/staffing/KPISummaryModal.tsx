import { useState, useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DraggableSectionsContainer } from "./DraggableSectionsContainer";
import { useKPIOrderStore } from "@/stores/useKPIOrderStore";
import { getFTEKPIs, getVolumeKPIs, getProductivityKPIs } from "@/config/kpiConfigs";

export function KPISummaryModal() {
  const [open, setOpen] = useState(false);
  
  const { 
    fte: fteOrder, 
    volume: volumeOrder, 
    productivity: productivityOrder, 
    sectionOrder,
    setOrder,
    setSectionOrder 
  } = useKPIOrderStore();

  // FTE KPIs Configuration
  const fteKPIs = useMemo(() => {
    const kpis = getFTEKPIs();
    return kpis.sort((a, b) => {
      const aIndex = fteOrder.indexOf(a.id);
      const bIndex = fteOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [fteOrder]);

  // Volume KPIs Configuration
  const volumeKPIs = useMemo(() => {
    const kpis = getVolumeKPIs();
    return kpis.sort((a, b) => {
      const aIndex = volumeOrder.indexOf(a.id);
      const bIndex = volumeOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [volumeOrder]);

  // Productivity KPIs Configuration
  const productivityKPIs = useMemo(() => {
    const kpis = getProductivityKPIs();
    return kpis.sort((a, b) => {
      const aIndex = productivityOrder.indexOf(a.id);
      const bIndex = productivityOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [productivityOrder]);

  const sections = useMemo(() => [
    { id: 'fte', title: 'FTE', kpis: fteKPIs },
    { id: 'volume', title: 'Volume', kpis: volumeKPIs },
    { id: 'productivity', title: 'Productive Resources', kpis: productivityKPIs },
  ], [fteKPIs, volumeKPIs, productivityKPIs]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ascension"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="KPI Summary"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>KPI Summary</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-none w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">KPIs</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 max-h-[calc(95vh-100px)]">
            <DraggableSectionsContainer
              sections={sections}
              sectionOrder={sectionOrder}
              onSectionReorder={setSectionOrder}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
