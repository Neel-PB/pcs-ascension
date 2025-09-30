import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShellLayout } from "@/components/shell/ShellLayout";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import StaffingSummary from "./pages/staffing/StaffingSummary";
import AnalyticsRegion from "./pages/analytics/AnalyticsRegion";
import NotFound from "./pages/NotFound";

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
            <Route path="/" element={<ShellLayout><HomePage /></ShellLayout>} />
            <Route path="/staffing" element={<ShellLayout><StaffingSummary /></ShellLayout>} />
            <Route path="/analytics" element={<ShellLayout><AnalyticsRegion /></ShellLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<ShellLayout><NotFound /></ShellLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
