import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicIconOnlySidebar } from "../layout/DynamicIconOnlySidebar";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";

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
  return (
    <div className="min-h-screen bg-background">
      <DynamicIconOnlySidebar />
      <AppHeader />
      
      <main className="ml-20 mt-16">
        <div className="px-4 py-4">
          {children}
        </div>
      </main>
    </div>
  );
}