import { useState, useEffect } from "react";
import { Search, Bell, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { GlobalSearchCommand } from "@/components/shell/GlobalSearchCommand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [commandOpen, setCommandOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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
    <header className="fixed top-0 z-40 flex items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ left: 'var(--sidebar-width)', right: 0, height: 'var(--header-height)' }}>
      <div className="flex w-full items-center justify-between px-6" style={{ height: 'var(--header-height)' }}>
        {/* Left Section - Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            Position Control System
          </h1>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <GlobalSearchCommand open={commandOpen} onOpenChange={setCommandOpen}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-shell-muted pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search..."
                className={cn(
                  "pl-10 pr-4 bg-shell-elevated border-shell-line cursor-pointer w-full",
                  "hover:bg-shell hover:border-primary/20",
                  "transition-all duration-200"
                )}
                readOnly
              />
            </div>
          </GlobalSearchCommand>
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
                <DropdownMenuItem onSelect={() => setProfileModalOpen(true)}>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {user && (
        <UserProfileModal
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
          userId={user.id}
        />
      )}

    </header>
  );
}