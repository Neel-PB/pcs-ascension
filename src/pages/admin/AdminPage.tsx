import { useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { Shield, Upload, Users, Lock, Settings, MessageSquare } from "lucide-react";
import { ContentCard } from "@/components/shell/ContentCard";
import { useRBAC } from "@/hooks/useRBAC";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DataImportPage from "./DataImportPage";
import UsersManagement from "./UsersManagement";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { MessageHistory } from "@/components/messaging/MessageHistory";

export default function AdminPage() {
  const { hasPermission, loading } = useRBAC();
  const [activeTab, setActiveTab] = useState("data-import");
  const [grantingAccess, setGrantingAccess] = useState(false);

  const tabs = [
    { id: "data-import", label: "Data Import", icon: Upload },
    { id: "users", label: "Users", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "permissions", label: "Permissions", icon: Lock },
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
      <ContentCard title="Admin Panel" icon={Shield}>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ContentCard>
    );
  }

  if (!hasPermission("admin.access")) {
    return (
      <ContentCard title="Access Denied" icon={Shield}>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <button
            onClick={handleGrantAdminAccess}
            disabled={grantingAccess}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {grantingAccess ? "Granting Access..." : "Unlock Admin Access"}
          </button>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard title="Admin Panel" icon={Shield}>
      <LayoutGroup>
        <div className="relative bg-secondary rounded-lg p-1 mb-6">
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
          
          {activeTab === "messages" && (
            <div className="space-y-6">
              <MessageComposer />
              <MessageHistory />
            </div>
          )}
          
          {activeTab === "roles" && (
            <div className="py-8 text-center text-muted-foreground">
              Role management coming soon...
            </div>
          )}
          
          {activeTab === "permissions" && (
            <div className="py-8 text-center text-muted-foreground">
              Permission management coming soon...
            </div>
          )}
          
          {activeTab === "settings" && (
            <div className="py-8 text-center text-muted-foreground">
              Admin settings coming soon...
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </ContentCard>
  );
}
