import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { Badge } from "@/components/ui/badge";
import { ROLE_METADATA, type AppRole } from "@/config/rbacConfig";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AvatarUploadCrop } from "./AvatarUploadCrop";
import { Pencil } from "lucide-react";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserProfileModal({ open, onOpenChange, userId }: UserProfileModalProps) {
  const { profile, roles, orgAccess, hasUnrestrictedAccess, isLoading } = useUserProfile(userId);
  const { user } = useAuth();
  const { hasRole } = useRBAC();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  const canEditAvatar = user?.id === userId || hasRole('admin');

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Avatar and Personal Information */}
          <div className="flex gap-4">
            {/* Large Avatar */}
            <div className="flex-shrink-0 relative group">
              <Avatar 
                className="h-24 w-24 cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => canEditAvatar && setUploadModalOpen(true)}
              >
                {profile?.avatar_url ? (
                  <AvatarImage 
                    src={profile.avatar_url} 
                    alt={`${profile.first_name} ${profile.last_name}`} 
                  />
                ) : (
                  <AvatarFallback className="text-lg">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              {canEditAvatar && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setUploadModalOpen(true)}
                >
                  <Pencil className="h-6 w-6 text-foreground" />
                </div>
              )}
            </div>
            
            {/* Info Rows */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-right">
                  {profile?.first_name} {profile?.last_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium text-right break-all">{profile?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Job Title</span>
                <span className="text-sm font-medium text-right">
                  {profile?.job_title || <span className="text-muted-foreground italic">Not Set</span>}
                </span>
              </div>
            </div>
          </div>

          {/* User Roles */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">User Roles</h3>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <Badge
                    key={role}
                    variant={role === 'admin' ? 'default' : 'secondary'}
                  >
                    {ROLE_METADATA[role as AppRole]?.label || role}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">No roles assigned</span>
              )}
            </div>
          </div>

          {/* Organizational Access */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Organizational Access</h3>
            <Separator />
            
            {hasUnrestrictedAccess ? (
              <div className="py-2">
                <p className="text-sm text-muted-foreground">
                  Access to all regions, facilities, and departments
                </p>
              </div>
            ) : orgAccess ? (
              <div className="space-y-4">
                {/* Markets */}
                {orgAccess.markets.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Markets</h4>
                    <div className="flex flex-wrap gap-1">
                      {orgAccess.markets.map((market) => (
                        <span key={market} className="text-sm bg-muted px-2 py-0.5 rounded">
                          {market}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Facilities */}
                {orgAccess.facilities.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Facilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {orgAccess.facilities.map((facility) => (
                        <span key={facility.facilityId} className="text-sm bg-muted px-2 py-0.5 rounded">
                          {facility.facilityName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Departments */}
                {orgAccess.departments.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Departments</h4>
                    <div className="flex flex-wrap gap-1">
                      {orgAccess.departments.map((dept) => (
                        <span key={dept.departmentId} className="text-sm bg-muted px-2 py-0.5 rounded">
                          {dept.departmentName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* No restrictions found despite having orgAccess object */}
                {orgAccess.markets.length === 0 && orgAccess.facilities.length === 0 && orgAccess.departments.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No specific access restrictions
                  </p>
                )}
              </div>
            ) : (
              <div className="py-2">
                <p className="text-sm text-muted-foreground italic">
                  No specific access restrictions
                </p>
              </div>
            )}
          </div>
        </div>
        
        <AvatarUploadCrop
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          userId={userId}
          currentAvatarUrl={profile?.avatar_url}
        />
      </DialogContent>
    </Dialog>
  );
}
