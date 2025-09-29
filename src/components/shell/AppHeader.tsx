import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, HelpCircle, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { collapsed, toggle } = useSidebar();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <motion.header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-shell-line bg-shell/95 backdrop-blur supports-[backdrop-filter]:bg-shell/60"
      style={{
        paddingLeft: collapsed ? "96px" : "296px", // Account for sidebar width
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Left Section - Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <motion.h1
            className="text-xl font-semibold text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            Position Control System
          </motion.h1>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl mx-8">
          <motion.div
            className="relative"
            animate={{ width: searchFocused ? "100%" : "400px" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-shell-muted" />
            <Input
              type="search"
              placeholder="Search employees, projects, or actions... (⌘K)"
              className={cn(
                "pl-10 pr-4 bg-shell-elevated border-shell-line",
                "focus:bg-shell focus:border-primary/20 focus:ring-primary/20",
                "transition-all duration-200"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </motion.div>
        </div>

        {/* Right Section - Utilities */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-shell-elevated">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Position Filled</p>
                    <p className="text-xs text-shell-muted">
                      ICU Registered Nurse position has been successfully filled
                    </p>
                    <p className="text-xs text-shell-subtle">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-shell-elevated">
                  <div className="h-2 w-2 rounded-full bg-warning mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Overtime Alert</p>
                    <p className="text-xs text-shell-muted">
                      Sarah Johnson is approaching 40-hour overtime limit
                    </p>
                    <p className="text-xs text-shell-subtle">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-shell-elevated">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">New Requisition</p>
                    <p className="text-xs text-shell-muted">
                      Emergency Department submitted request for 2 RN positions
                    </p>
                    <p className="text-xs text-shell-subtle">30 minutes ago</p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-white">JD</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-shell-muted">
                    john.doe@hospital.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}