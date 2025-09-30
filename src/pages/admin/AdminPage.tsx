import { useState } from "react";
import { Shield, Upload, Users, Lock, Settings } from "lucide-react";
import { ContentCard } from "@/components/shell/ContentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRBAC } from "@/hooks/useRBAC";
import DataImportPage from "./DataImportPage";

export default function AdminPage() {
  const { hasPermission, loading } = useRBAC();
  const [activeTab, setActiveTab] = useState("data-import");

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
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard title="Admin Panel" icon={Shield}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="data-import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Data Import
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-import">
          <DataImportPage />
        </TabsContent>

        <TabsContent value="users">
          <div className="py-8 text-center text-muted-foreground">
            User management coming soon...
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <div className="py-8 text-center text-muted-foreground">
            Role management coming soon...
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="py-8 text-center text-muted-foreground">
            Permission management coming soon...
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="py-8 text-center text-muted-foreground">
            Admin settings coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </ContentCard>
  );
}
