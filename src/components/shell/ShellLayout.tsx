import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

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
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Sidebar skeleton */}
          <div className="flex h-screen w-[--sidebar-width] flex-col border-r bg-background">
            <div className="flex items-center justify-center p-4 border-b">
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <div className="flex-1 p-4 space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>

          <SidebarInset>
            {/* Header skeleton */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-[1px]" />
              <Skeleton className="h-6 w-48" />
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-10 w-96" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </header>

            {/* Content skeleton */}
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}