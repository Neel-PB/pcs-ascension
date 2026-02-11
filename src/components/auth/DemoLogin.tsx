import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Crown, Building2, UserCog, Briefcase, Loader2 } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { MANAGEABLE_ROLES, ROLE_METADATA, type AppRole } from "@/config/rbacConfig";

// Demo credentials for each role
const DEMO_CREDENTIALS: Record<string, { email: string; password: string }> = {
  admin: { email: "demo.admin@ascension.org", password: "demo123" },
  labor_team: { email: "demo.labor@ascension.org", password: "demo123" },
  leadership: { email: "demo.leadership@ascension.org", password: "demo123" },
  cno: { email: "demo.cno@ascension.org", password: "demo123" },
  director: { email: "demo.director@ascension.org", password: "demo123" },
  manager: { email: "demo.manager@ascension.org", password: "demo123" },
};

// Icons for each role
const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  labor_team: Users,
  leadership: Crown,
  cno: Building2,
  director: UserCog,
  manager: Briefcase,
};

export default function DemoLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleDemoLogin = async (role: string) => {
    const credentials = DEMO_CREDENTIALS[role];
    if (!credentials) return;

    setLoadingRole(role);
    try {
      const { error } = await signIn(credentials.email, credentials.password);
      if (!error) {
        navigate("/");
      }
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Demo Access</CardTitle>
        </div>
        <CardDescription>
          Quick access for testing and demonstration purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {MANAGEABLE_ROLES.map((role) => {
            const Icon = ROLE_ICONS[role] || ShieldCheck;
            const metadata = ROLE_METADATA[role];
            const isLoading = loadingRole === role;
            
            return (
              <Button
                key={role}
                onClick={() => handleDemoLogin(role)}
                disabled={loadingRole !== null}
                variant="outline"
                className="h-auto flex-col items-start p-3 gap-1 w-full overflow-hidden"
              >
                <div className="flex items-start gap-2 w-full min-w-0">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4 shrink-0" />
                  )}
                  <span className="font-medium whitespace-normal break-words leading-snug">
                    {metadata.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground text-left break-words whitespace-normal w-full">
                  {metadata.description}
                </span>
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          All demo accounts use password: demo123
        </p>
      </CardContent>
    </Card>
  );
}
