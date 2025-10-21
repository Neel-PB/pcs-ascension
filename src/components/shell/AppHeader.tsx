import { useState } from "react";
import { Search, Bell, User, Sun, Moon, Monitor, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
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
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const resolveAvatarUrl = (avatar_url?: string, first_name?: string, last_name?: string) => {
    if (avatar_url) {
      if (avatar_url.startsWith('http')) {
        return avatar_url;
      } else {
        return supabase.storage.from('avatars').getPublicUrl(avatar_url).data.publicUrl;
      }
    }
    const initials = `${first_name?.[0] || ''}${last_name?.[0] || ''}`.toUpperCase();
    return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=6366f1&color=ffffff`;
  };

  const userInitials = user?.user_metadata?.first_name?.[0] + user?.user_metadata?.last_name?.[0] || 'U';
  const userName = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'User';
  const userEmail = user?.email || '';

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    if (theme === "system") return <Monitor className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <div className="flex w-full items-center justify-between">
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
              placeholder="Search employees, contractors, or requisitions... (⌘K)"
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
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold"
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

          {/* Theme Selector */}
          <Button variant="ghost" size="icon" onClick={cycleTheme}>
            {getThemeIcon()}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-auto px-2 py-1.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={resolveAvatarUrl(user.user_metadata?.avatar_url, user.user_metadata?.first_name, user.user_metadata?.last_name)} 
                      alt={userName} 
                    />
                    <AvatarFallback className="bg-gradient-primary text-white text-sm font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
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
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}