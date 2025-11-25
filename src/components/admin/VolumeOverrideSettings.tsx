import { useState, useEffect } from 'react';
import { useVolumeOverrideConfig } from '@/hooks/useHistoricalVolumeAnalysis';
import { useUpdateVolumeOverrideConfig } from '@/hooks/useVolumeOverrideConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function VolumeOverrideSettings() {
  const { data: config, isLoading } = useVolumeOverrideConfig();
  const updateConfig = useUpdateVolumeOverrideConfig();
  
  const [formData, setFormData] = useState({
    min_months_for_target: 3,
    min_months_mandatory_override: 2,
    max_override_months_full_history: 12,
    fiscal_year_end_month: 6,
    fiscal_year_end_day: 30,
    enable_backfill: true,
    backfill_lookback_months: 24,
    min_volume_threshold: 0,
  });

  // Update form when config loads
  useEffect(() => {
    if (config) {
      setFormData({
        min_months_for_target: config.min_months_for_target,
        min_months_mandatory_override: config.min_months_mandatory_override,
        max_override_months_full_history: config.max_override_months_full_history,
        fiscal_year_end_month: config.fiscal_year_end_month,
        fiscal_year_end_day: config.fiscal_year_end_day,
        enable_backfill: config.enable_backfill,
        backfill_lookback_months: config.backfill_lookback_months,
        min_volume_threshold: config.min_volume_threshold,
      });
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Volume Override Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure rules for target volume vs override volume decision-making
        </p>
      </div>

      {/* Rule Matrix Preview - Collapsible, Full Width */}
      <Collapsible open={isMatrixOpen} onOpenChange={setIsMatrixOpen}>
        <Card className="bg-muted/30">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-base">Rule Matrix Preview</CardTitle>
                  <CardDescription className="text-xs">
                    How these settings affect override requirements
                  </CardDescription>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMatrixOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium">
                  <div>Historical Months</div>
                  <div>Target Volume</div>
                  <div>Override Status</div>
                  <div>Max Expiry</div>
                </div>
                <Separator />
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-4 gap-2 py-2">
                    <div className="font-medium">0-{formData.min_months_mandatory_override}</div>
                    <div className="text-muted-foreground">Not Available</div>
                    <div className="text-red-600 font-medium">Mandatory</div>
                    <div>{formData.max_override_months_full_history} months</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-2">
                    <div className="font-medium">{formData.min_months_for_target}-11</div>
                    <div className="text-green-600">Available</div>
                    <div className="text-blue-600 font-medium">Optional</div>
                    <div>12 - historical months</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-2">
                    <div className="font-medium">12+</div>
                    <div className="text-green-600">Available</div>
                    <div className="text-blue-600 font-medium">Optional</div>
                    <div>Next fiscal year end ({formData.fiscal_year_end_month}/{formData.fiscal_year_end_day})</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rule Thresholds - Compact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rule Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="min_months_for_target" className="text-sm">
                Min Months for Target
              </Label>
              <Input
                id="min_months_for_target"
                type="number"
                min={1}
                max={12}
                value={formData.min_months_for_target}
                onChange={(e) => setFormData({ ...formData, min_months_for_target: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Required months to calculate target (default: 3)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_months_mandatory_override" className="text-sm">
                Min Months for Mandatory Override
              </Label>
              <Input
                id="min_months_mandatory_override"
                type="number"
                min={0}
                max={12}
                value={formData.min_months_mandatory_override}
                onChange={(e) => setFormData({ ...formData, min_months_mandatory_override: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Below this requires override (default: 2)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_override_months" className="text-sm">
                Max Override Duration
              </Label>
              <Input
                id="max_override_months"
                type="number"
                min={1}
                max={24}
                value={formData.max_override_months_full_history}
                onChange={(e) => setFormData({ ...formData, max_override_months_full_history: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Max months for minimal history (default: 12)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fiscal, Volume & Backfill - Right Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fiscal, Volume & Backfill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fiscal_year_end_month" className="text-sm">
                  FY End Month
                </Label>
                <Input
                  id="fiscal_year_end_month"
                  type="number"
                  min={1}
                  max={12}
                  value={formData.fiscal_year_end_month}
                  onChange={(e) => setFormData({ ...formData, fiscal_year_end_month: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  1-12 (default: 6)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscal_year_end_day" className="text-sm">
                  FY End Day
                </Label>
                <Input
                  id="fiscal_year_end_day"
                  type="number"
                  min={1}
                  max={31}
                  value={formData.fiscal_year_end_day}
                  onChange={(e) => setFormData({ ...formData, fiscal_year_end_day: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  1-31 (default: 30)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_volume_threshold" className="text-sm">
                Minimum Volume Threshold
              </Label>
              <Input
                id="min_volume_threshold"
                type="number"
                min={0}
                step={0.1}
                value={formData.min_volume_threshold}
                onChange={(e) => setFormData({ ...formData, min_volume_threshold: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Below this is invalid (default: 0)
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 items-start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_backfill" className="text-sm">Enable Backfill</Label>
                  <Switch
                    id="enable_backfill"
                    checked={formData.enable_backfill}
                    onCheckedChange={(checked) => setFormData({ ...formData, enable_backfill: checked })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Look beyond 12 months
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backfill_lookback_months" className="text-sm">
                  Lookback Period
                </Label>
                <Input
                  id="backfill_lookback_months"
                  type="number"
                  min={12}
                  max={36}
                  value={formData.backfill_lookback_months}
                  onChange={(e) => setFormData({ ...formData, backfill_lookback_months: parseInt(e.target.value) })}
                  disabled={!formData.enable_backfill}
                />
                <p className="text-xs text-muted-foreground">
                  Months (default: 24)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button - Full Width Row */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={updateConfig.isPending}
          className="flex items-center gap-2 min-w-[200px]"
        >
          <Save className="h-4 w-4" />
          {updateConfig.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
