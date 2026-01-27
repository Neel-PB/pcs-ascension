import { useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { Shield, Upload, Users, Settings, MessageSquare, History } from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DataImportPage from "./DataImportPage";
import UsersManagement from "./UsersManagement";
import AccessControlPage from "./AccessControlPage";
import RBACAuditLog from "./RBACAuditLog";
import { FeedComposer } from "@/components/messaging/FeedComposer";
import { FeedHistory } from "@/components/feed/FeedHistory";
import { Button } from "@/components/ui/button";
import { VolumeOverrideSettings } from "@/components/admin/VolumeOverrideSettings";
import { UISettings } from "@/components/admin/UISettings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminPage() {
  const { hasPermission, loading } = useRBAC();
  const [activeTab, setActiveTab] = useState("data-import");
  const [grantingAccess, setGrantingAccess] = useState(false);

  const tabs = [
    { id: "data-import", label: "Data Import", icon: Upload },
    { id: "users", label: "Users", icon: Users },
    { id: "feed", label: "Feed", icon: MessageSquare },
    { id: "access-control", label: "Access Control", icon: Shield },
    { id: "audit-log", label: "Audit Log", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
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
    <div className="space-y-6">
      <LayoutGroup>
        <div className="relative bg-background rounded-lg p-1">
          <div className="flex">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                className={`relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors z-10 ${
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ flex: 1 }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </motion.button>
            ))}
            
            <motion.div
              layoutId="adminTabIndicator"
              className="absolute inset-y-1 bg-primary rounded-sm"
              style={{
                left: `${(tabs.findIndex((t) => t.id === activeTab) / tabs.length) * 100}%`,
                width: `${100 / tabs.length}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          </div>
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6 animate-fade-in"
        >
          {activeTab === "data-import" && <DataImportPage />}
          
          {activeTab === "users" && <UsersManagement />}
          
            {activeTab === "feed" && (
              <div className="space-y-6">
                <FeedComposer />
                <FeedHistory />
              </div>
            )}
          
          {activeTab === "access-control" && <AccessControlPage />}

          {activeTab === "audit-log" && <RBACAuditLog />}
          
          {activeTab === "settings" && (
            <Tabs defaultValue="ui-settings" className="space-y-6">
              <div className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ui-settings">UI Settings</TabsTrigger>
                  <TabsTrigger value="volume-config">Volume Config</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="ui-settings" className="mt-0">
                <UISettings />
              </TabsContent>
              
              <TabsContent value="volume-config" className="mt-0">
                <VolumeOverrideSettings />
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
