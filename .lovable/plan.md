
# Update Sign-In Page with Six Role-Based Demo Logins

## Overview

Replace the single "Login as Admin" demo button with six separate demo login buttons, one for each user role in the system. This allows testers and stakeholders to quickly experience the app from different role perspectives.

## Roles to Support

| Role | Display Label | Description |
|------|---------------|-------------|
| `admin` | Admin | Full system access |
| `labor_team` | Labor Management | Full access to all modules, filters, and settings |
| `leadership` | Leadership | All filters and sub-filters, no Admin/Feedback/Settings |
| `cno` | CNO | Chief Nursing Officer with configurable filter access |
| `director` | Director | Facility and department level access only |
| `manager` | Manager | Department level access only |

## Implementation Steps

### Step 1: Create Demo User Accounts (Database)

Create 6 demo users with corresponding profiles and role assignments:

**Users to create:**
- `demo.admin@ascension.org` → admin role
- `demo.labor@ascension.org` → labor_team role
- `demo.leadership@ascension.org` → leadership role
- `demo.cno@ascension.org` → cno role
- `demo.director@ascension.org` → director role
- `demo.manager@ascension.org` → manager role

All demo accounts will use the same password: `demo123`

**SQL Migration:**
```sql
-- Note: Users need to be created via Supabase Auth API (edge function)
-- Profile entries and role assignments will be created after user creation
```

### Step 2: Create Edge Function to Seed Demo Users

**File:** `supabase/functions/seed-demo-users/index.ts`

Create an edge function that can be called to create/reset demo users. This ensures:
- Demo users are created with proper auth credentials
- Profiles are populated
- Role assignments are made

### Step 3: Update DemoLogin Component

**File:** `src/components/auth/DemoLogin.tsx`

Transform from a single button to a grid of role-based login buttons:

```
┌─────────────────────────────────────────┐
│  Demo Access                            │
│  Quick access for testing purposes      │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Admin     │  │   Labor     │      │
│  │ Full access │  │ Full access │      │
│  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ Leadership  │  │    CNO      │      │
│  │ All filters │  │ Configurable│      │
│  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Director   │  │   Manager   │      │
│  │  Facility   │  │ Department  │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
```

**Code changes:**
- Import `MANAGEABLE_ROLES` and `ROLE_METADATA` from rbacConfig
- Define demo credentials mapping (role → email)
- Create a 2x3 grid of buttons with role icons
- Track loading state per role to show spinner on clicked button
- Show role description below each button

### Step 4: Update AuthPage Layout

**File:** `src/pages/AuthPage.tsx`

Adjust the layout to accommodate the larger demo login section:
- Change from 2-column grid to single column on smaller screens
- Allow the Demo section to span the full width when needed

## Detailed Code Changes

### File: `src/components/auth/DemoLogin.tsx`

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Crown, Building2, UserCog, Briefcase, Loader2 } from "lucide-react";
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
                className="h-auto flex-col items-start p-3 gap-1"
              >
                <div className="flex items-center gap-2 w-full">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="font-medium">{metadata.label}</span>
                </div>
                <span className="text-xs text-muted-foreground text-left line-clamp-2">
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
```

### Database Setup (via Edge Function)

An edge function `seed-demo-users` will be created to:
1. Create users via Supabase Admin API
2. Insert profile records
3. Assign roles in `user_roles` table

## Visual Design

- Each role button shows an icon, label, and brief description
- Buttons are arranged in a 2-column grid (3 rows)
- Loading state shows spinner on the clicked button while disabling others
- Consistent styling with existing demo card (gradient background, border)

## Testing Notes

After implementation, verify:
1. Each demo login button correctly authenticates
2. After login, the user sees appropriate UI restrictions based on role permissions
3. Sidebar navigation reflects role-specific module access
4. Filter visibility matches role permissions
