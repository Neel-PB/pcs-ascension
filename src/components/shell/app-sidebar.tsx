import * as React from "react";
import {
  Home,
  Users,
  UserCog,
  TrendingUp,
  FileBarChart,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";

import { NavMain } from "@/components/shell/nav-main";
import { NavUser } from "@/components/shell/nav-user";
import { SidebarLogo } from "@/components/shell/sidebar-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Staffing",
      url: "/staffing",
      icon: Users,
    },
    {
      title: "Positions",
      url: "/positions",
      icon: UserCog,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: TrendingUp,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileBarChart,
    },
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
  ],
  navAdmin: [
    {
      title: "Admin",
      url: "/admin",
      icon: ShieldCheck,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarSeparator className="mx-0" />
        <NavMain items={data.navAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
