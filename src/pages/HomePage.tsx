import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { MessageHistory } from "@/components/messaging/MessageHistory";
import { DataRefreshPanel } from "@/components/dashboard/DataRefreshPanel";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { hasRole, loading: rolesLoading } = useRBAC();

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || rolesLoading) {
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

  const isAdmin = hasRole("admin");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gradient">Position Control Dashboard</h1>
        <p className="text-shell-muted">
          Welcome back, {user.user_metadata?.first_name}! {isAdmin ? "Send messages to your team." : "Check your notifications for updates."}
        </p>
      </motion.div>

      {/* Main Content */}
      {isAdmin ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Messaging Section - Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <MessageComposer />
            <MessageHistory />
          </div>

          {/* Data Refresh Panel - Right Column */}
          <div className="lg:col-span-1">
            <DataRefreshPanel />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl">
          <DataRefreshPanel />
        </div>
      )}
    </div>
  );
}