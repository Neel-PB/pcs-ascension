import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShellLayout } from "@/components/shell/ShellLayout";
import HomePage from "./pages/HomePage";
import StaffingSummary from "./pages/staffing/StaffingSummary";
import AnalyticsRegion from "./pages/analytics/AnalyticsRegion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ShellLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/staffing" element={<StaffingSummary />} />
            <Route path="/analytics" element={<AnalyticsRegion />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ShellLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
