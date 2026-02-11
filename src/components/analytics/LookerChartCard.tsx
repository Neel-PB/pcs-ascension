import { ReactNode } from "react";
import { MoreVertical } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface LookerChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const LookerChartCard = ({ title, subtitle, children }: LookerChartCardProps) => {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
