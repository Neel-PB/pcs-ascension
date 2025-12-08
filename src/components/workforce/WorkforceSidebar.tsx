import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkforceKPISection } from "./WorkforceKPISection";
import { SidebarPositionsToOpen } from "./SidebarPositionsToOpen";
import { SidebarPositionsToClose } from "./SidebarPositionsToClose";

interface WorkforceSidebarProps {
  activeTab: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}

export function WorkforceSidebar({
  activeTab,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
}: WorkforceSidebarProps) {
  const showPositionsToOpen = activeTab === "employees" || activeTab === "contractors";
  const showPositionsToClose = activeTab === "requisitions";

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* KPIs Section */}
          <WorkforceKPISection
            activeTab={activeTab}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedDepartment={selectedDepartment}
          />

          <Separator />

          {/* Positions Section */}
          {showPositionsToOpen && (
            <SidebarPositionsToOpen
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedDepartment={selectedDepartment}
            />
          )}

          {showPositionsToClose && (
            <SidebarPositionsToClose
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedDepartment={selectedDepartment}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
