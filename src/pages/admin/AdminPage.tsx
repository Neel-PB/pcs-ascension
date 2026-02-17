import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { Shield } from "@/lib/icons";
import { useRBAC } from "@/hooks/useRBAC";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UsersManagement from "./UsersManagement";
import AccessControlPage from "./AccessControlPage";
import RBACAuditLog from "./RBACAuditLog";
import { FeedComposer } from "@/components/messaging/FeedComposer";
import { FeedHistory } from "@/components/feed/FeedHistory";
import { Button } from "@/components/ui/button";
import { VolumeOverrideSettings } from "@/components/admin/VolumeOverrideSettings";
import { UISettings } from "@/components/admin/UISettings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminTour } from "@/components/tour/AdminTour";

export default function AdminPage() {
  const { hasPermission, loading } = useRBAC();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["users", "feed", "access-control", "audit-log", "settings"];

  const [activeTab, setActiveTab] = useState(
    tabParam && validTabs.includes(tabParam) ? tabParam : "users"
  );
  const [grantingAccess, setGrantingAccess] = useState(false);

  useEffect(() => {
    if (tabParam) setSearchParams({}, { replace: true });
  }, []);

  const tabs = [
    { id: "users", label: "Users" },
    { id: "feed", label: "Feed" },
    { id: "access-control", label: "RBAC" },
    { id: "audit-log", label: "Audit Log" },
    { id: "settings", label: "Settings" },
  ];

  const handleGrantAdminAccess = async () => {
    setGrantingAccess(true);
    try {
      const { data, error } = await supabase.functions.invoke('grant-admin-role');
      
      if (error) throw error;

      toast.success("Admin access granted. Refreshing...");

      // Refresh the page to update permissions
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error granting admin access:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to grant admin access: ${errorMessage}`);
    } finally {
      setGrantingAccess(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!hasPermission("admin.access")) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
        <Button
          onClick={handleGrantAdminAccess}
          disabled={grantingAccess}
        >
          {grantingAccess ? "Granting Access..." : "Unlock Admin Access"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-6">
      <AdminTour activeTab={activeTab} />
      <div className="flex justify-center shrink-0" data-tour="admin-tabs">
        <ToggleButtonGroup
          items={tabs}
          activeId={activeTab}
          onSelect={setActiveTab}
          layoutId="adminToggle"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "users" && <UsersManagement />}
        
        {activeTab === "feed" && (
          <div className="space-y-6">
            <div data-tour="admin-feed-composer">
              <FeedComposer />
            </div>
            <div data-tour="admin-feed-history">
              <FeedHistory />
            </div>
          </div>
        )}
        
        {activeTab === "access-control" && <AccessControlPage />}

        {activeTab === "audit-log" && <RBACAuditLog />}
        
        {activeTab === "settings" && (
          <Tabs defaultValue="ui-settings" className="space-y-6">
            <TabsList className="w-full" data-tour="admin-settings-tabs">
              <TabsTrigger value="ui-settings" className="flex-1">UI Settings</TabsTrigger>
              <TabsTrigger value="volume-config" className="flex-1">Volume Config</TabsTrigger>
            </TabsList>
            
            <div data-tour="admin-settings-content">
              <TabsContent value="ui-settings" className="mt-0">
                <UISettings />
              </TabsContent>
              
              <TabsContent value="volume-config" className="mt-0">
                <VolumeOverrideSettings />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}
