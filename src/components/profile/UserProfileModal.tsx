import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserProfileModal({ open, onOpenChange, userId }: UserProfileModalProps) {
  const { profile, roles, orgAccess, hasUnrestrictedAccess, isLoading } = useUserProfile(userId);

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
          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-right">
                  {profile?.first_name} {profile?.last_name}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium text-right break-all">{profile?.email}</span>
              </div>
              <div className="flex justify-between items-start">
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
                    {role === 'admin' ? 'Admin' : 'Labor Team'}
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
            ) : orgAccess && orgAccess.markets.length > 0 ? (
              <div className="space-y-4">
                {orgAccess.markets.map((market) => (
                  <div key={market.market} className="space-y-2">
                    <h4 className="text-sm font-medium">{market.market}</h4>
                    {market.facilities.length > 0 ? (
                      <div className="pl-4 space-y-3">
                        {market.facilities.map((facility) => (
                          <div key={facility.facilityId} className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              • {facility.facilityName}
                            </p>
                            {facility.departments.length > 0 && (
                              <div className="pl-6 space-y-1">
                                {facility.departments.map((dept) => (
                                  <p key={dept.departmentId} className="text-xs text-muted-foreground">
                                    - {dept.departmentName}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="pl-4 text-sm text-muted-foreground italic">
                        All facilities in this market
                      </p>
                    )}
                  </div>
                ))}
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
      </DialogContent>
    </Dialog>
  );
}
