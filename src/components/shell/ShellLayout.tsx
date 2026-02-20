import { useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicIconOnlySidebar } from "../layout/DynamicIconOnlySidebar";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { LogoLoader } from "@/components/ui/LogoLoader";

// Content area loader - shows in main content while keeping shell visible
const ContentLoader = () => (
  <div className="flex items-center justify-center h-full">
    <LogoLoader size="md" variant="default" />
  </div>
);

interface ShellLayoutProps {
  children: React.ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-background w-full overflow-hidden flex items-center justify-center">
        <LogoLoader size="lg" variant="default" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-shell-elevated w-full overflow-hidden">
      <DynamicIconOnlySidebar />
      <AppHeader />
      
      <main 
        className="px-6 py-4 bg-shell-elevated overflow-y-auto overflow-x-hidden" 
        style={{ 
          marginLeft: 'var(--sidebar-width)', 
          marginTop: 'var(--header-height)',
          height: 'calc(100vh - var(--header-height))'
        }}
      >
        <Suspense fallback={<ContentLoader />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
