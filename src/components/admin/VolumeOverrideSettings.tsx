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
import { InfoIcon, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Volume Override Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure rules for target volume vs override volume decision-making
        </p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          These settings control when override volumes are mandatory vs optional based on historical data availability.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Rule Thresholds</CardTitle>
          <CardDescription>
            Define the thresholds that determine override requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="min_months_for_target">
              Minimum Months for Target Volume
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
              Minimum historical months required to calculate target volume (default: 3)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_months_mandatory_override">
              Minimum Months for Mandatory Override
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
              Departments with less than this many months require override volumes (default: 2)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_override_months">
              Maximum Override Duration (Full History)
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
              Maximum months an override can last when there's minimal history (default: 12)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fiscal Governance</CardTitle>
          <CardDescription>
            Configure fiscal year end date for departments with full history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiscal_year_end_month">
                Fiscal Year End Month
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
                Month (1-12, default: 6 for June)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscal_year_end_day">
                Fiscal Year End Day
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
                Day of month (default: 30)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backfill Settings</CardTitle>
          <CardDescription>
            Configure how the system looks back for historical data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_backfill">Enable Backfill</Label>
              <p className="text-xs text-muted-foreground">
                Allow system to look beyond 12 months for historical data
              </p>
            </div>
            <Switch
              id="enable_backfill"
              checked={formData.enable_backfill}
              onCheckedChange={(checked) => setFormData({ ...formData, enable_backfill: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="backfill_lookback_months">
              Backfill Lookback Period (Months)
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
              How far back to look for historical data when backfilling (default: 24)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume Thresholds</CardTitle>
          <CardDescription>
            Define minimum volume thresholds for valid historical data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="min_volume_threshold">
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
              Months with volume below this threshold are considered invalid (default: 0)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={updateConfig.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Rule Matrix Preview</CardTitle>
          <CardDescription>
            How these settings affect override requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
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
      </Card>
    </div>
  );
}
