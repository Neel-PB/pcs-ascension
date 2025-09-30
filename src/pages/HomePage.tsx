import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/shell/ContentCard";
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
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
        className="space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gradient">Position Control Dashboard</h1>
        <p className="text-shell-muted">
          Welcome back, {user.user_metadata?.first_name}! Stay connected with your team.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Positions"
          value="1,247"
          change={{ value: "+12 this week", type: "increase" }}
          icon={Users}
          delay={0.1}
        />
        <StatsCard
          title="Filled Positions"
          value="1,156"
          change={{ value: "+8 this week", type: "increase" }}
          icon={UserCheck}
          delay={0.2}
        />
        <StatsCard
          title="Open Requisitions"
          value="34"
          change={{ value: "-2 this week", type: "decrease" }}
          icon={AlertTriangle}
          delay={0.3}
        />
        <StatsCard
          title="Fill Rate"
          value="92.7%"
          change={{ value: "+1.2% this month", type: "increase" }}
          icon={TrendingUp}
          delay={0.4}
        />
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
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