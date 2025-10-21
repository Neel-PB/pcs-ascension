import {
  ChevronsUpDown,
  LogOut,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function NavUser() {
  const { isMobile } = useSidebar();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const userName = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'User';
  const userEmail = user?.email || '';
  const userInitials = user?.user_metadata?.first_name?.[0] + user?.user_metadata?.last_name?.[0] || 'U';
  const avatarUrl = resolveAvatarUrl(user?.user_metadata?.avatar_url, user?.user_metadata?.first_name, user?.user_metadata?.last_name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback className="rounded-lg bg-gradient-primary text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={userName} />
                  <AvatarFallback className="rounded-lg bg-gradient-primary text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
