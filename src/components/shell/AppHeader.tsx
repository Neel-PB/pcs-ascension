import { useState, useEffect } from "react";
import { Bell, Sun, Moon, Monitor } from "@/lib/icons";
import { useTheme } from "next-themes";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { GlobalSearchCommand } from "@/components/shell/GlobalSearchCommand";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
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
import { HelpCircle, Navigation, Play, List } from "@/lib/icons";
import { useTourStore } from "@/stores/useTourStore";

import { HeaderTour } from "@/components/tour/HeaderTour";
import { TourLauncher } from "@/components/tour/TourLauncher";
import { APP_TOUR_SEQUENCE } from "@/components/tour/tourConfig";

export function AppHeader() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tourLauncherOpen, setTourLauncherOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile(user?.id);
  const { data: notifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { startSingleTour, startFullTour } = useTourStore();
  const [searchParams] = useSearchParams();

  const handleTourThisPage = () => {
    const path = location.pathname.replace('/', '') || 'staffing';
    const tab = searchParams.get('tab');
    // Find the matching tour key for the current page/tab
    const match = APP_TOUR_SEQUENCE.find(s => {
      const sPage = s.page?.replace('/', '') || '';
      if (sPage === path) {
        if (s.tab && tab) return s.tab === tab;
        if (!s.tab && !tab) return true;
        // Default to first tab on the page
        return !tab && APP_TOUR_SEQUENCE.filter(x => x.page?.replace('/', '') === path)[0] === s;
      }
      return false;
    });
    if (match) {
      localStorage.removeItem(`helix-tour-${match.tourKey}-completed`);
      startSingleTour(match.tourKey);
    } else {
      // Fallback: start the first tour for this page
      const firstOnPage = APP_TOUR_SEQUENCE.find(s => s.page?.replace('/', '') === path);
      if (firstOnPage) {
        localStorage.removeItem(`helix-tour-${firstOnPage.tourKey}-completed`);
        startSingleTour(firstOnPage.tourKey);
      }
    }
  };

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

  const userInitials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}` || 'U';
  const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User';
  const userEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url;

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "dark") return <Moon className="h-6 w-6" />;
    if (theme === "system") return <Monitor className="h-6 w-6" />;
    return <Sun className="h-6 w-6" />;
  };

  const handleSignOut = async () => {
    await signOut(queryClient);
    // Navigate after a brief delay to ensure all auth state changes have propagated
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 100);
  };

  return (
    <>
    <header className="fixed top-0 z-40 flex items-center bg-background shadow-soft" style={{ left: 'var(--sidebar-width)', right: 0, height: 'var(--header-height)' }}>
      <div className="flex w-full items-center justify-between px-6" style={{ height: 'var(--header-height)' }}>
        {/* Left Section - Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            Position Control System
          </h1>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8" data-tour="header-search">
          <div onClick={() => setCommandOpen(true)}>
            <SearchField
              placeholder="Search..."
              className="w-full cursor-pointer"
              readOnly
            />
          </div>
          <GlobalSearchCommand open={commandOpen} onOpenChange={setCommandOpen} />
        </div>

        {/* Right Section - Utilities */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative" 
            onClick={() => setNotificationsOpen(true)}
            data-tour="header-notifications"
          >
            <Bell className="h-6 w-6" />
            {notifications && notifications.filter(n => !n.read).length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold"
              >
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Theme Selector */}
          <Button variant="ghost" size="icon" onClick={cycleTheme} data-tour="header-theme">
            {getThemeIcon()}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-auto px-2 py-1.5" data-tour="header-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={avatarUrl || undefined} 
                      alt={userName} 
                    />
                    <AvatarFallback className="text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[210px]" align="end" forceMount>
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
                <DropdownMenuItem onSelect={handleTourThisPage}>
                  <Play className="h-4 w-4 mr-2" />
                  <span>Tour This Page</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  startFullTour();
                  navigate('/staffing?tab=summary&tour=true');
                }}>
                  <Navigation className="h-4 w-4 mr-2" />
                  <span>Full Guided Tour</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTourLauncherOpen(true)}>
                  <List className="h-4 w-4 mr-2" />
                  <span>All Tours</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/support')}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span>View All Guides</span>
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

    {/* Notification Panel - Outside header to avoid z-index issues */}
    <NotificationPanel 
      open={notificationsOpen}
      onOpenChange={setNotificationsOpen}
    />
    <HeaderTour />
    <TourLauncher open={tourLauncherOpen} onOpenChange={setTourLauncherOpen} />
    </>
  );
}