import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ShellLayout } from "@/components/shell/ShellLayout";
import AuthPage from "./pages/AuthPage";
import SetupPasswordPage from "./pages/SetupPasswordPage";
import StaffingSummary from "./pages/staffing/StaffingSummary";
import PositionsPage from "./pages/positions/PositionsPage";
import AnalyticsRegion from "./pages/analytics/AnalyticsRegion";
import ReportsRegion from "./pages/reports/ReportsRegion";
import SupportPage from "./pages/support/SupportPage";
import AdminPage from "./pages/admin/AdminPage";
import NotFound from "./pages/NotFound";
import { AIHubTrigger } from "./components/ai/AIHubTrigger";
import { AIHubPanel } from "./components/ai/AIHubPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/setup-password" element={<SetupPasswordPage />} />
            <Route path="/" element={<Navigate to="/staffing" replace />} />
            <Route path="/staffing" element={<ShellLayout><StaffingSummary /></ShellLayout>} />
            <Route path="/positions" element={<ShellLayout><PositionsPage /></ShellLayout>} />
            <Route path="/analytics" element={<ShellLayout><AnalyticsRegion /></ShellLayout>} />
            <Route path="/reports" element={<ShellLayout><ReportsRegion /></ShellLayout>} />
            <Route path="/support" element={<ShellLayout><SupportPage /></ShellLayout>} />
            <Route path="/admin" element={<ShellLayout><AdminPage /></ShellLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<ShellLayout><NotFound /></ShellLayout>} />
          </Routes>
          <AIHubTrigger />
          <AIHubPanel />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
