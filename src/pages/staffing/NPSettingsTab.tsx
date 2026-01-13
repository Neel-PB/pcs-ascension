import { Settings2 } from "lucide-react";

export function NPSettingsTab() {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
      <Settings2 className="h-16 w-16 text-muted-foreground" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">NP Settings</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          NP Settings configuration will be available here.
        </p>
      </div>
    </div>
  );
}
