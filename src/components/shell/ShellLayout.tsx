import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicIconOnlySidebar } from "../layout/DynamicIconOnlySidebar";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="min-h-screen bg-background w-full">
        {/* Sidebar skeleton */}
        <div className="fixed left-0 top-0 z-50 h-screen border-r border-border bg-background" style={{ width: 'var(--sidebar-width)' }}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-center py-3 px-2 border-b border-border">
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <div className="flex-1 p-2 space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Header skeleton */}
        <div className="fixed top-0 right-0 z-40 border-b border-border bg-background" style={{ left: 'var(--sidebar-width)', height: 'var(--header-height)' }}>
          <div className="flex items-center justify-between px-6 h-full">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-96" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="px-4 py-4" style={{ marginLeft: 'var(--sidebar-width)', marginTop: 'var(--header-height)' }}>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <DynamicIconOnlySidebar />
      <AppHeader />
      
      <main className="px-4 py-4" style={{ marginLeft: 'var(--sidebar-width)', marginTop: 'var(--header-height)' }}>
        {children}
      </main>
    </div>
  );
}