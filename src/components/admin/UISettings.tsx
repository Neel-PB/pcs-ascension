import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUISettings, useUpdateUISettings, type UISettings as UISettingsType } from '@/hooks/useAppSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, Camera, Navigation } from '@/lib/icons';
import { Skeleton } from '@/components/ui/skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export function UISettings() {
  const { data: settings, isLoading } = useUISettings();
  const updateSettings = useUpdateUISettings();
  
  const [formData, setFormData] = useState<UISettingsType>({
    showFeedbackTrigger: true,
    enableScreenshotCapture: true,
    showFeedbackNavigation: true,
  });
  
  // Sync form data with fetched settings
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);
  
  const handleToggle = (key: keyof UISettingsType) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  const handleSave = () => {
    updateSettings.mutate(formData);
  };
  
  const hasChanges = settings && (
    formData.showFeedbackTrigger !== settings.showFeedbackTrigger ||
    formData.enableScreenshotCapture !== settings.enableScreenshotCapture ||
    formData.showFeedbackNavigation !== settings.showFeedbackNavigation
  );
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px]" />
      </div>
    );
  }
  
  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold">UI Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure global visibility settings for feedback UI elements
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card data-tour="ui-settings-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Feedback System Visibility</CardTitle>
            <CardDescription className="text-xs">
              Control which feedback UI elements are visible to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show Feedback Trigger */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-muted">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Show Feedback Trigger</Label>
                  <p className="text-xs text-muted-foreground">
                    Display the floating feedback button on the right edge of the screen
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.showFeedbackTrigger}
                onCheckedChange={() => handleToggle('showFeedbackTrigger')}
              />
            </div>
            
            <Separator />
            
            {/* Enable Screenshot Capture */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-muted">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable Screenshot Capture</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow users to capture screen areas when submitting feedback
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.enableScreenshotCapture}
                onCheckedChange={() => handleToggle('enableScreenshotCapture')}
              />
            </div>
            
            <Separator />
            
            {/* Show Feedback Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-muted">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Show Feedback Navigation</Label>
                  <p className="text-xs text-muted-foreground">
                    Display the Feedback link in the sidebar navigation
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.showFeedbackNavigation}
                onCheckedChange={() => handleToggle('showFeedbackNavigation')}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <Button 
          data-tour="ui-settings-save"
          onClick={handleSave}
          disabled={!hasChanges || updateSettings.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
