import { lazy, Suspense, useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ShellLayout } from "@/components/shell/ShellLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { useUISettings } from "@/hooks/useAppSettings";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTourStore } from "@/stores/useTourStore";
import { supabase } from "@/integrations/supabase/client";

// Lazy load all pages for code splitting
const AuthPage = lazy(() => import("./pages/AuthPage"));
const SetupPasswordPage = lazy(() => import("./pages/SetupPasswordPage"));
const StaffingSummary = lazy(() => import("./pages/staffing/StaffingSummary"));
const PositionsPage = lazy(() => import("./pages/positions/PositionsPage"));
const AnalyticsRegion = lazy(() => import("./pages/analytics/AnalyticsRegion"));
const ReportsRegion = lazy(() => import("./pages/reports/ReportsRegion"));
const SupportPage = lazy(() => import("./pages/support/SupportPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const FeedbackPage = lazy(() => import("./pages/feedback/FeedbackPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load heavy trigger components
const AIHubTrigger = lazy(() => import("./components/ai/AIHubTrigger").then(m => ({ default: m.AIHubTrigger })));
const AIHubPanel = lazy(() => import("./components/ai/AIHubPanel").then(m => ({ default: m.AIHubPanel })));
const FeedbackTrigger = lazy(() => import("./components/feedback/FeedbackTrigger").then(m => ({ default: m.FeedbackTrigger })));
const FeedbackPanel = lazy(() => import("./components/feedback/FeedbackPanel").then(m => ({ default: m.FeedbackPanel })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

// Full-page loading fallback
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <LogoLoader size="lg" variant="default" />
  </div>
);

const AppContent = () => {
  const { user, loading, mustChangePassword } = useAuth();
  const { hasPermission } = useRBAC();
  const { onboardingChecked, startFullTour, markOnboardingComplete, setOnboardingChecked } = useTourStore();
  
  // Set up consolidated realtime subscriptions (replaces multiple individual subscriptions)
  useRealtimeSubscriptions();
  
  const { data: uiSettings } = useUISettings();

  // Check onboarding status once after login
  useEffect(() => {
    if (!user || loading || onboardingChecked) return;

    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (data && !(data as any).onboarding_completed) {
        startFullTour();
        markOnboardingComplete(user.id);
      } else {
        setOnboardingChecked(true);
      }
    };

    const timer = setTimeout(checkOnboarding, 1500);
    return () => clearTimeout(timer);
  }, [user, loading, onboardingChecked, startFullTour, markOnboardingComplete, setOnboardingChecked]);

  const location = useLocation();

  // Force password change redirect
  if (!loading && user && mustChangePassword && location.pathname !== "/auth/setup-password") {
    return <Navigate to="/auth/setup-password" replace />;
  }

  return (
    <>
      <Routes>
        {/* Auth pages need their own Suspense since they don't use ShellLayout */}
        <Route path="/auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
        <Route path="/auth/setup-password" element={<Suspense fallback={<PageLoader />}><SetupPasswordPage /></Suspense>} />
        
        {/* Shell routes - ShellLayout handles its own Suspense for content */}
        <Route path="/" element={<Navigate to="/staffing" replace />} />
        <Route path="/staffing" element={<ShellLayout><StaffingSummary /></ShellLayout>} />
        <Route path="/positions" element={<ShellLayout><PositionsPage /></ShellLayout>} />
        <Route path="/analytics" element={<ShellLayout><AnalyticsRegion /></ShellLayout>} />
        <Route path="/reports" element={<ShellLayout><ReportsRegion /></ShellLayout>} />
        <Route path="/support" element={<ShellLayout><SupportPage /></ShellLayout>} />
        <Route path="/feedback" element={<ShellLayout><FeedbackPage /></ShellLayout>} />
        <Route path="/admin" element={<ShellLayout><AdminPage /></ShellLayout>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<ShellLayout><NotFound /></ShellLayout>} />
      </Routes>
      {!loading && user && !mustChangePassword && (
        <Suspense fallback={null}>
          {uiSettings?.showFeedbackTrigger !== false && <FeedbackTrigger enableScreenshotCapture={uiSettings?.enableScreenshotCapture !== false} />}
          {uiSettings?.showFeedbackTrigger !== false && <FeedbackPanel />}
          <AIHubTrigger />
          <AIHubPanel />
        </Suspense>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
