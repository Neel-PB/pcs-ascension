import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTourStore } from "@/stores/useTourStore";
import { useWorkforceDrawerStore } from "@/stores/useWorkforceDrawerStore";
import { useAIHub } from "@/hooks/useAIHub";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  Settings,
  CheckCircle,
  Play,
  RotateCcw,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Sparkles,
  Navigation,
  Shield,
  History,
  Briefcase,
} from "@/lib/icons";
import type { IconType } from "react-icons";

interface Guide {
  tourKey: string;
  title: string;
  description: string;
  icon: IconType;
  route: string;
  stepCount: number;
  category: string;
  isOverlay?: boolean;
}

const guideCatalog: Guide[] = [
  { tourKey: "staffing", title: "Staffing Summary", description: "KPI cards, trend charts, definition views, and volume color indicators.", icon: BarChart3, route: "/staffing", stepCount: 26, category: "Staffing" },
  { tourKey: "staffing-planning", title: "Position Planning", description: "FTE skill-shift analysis with hired/active and nursing toggles.", icon: Layers, route: "/staffing?tab=planning", stepCount: 6, category: "Staffing" },
  { tourKey: "staffing-variance", title: "Variance Analysis", description: "FTE variance by skill type across your selected scope.", icon: BarChart3, route: "/staffing?tab=variance", stepCount: 5, category: "Staffing" },
  { tourKey: "staffing-forecast", title: "Forecast", description: "FTE shortage/surplus KPIs and expandable detail views.", icon: Navigation, route: "/staffing?tab=forecasts", stepCount: 3, category: "Staffing" },
  { tourKey: "staffing-volume-settings", title: "Volume Settings", description: "Override target volumes and manage expiration dates.", icon: Settings, route: "/staffing?tab=volume-settings", stepCount: 3, category: "Staffing" },
  { tourKey: "staffing-np-settings", title: "NP Settings", description: "Configure non-productive override percentages.", icon: Settings, route: "/staffing?tab=np-settings", stepCount: 3, category: "Staffing" },
  { tourKey: "positions-employees", title: "Employees", description: "Employee roster with Active FTE overrides and shift management.", icon: Users, route: "/positions", stepCount: 9, category: "Positions" },
  { tourKey: "positions-contractors", title: "Contractors", description: "Contractor roster with FTE and shift override controls.", icon: Briefcase, route: "/positions?tab=contractors", stepCount: 9, category: "Positions" },
  { tourKey: "positions-requisitions", title: "Open Positions", description: "Open requisitions with vacancy age tracking and comments.", icon: Users, route: "/positions?tab=requisitions", stepCount: 7, category: "Positions" },
  { tourKey: "admin-users", title: "Admin Users", description: "User management, roles, and access scope restrictions.", icon: Users, route: "/admin", stepCount: 6, category: "Admin" },
  { tourKey: "admin-feed", title: "Admin Feed", description: "Compose and manage announcements for all users.", icon: MessageSquare, route: "/admin?tab=feed", stepCount: 3, category: "Admin" },
  { tourKey: "admin-access-control", title: "RBAC", description: "Role-based access control matrix and permission management.", icon: Shield, route: "/admin?tab=access-control", stepCount: 4, category: "Admin" },
  { tourKey: "admin-audit-log", title: "Audit Log", description: "Track all role and permission changes with timestamps.", icon: History, route: "/admin?tab=audit-log", stepCount: 3, category: "Admin" },
  { tourKey: "admin-settings", title: "Admin Settings", description: "UI settings, volume configuration, and system controls.", icon: Settings, route: "/admin?tab=settings", stepCount: 10, category: "Admin" },
  { tourKey: "feedback-page", title: "Feedback Management", description: "Search, filter, and manage feedback with dual-status workflow.", icon: MessageSquare, route: "/feedback", stepCount: 5, category: "Feedback" },
  { tourKey: "checklist", title: "Positions Checklist", description: "Real-time FTE gap summary drawer with shortage/surplus tabs.", icon: LayoutDashboard, route: "", stepCount: 4, category: "Overlays", isOverlay: true },
  { tourKey: "ai-hub", title: "AI Hub", description: "AI-powered staffing assistant for questions and analysis.", icon: Sparkles, route: "", stepCount: 4, category: "Overlays", isOverlay: true },
  { tourKey: "feedback", title: "Feedback Panel", description: "Submit feedback with screenshots from anywhere in the app.", icon: MessageSquare, route: "", stepCount: 3, category: "Overlays", isOverlay: true },
  { tourKey: "header", title: "Header Bar", description: "Global search, notifications, theme toggle, and user menu.", icon: Navigation, route: "", stepCount: 4, category: "Overlays", isOverlay: true },
];

const categories = ["Staffing", "Positions", "Admin", "Feedback", "Overlays"];

export function UserGuidesTab() {
  const navigate = useNavigate();
  const { startTour } = useTourStore();
  const [, setRefresh] = useState(0);

  const isCompleted = (tourKey: string) =>
    localStorage.getItem(`helix-tour-${tourKey}-completed`) === "true";

  const handleStartTour = (guide: Guide) => {
    // For overlay tours, open the corresponding panel first
    if (guide.tourKey === "checklist") useWorkforceDrawerStore.getState().setOpen(true);
    if (guide.tourKey === "ai-hub") useAIHub.getState().setOpen(true);
    if (guide.tourKey === "feedback") useFeedbackStore.getState().setOpen(true);

    if (guide.route) {
      navigate(guide.route);
    }
    setTimeout(() => startTour(guide.tourKey), 300);
  };

  const handleReset = (tourKey: string) => {
    localStorage.removeItem(`helix-tour-${tourKey}-completed`);
    setRefresh((r) => r + 1);
  };

  return (
    <Tabs defaultValue="Staffing">
      <TabsList className="w-full">
        {categories.map((cat) => (
          <TabsTrigger key={cat} value={cat} className="flex-1">
            {cat}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => {
        const guides = guideCatalog.filter((g) => g.category === category);
        return (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map((guide) => {
                const completed = isCompleted(guide.tourKey);
                const Icon = guide.icon;
                return (
                  <div
                    key={guide.tourKey}
                    className="relative bg-shell-elevated rounded-lg p-5 border border-shell-elevated hover:shadow-medium transition-all group"
                  >
                    {completed && (
                      <Badge
                        variant="outline"
                        className="absolute top-3 right-3 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700 gap-1 text-[10px]"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Done
                      </Badge>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground leading-tight">
                          {guide.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {guide.stepCount} steps
                          {guide.isOverlay && " · Overlay"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-shell-muted mb-4 line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleStartTour(guide)}
                      >
                        <Play className="h-3 w-3" />
                        {guide.isOverlay ? "Start Tour" : "Go & Start"}
                      </Button>
                      {completed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-muted-foreground"
                          onClick={() => handleReset(guide.tourKey)}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
