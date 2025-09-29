import { motion } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useSidebar } from "@/hooks/use-sidebar";

interface ShellLayoutProps {
  children: React.ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-shell">
      <AppSidebar />
      <AppHeader />
      
      <motion.main
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: collapsed ? "80px" : "280px",
        }}
      >
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {children}
        </div>
      </motion.main>
    </div>
  );
}