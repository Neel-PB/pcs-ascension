import { DynamicIconOnlySidebar } from "../layout/DynamicIconOnlySidebar";
import { AppHeader } from "./AppHeader";

interface ShellLayoutProps {
  children: React.ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
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