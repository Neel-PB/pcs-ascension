import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTourStore } from "@/stores/useTourStore";
import { useWorkforceDrawerStore } from "@/stores/useWorkforceDrawerStore";
import { useAIHub } from "@/hooks/useAIHub";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { TOUR_STEP_REGISTRY, getStepTitle } from "@/components/tour/tourStepRegistry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchField } from "@/components/ui/search-field";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BarChart3,
  Users,
  Settings,
  CheckCircle,
  Play,
  RotateCcw,
  Layers,
  MessageSquare,
  Sparkles,
  Navigation,
  Shield,
  History,
  Briefcase,
  ChevronRight,
} from "@/lib/icons";
import type { IconType } from "react-icons";

interface Guide {
  tourKey: string;
  title: string;
  description: string;
  icon: IconType;
  route: string;
  category: string;
  isOverlay?: boolean;
}

const guideCatalog: Guide[] = [
  { tourKey: "staffing", title: "Staffing Summary", description: "KPI cards, trend charts, definition views, and volume color indicators.", icon: BarChart3, route: "/staffing", category: "Staffing" },
  { tourKey: "staffing-planning", title: "Position Planning", description: "FTE skill-shift analysis with hired/active and nursing toggles.", icon: Layers, route: "/staffing?tab=planning", category: "Staffing" },
  { tourKey: "staffing-variance", title: "Variance Analysis", description: "FTE variance by skill type across your selected scope.", icon: BarChart3, route: "/staffing?tab=variance", category: "Staffing" },
  { tourKey: "staffing-forecast", title: "Forecast", description: "FTE shortage/surplus KPIs and expandable detail views.", icon: Navigation, route: "/staffing?tab=forecasts", category: "Staffing" },
  { tourKey: "staffing-volume-settings", title: "Volume Settings", description: "Override target volumes and manage expiration dates.", icon: Settings, route: "/staffing?tab=volume-settings", category: "Staffing" },
  { tourKey: "staffing-np-settings", title: "NP Settings", description: "Configure non-productive override percentages.", icon: Settings, route: "/staffing?tab=np-settings", category: "Staffing" },
  { tourKey: "positions-employees", title: "Employees", description: "Employee roster with Active FTE overrides and shift management.", icon: Users, route: "/positions", category: "Positions" },
  { tourKey: "positions-contractors", title: "Contractors", description: "Contractor roster with FTE and shift override controls.", icon: Briefcase, route: "/positions?tab=contractors", category: "Positions" },
  { tourKey: "positions-requisitions", title: "Open Positions", description: "Open requisitions with vacancy age tracking and comments.", icon: Users, route: "/positions?tab=requisitions", category: "Positions" },
  { tourKey: "admin-users", title: "Admin Users", description: "User management, roles, and access scope restrictions.", icon: Users, route: "/admin", category: "Admin" },
  { tourKey: "admin-feed", title: "Admin Feed", description: "Compose and manage announcements for all users.", icon: MessageSquare, route: "/admin?tab=feed", category: "Admin" },
  { tourKey: "admin-access-control", title: "RBAC", description: "Role-based access control matrix and permission management.", icon: Shield, route: "/admin?tab=access-control", category: "Admin" },
  { tourKey: "admin-audit-log", title: "Audit Log", description: "Track all role and permission changes with timestamps.", icon: History, route: "/admin?tab=audit-log", category: "Admin" },
  { tourKey: "admin-settings", title: "Admin Settings", description: "UI settings, volume configuration, and system controls.", icon: Settings, route: "/admin?tab=settings", category: "Admin" },
  { tourKey: "feedback-page", title: "Feedback Management", description: "Search, filter, and manage feedback with dual-status workflow.", icon: MessageSquare, route: "/feedback", category: "Feedback" },
  { tourKey: "checklist", title: "Positions Checklist", description: "Real-time FTE gap summary drawer with shortage/surplus tabs.", icon: BarChart3, route: "", category: "Overlays", isOverlay: true },
  { tourKey: "ai-hub", title: "AI Hub", description: "AI-powered staffing assistant for questions and analysis.", icon: Sparkles, route: "", category: "Overlays", isOverlay: true },
  { tourKey: "feedback", title: "Feedback Panel", description: "Submit feedback with screenshots from anywhere in the app.", icon: MessageSquare, route: "", category: "Overlays", isOverlay: true },
  { tourKey: "header", title: "Header Bar", description: "Global search, notifications, theme toggle, and user menu.", icon: Navigation, route: "", category: "Overlays", isOverlay: true },
];

const categories = ["Staffing", "Positions", "Admin", "Feedback", "Overlays"];

export function UserGuidesTab() {
  const navigate = useNavigate();
  const { startTour, startMicroTour } = useTourStore();
  const [, setRefresh] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { inputValue, debouncedValue, setInputValue } = useDebouncedSearch(200);

  const query = debouncedValue.toLowerCase().trim();

  const isCompleted = (tourKey: string) =>
    localStorage.getItem(`helix-tour-${tourKey}-completed`) === "true";

  const toggleExpanded = useCallback((tourKey: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(tourKey)) next.delete(tourKey);
      else next.add(tourKey);
      return next;
    });
  }, []);

  // Pre-compute step data and filtering
  const guidesWithSteps = useMemo(() => {
    return guideCatalog.map((guide) => {
      const steps = TOUR_STEP_REGISTRY[guide.tourKey] || [];
      const stepTitles = steps.map((s, i) => ({ title: getStepTitle(s), index: i }));
      const matchingStepIndices = query
        ? stepTitles.filter((s) => s.title.toLowerCase().includes(query)).map((s) => s.index)
        : [];
      const sectionMatch = query
        ? guide.title.toLowerCase().includes(query) || guide.description.toLowerCase().includes(query)
        : true;
      const visible = query ? sectionMatch || matchingStepIndices.length > 0 : true;
      return { guide, steps, stepTitles, matchingStepIndices, sectionMatch, visible };
    });
  }, [query]);

  const handleStartTour = (guide: Guide) => {
    if (guide.tourKey === "checklist") useWorkforceDrawerStore.getState().setOpen(true);
    if (guide.tourKey === "ai-hub") useAIHub.getState().setOpen(true);
    if (guide.tourKey === "feedback") useFeedbackStore.getState().setOpen(true);
    if (guide.route) navigate(guide.route);
    setTimeout(() => startTour(guide.tourKey), 300);
  };

  const handleMicroLaunch = (guide: Guide, stepIndex: number) => {
    if (guide.tourKey === "checklist") useWorkforceDrawerStore.getState().setOpen(true);
    if (guide.tourKey === "ai-hub") useAIHub.getState().setOpen(true);
    if (guide.tourKey === "feedback") useFeedbackStore.getState().setOpen(true);
    if (guide.route) navigate(guide.route);
    setTimeout(() => startMicroTour(guide.tourKey, stepIndex), 600);
  };

  const handleReset = (tourKey: string) => {
    localStorage.removeItem(`helix-tour-${tourKey}-completed`);
    setRefresh((r) => r + 1);
  };

  // Determine which categories have visible guides
  const visibleCategories = useMemo(
    () => categories.filter((cat) => guidesWithSteps.some((g) => g.guide.category === cat && g.visible)),
    [guidesWithSteps]
  );

  const defaultTab = visibleCategories[0] || "Staffing";

  return (
    <div className="space-y-4">
      <SearchField
        placeholder="Search tours and steps…"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onClear={() => setInputValue("")}
      />

      <Tabs defaultValue="Staffing" value={visibleCategories.length ? undefined : "Staffing"} key={defaultTab}>
        <TabsList className="w-full">
          {categories.map((cat) => {
            const hasResults = visibleCategories.includes(cat);
            return (
              <TabsTrigger
                key={cat}
                value={cat}
                className="flex-1"
                disabled={query !== "" && !hasResults}
              >
                {cat}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => {
          const categoryGuides = guidesWithSteps.filter(
            (g) => g.guide.category === category && g.visible
          );
          return (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="space-y-1">
                {categoryGuides.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No matching tours or steps.
                  </p>
                )}
                {categoryGuides.map(({ guide, stepTitles, matchingStepIndices }) => {
                  const completed = isCompleted(guide.tourKey);
                  const Icon = guide.icon;
                  const isExpanded =
                    expandedSections.has(guide.tourKey) ||
                    (query !== "" && matchingStepIndices.length > 0);

                  return (
                    <Collapsible
                      key={guide.tourKey}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(guide.tourKey)}
                    >
                      <div className="flex items-center gap-1">
                        {/* Expand chevron */}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                            <ChevronRight
                              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </Button>
                        </CollapsibleTrigger>

                        {/* Section row */}
                        <button
                          onClick={() => handleStartTour(guide)}
                          className="flex-1 flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                        >
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${
                              completed
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{guide.title}</span>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {guide.description}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-5 font-normal"
                          >
                            {stepTitles.length} steps
                          </Badge>
                          {completed && (
                            <Badge
                              variant="outline"
                              className="text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700 gap-1 text-[10px]"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Done
                            </Badge>
                          )}
                        </button>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button size="sm" className="gap-1 h-7 text-xs" onClick={() => handleStartTour(guide)}>
                            <Play className="h-3 w-3" />
                            {guide.isOverlay ? "Start" : "Go & Start"}
                          </Button>
                          {completed && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => handleReset(guide.tourKey)}
                              title="Reset tour"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expandable step list */}
                      <CollapsibleContent>
                        <div className="ml-8 border-l border-border pl-3 py-1 space-y-0.5">
                          {stepTitles.map(({ title, index }) => {
                            const isMatch =
                              query !== "" && matchingStepIndices.includes(index);
                            return (
                              <button
                                key={index}
                                onClick={() => handleMicroLaunch(guide, index)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                  isMatch
                                    ? "text-primary font-medium bg-primary/5 hover:bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                                }`}
                              >
                                {title}
                              </button>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
