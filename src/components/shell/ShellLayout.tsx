import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface ShellLayoutProps {
  children: React.ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <AppHeader />
      
      <main className="ml-36 mt-16">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}