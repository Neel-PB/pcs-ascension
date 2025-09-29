import { useState } from "react";
import { Search, Bell, HelpCircle, User } from "lucide-react";
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
import { cn } from "@/lib/utils";

export function AppHeader() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="fixed top-0 left-36 right-0 z-40 h-16 flex items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-6">
        {/* Left Section - Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            Position Control System
          </h1>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
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
          </div>
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
    </header>
  );
}