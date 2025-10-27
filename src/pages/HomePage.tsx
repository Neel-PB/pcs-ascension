import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UnifiedEmployeeFeed } from "@/components/feed/UnifiedEmployeeFeed";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gradient">Position Control Dashboard</h1>
      </motion.div>

      {/* Main Content - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Employee Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <UnifiedEmployeeFeed />
        </div>

        {/* Notification Panel - Takes 1 column */}
        <div className="lg:col-span-1">
          <NotificationPanel />
        </div>
      </div>
    </div>
  );
}