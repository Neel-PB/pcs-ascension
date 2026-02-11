import { useState, useMemo } from "react";
import {
  Users,
  UserCog,
  TrendingUp,
  FileBarChart,
  LifeBuoy,
  ShieldCheck,
  MessageSquare,
} from "@/lib/icons";
import type { LucideIcon } from "@/lib/icons";
import { useUISettings } from "./useAppSettings";

export interface DynamicMenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  permissions?: string[];
  badge?: string;
  isNew?: boolean;
}

export interface DynamicMenuGroup {
  label: string;
  icon: LucideIcon;
  items: DynamicMenuItem[];
}

export function useDynamicSidebar() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: uiSettings } = useUISettings();

  // Define the sidebar menu structure based on your current app
  const sidebarModules: DynamicMenuGroup[] = [
    {
      label: "Staffing",
      icon: Users,
      items: [
        { title: "Staffing Summary", url: "/staffing", icon: Users, permissions: ["staffing.access"] },
      ],
    },
    {
      label: "Positions",
      icon: UserCog,
      items: [
        { title: "Positions", url: "/positions", icon: UserCog, permissions: ["positions.access"] },
      ],
    },
    {
      label: "Analytics",
      icon: TrendingUp,
      items: [
        { title: "Analytics Region", url: "/analytics", icon: TrendingUp, permissions: ["analytics.access"] },
      ],
    },
    {
      label: "Reports",
      icon: FileBarChart,
      items: [
        { title: "Reports", url: "/reports", icon: FileBarChart, permissions: ["reports.access"] },
      ],
    },
    {
      label: "Support",
      icon: LifeBuoy,
      items: [
        { title: "Support", url: "/support", icon: LifeBuoy, permissions: ["support.access"] },
      ],
    },
    {
      label: "Admin",
      icon: ShieldCheck,
      items: [
        { title: "Admin Panel", url: "/admin", icon: ShieldCheck, permissions: ["admin.access"] },
      ],
    },
  ];

  // Bottom-pinned modules (separate from main nav) - conditionally include Feedback
  const bottomModules: DynamicMenuGroup[] = useMemo(() => {
    // Default to showing feedback if setting is undefined (not loaded yet)
    if (uiSettings?.showFeedbackNavigation === false) {
      return [];
    }
    return [
      {
        label: "Feedback",
        icon: MessageSquare,
        items: [
          { title: "Feedback", url: "/feedback", icon: MessageSquare, permissions: ["feedback.access"] },
        ],
      },
    ];
  }, [uiSettings?.showFeedbackNavigation]);

  return {
    sidebarModules,
    bottomModules,
    isLoading,
  };
}
