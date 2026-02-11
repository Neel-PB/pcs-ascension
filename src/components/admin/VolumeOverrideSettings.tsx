import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVolumeOverrideConfig } from '@/hooks/useHistoricalVolumeAnalysis';
import { 
  useUpdateVolumeOverrideConfig, 
  useDepartmentOverrideConfigs,
  useUpsertDepartmentConfig,
  useDeleteDepartmentConfig 
} from '@/hooks/useVolumeOverrideConfig';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ChevronDown, Trash2, Edit2, Globe, Building2 } from '@/lib/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { VolumeOverrideConfig } from '@/lib/volumeOverrideRules';

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

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.15 } },
};

type ConfigMode = 'universal' | 'department';

const DEFAULT_FORM_DATA = {
  min_months_for_target: 3,
  min_months_mandatory_override: 2,
  max_override_months_full_history: 12,
  fiscal_year_end_month: 6,
  fiscal_year_end_day: 30,
  enable_backfill: true,
  backfill_lookback_months: 24,
  min_volume_threshold: 0,
  spread_threshold: 15,
};

export function VolumeOverrideSettings() {
  const { data: globalConfig, isLoading: isLoadingGlobal } = useVolumeOverrideConfig();
  const { data: deptConfigs = [], isLoading: isLoadingDepts } = useDepartmentOverrideConfigs();
  const updateGlobalConfig = useUpdateVolumeOverrideConfig();
  const upsertDeptConfig = useUpsertDepartmentConfig();
  const deleteDeptConfig = useDeleteDepartmentConfig();
  
  const [mode, setMode] = useState<ConfigMode>('universal');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  
  // Department selection state
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  // Fetch markets
  const { data: markets = [] } = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('markets')
        .select('market')
        .order('market');
      if (error) throw error;
      return data.map(m => m.market);
    },
  });

  // Fetch facilities for selected market
  const { data: facilities = [] } = useQuery({
    queryKey: ['facilities', selectedMarket],
    queryFn: async () => {
      if (!selectedMarket) return [];
      const { data, error } = await supabase
        .from('facilities')
        .select('facility_id, facility_name')
        .eq('market', selectedMarket)
        .order('facility_name');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMarket,
  });

  // Fetch departments for selected facility
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', selectedFacility],
    queryFn: async () => {
      if (!selectedFacility) return [];
      const { data, error } = await supabase
        .from('departments')
        .select('department_id, department_name')
        .eq('facility_id', selectedFacility)
        .order('department_name');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedFacility,
  });

  // Get facility name for selected facility
  const selectedFacilityName = useMemo(() => {
    return facilities.find(f => f.facility_id === selectedFacility)?.facility_name || '';
  }, [facilities, selectedFacility]);

  // Get department name for selected department
  const selectedDepartmentName = useMemo(() => {
    return departments.find(d => d.department_id === selectedDepartment)?.department_name || '';
  }, [departments, selectedDepartment]);

  // Update form when global config loads (for universal mode)
  useEffect(() => {
    if (globalConfig && mode === 'universal' && !editingConfigId) {
      setFormData({
        min_months_for_target: globalConfig.min_months_for_target,
        min_months_mandatory_override: globalConfig.min_months_mandatory_override,
        max_override_months_full_history: globalConfig.max_override_months_full_history,
        fiscal_year_end_month: globalConfig.fiscal_year_end_month,
        fiscal_year_end_day: globalConfig.fiscal_year_end_day,
        enable_backfill: globalConfig.enable_backfill,
        backfill_lookback_months: globalConfig.backfill_lookback_months,
        min_volume_threshold: globalConfig.min_volume_threshold,
        spread_threshold: globalConfig.spread_threshold ?? 15,
      });
    }
  }, [globalConfig, mode, editingConfigId]);

  // Reset form when switching modes
  useEffect(() => {
    if (mode === 'universal') {
      setSelectedMarket('');
      setSelectedFacility('');
      setSelectedDepartment('');
      setEditingConfigId(null);
      if (globalConfig) {
        setFormData({
          min_months_for_target: globalConfig.min_months_for_target,
          min_months_mandatory_override: globalConfig.min_months_mandatory_override,
          max_override_months_full_history: globalConfig.max_override_months_full_history,
          fiscal_year_end_month: globalConfig.fiscal_year_end_month,
          fiscal_year_end_day: globalConfig.fiscal_year_end_day,
          enable_backfill: globalConfig.enable_backfill,
          backfill_lookback_months: globalConfig.backfill_lookback_months,
          min_volume_threshold: globalConfig.min_volume_threshold,
          spread_threshold: globalConfig.spread_threshold ?? 15,
        });
      }
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
  }, [mode, globalConfig]);

  // Handle market change - reset downstream selections
  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    setSelectedFacility('');
    setSelectedDepartment('');
    setEditingConfigId(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  // Handle facility change - reset department
  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value);
    setSelectedDepartment('');
    setEditingConfigId(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  // Handle department change - check for existing config
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setEditingConfigId(null);
    
    // Check if config exists for this department
    const existingConfig = deptConfigs.find(
      c => c.market === selectedMarket && 
           c.facility_id === selectedFacility && 
           c.department_id === value
    );
    
    if (existingConfig) {
      setEditingConfigId(existingConfig.id || null);
      setFormData({
        min_months_for_target: existingConfig.min_months_for_target,
        min_months_mandatory_override: existingConfig.min_months_mandatory_override,
        max_override_months_full_history: existingConfig.max_override_months_full_history,
        fiscal_year_end_month: existingConfig.fiscal_year_end_month,
        fiscal_year_end_day: existingConfig.fiscal_year_end_day,
        enable_backfill: existingConfig.enable_backfill,
        backfill_lookback_months: existingConfig.backfill_lookback_months,
        min_volume_threshold: existingConfig.min_volume_threshold,
        spread_threshold: existingConfig.spread_threshold ?? 15,
      });
    } else {
      // Use global as starting point for new department config
      if (globalConfig) {
        setFormData({
          min_months_for_target: globalConfig.min_months_for_target,
          min_months_mandatory_override: globalConfig.min_months_mandatory_override,
          max_override_months_full_history: globalConfig.max_override_months_full_history,
          fiscal_year_end_month: globalConfig.fiscal_year_end_month,
          fiscal_year_end_day: globalConfig.fiscal_year_end_day,
          enable_backfill: globalConfig.enable_backfill,
          backfill_lookback_months: globalConfig.backfill_lookback_months,
          min_volume_threshold: globalConfig.min_volume_threshold,
          spread_threshold: globalConfig.spread_threshold ?? 15,
        });
      }
    }
  };

  // Ref for scrolling to form top
  const formTopRef = useRef<HTMLDivElement>(null);
  const [isScrollHighlight, setIsScrollHighlight] = useState(false);

  // Handle editing an existing department config from the list
  const handleEditConfig = (config: VolumeOverrideConfig) => {
    setMode('department');
    setSelectedMarket(config.market || '');
    setSelectedFacility(config.facility_id || '');
    setSelectedDepartment(config.department_id || '');
    setEditingConfigId(config.id || null);
    setFormData({
      min_months_for_target: config.min_months_for_target,
      min_months_mandatory_override: config.min_months_mandatory_override,
      max_override_months_full_history: config.max_override_months_full_history,
      fiscal_year_end_month: config.fiscal_year_end_month,
      fiscal_year_end_day: config.fiscal_year_end_day,
      enable_backfill: config.enable_backfill,
      backfill_lookback_months: config.backfill_lookback_months,
      min_volume_threshold: config.min_volume_threshold,
      spread_threshold: config.spread_threshold ?? 15,
    });
    
    // Trigger highlight animation
    setIsScrollHighlight(true);
    
    // Smooth scroll to the top of the form
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Remove highlight after animation completes
      setTimeout(() => {
        setIsScrollHighlight(false);
      }, 1500);
    }, 100);
  };

  const handleSave = () => {
    if (mode === 'universal') {
      updateGlobalConfig.mutate(formData);
    } else {
      if (!selectedMarket || !selectedFacility || !selectedDepartment) {
        return;
      }
      upsertDeptConfig.mutate({
        ...formData,
        market: selectedMarket,
        facility_id: selectedFacility,
        facility_name: selectedFacilityName,
        department_id: selectedDepartment,
        department_name: selectedDepartmentName,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteDeptConfig.mutate(id);
  };

  const isLoading = isLoadingGlobal || isLoadingDepts;
  const isSaving = updateGlobalConfig.isPending || upsertDeptConfig.isPending;
  const canSaveDepartment = selectedMarket && selectedFacility && selectedDepartment;

  // Build the Rule Matrix Preview label
  const matrixLabel = useMemo(() => {
    if (mode === 'universal') {
      return '(Universal)';
    }
    if (selectedMarket && selectedFacilityName && selectedDepartmentName) {
      return `(${selectedMarket} > ${selectedFacilityName} > ${selectedDepartmentName})`;
    }
    if (selectedMarket && selectedFacilityName) {
      return `(${selectedMarket} > ${selectedFacilityName} > ...)`;
    }
    if (selectedMarket) {
      return `(${selectedMarket} > ...)`;
    }
    return '(Select Department)';
  }, [mode, selectedMarket, selectedFacilityName, selectedDepartmentName]);

  // Format config summary for department list
  const formatConfigSummary = (config: VolumeOverrideConfig) => {
    return `Min: ${config.min_months_for_target}mo | Spread: ${config.spread_threshold ?? 15}% | FY: ${config.fiscal_year_end_month}/${config.fiscal_year_end_day} | Backfill: ${config.enable_backfill ? `${config.backfill_lookback_months}mo` : 'Off'}`;
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
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold">Volume Override Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure rules for target volume vs override volume decision-making
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div 
        variants={itemVariants} 
        ref={formTopRef}
        animate={isScrollHighlight ? { 
          boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 20px 8px hsl(var(--primary) / 0.4)', '0 0 0 0 hsl(var(--primary) / 0)']
        } : {}}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        className="rounded-lg"
      >
        <Tabs value={mode} onValueChange={(v) => setMode(v as ConfigMode)} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="universal">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Universal
              </span>
            </TabsTrigger>
            <TabsTrigger value="department">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Department-Specific
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Department Selection (only in department mode) */}
      <AnimatePresence mode="wait">
        {mode === 'department' && (
          <motion.div
            key="department-selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Select Department</CardTitle>
                <CardDescription className="text-xs">
                  Configure custom rules for a specific department (overrides universal settings)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Market</Label>
                    <Select value={selectedMarket} onValueChange={handleMarketChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select market..." />
                      </SelectTrigger>
                      <SelectContent>
                        {markets.map((market) => (
                          <SelectItem key={market} value={market}>
                            {market}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Facility</Label>
                    <Select 
                      value={selectedFacility} 
                      onValueChange={handleFacilityChange}
                      disabled={!selectedMarket}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility..." />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map((facility) => (
                          <SelectItem key={facility.facility_id} value={facility.facility_id}>
                            {facility.facility_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Department</Label>
                    <Select 
                      value={selectedDepartment} 
                      onValueChange={handleDepartmentChange}
                      disabled={!selectedFacility}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department..." />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editingConfigId && (
                  <motion.div 
                    className="mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      Editing existing configuration
                    </Badge>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rule Matrix Preview - Collapsible, Full Width */}
      <motion.div variants={itemVariants}>
        <Collapsible open={isMatrixOpen} onOpenChange={setIsMatrixOpen}>
          <Card className="bg-muted/30">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="text-base flex items-center gap-2">
                      Rule Matrix Preview
                      <span className="text-sm font-normal text-muted-foreground">{matrixLabel}</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      How these settings affect override requirements
                    </CardDescription>
                  </div>
                  <motion.div
                    animate={{ rotate: isMatrixOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
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
                      <div className="text-destructive font-medium">Mandatory</div>
                      <div>{formData.max_override_months_full_history} months</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 py-2">
                      <div className="font-medium">{formData.min_months_for_target}-11</div>
                      <div className="text-green-600">Available</div>
                      <div className="text-primary font-medium">Optional</div>
                      <div>12 - historical months</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 py-2">
                      <div className="font-medium">12+</div>
                      <div className="text-green-600">Available</div>
                      <div className="text-primary font-medium">Optional</div>
                      <div>Next fiscal year end ({formData.fiscal_year_end_month}/{formData.fiscal_year_end_day})</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* 2-Column Grid Layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="spread_threshold" className="text-sm">
                Spread Threshold (%)
              </Label>
              <Input
                id="spread_threshold"
                type="number"
                min={0}
                max={100}
                step={1}
                value={formData.spread_threshold}
                onChange={(e) => setFormData({ ...formData, spread_threshold: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Max % diff between 3-mo low and N-mo avg (default: 15)
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
      </motion.div>

      {/* Save Button - Full Width Row */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || (mode === 'department' && !canSaveDepartment)}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </motion.div>

      {/* Department Exceptions List */}
      <AnimatePresence>
        {deptConfigs.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Department Exceptions
                  <Badge variant="secondary">{deptConfigs.length}</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Departments with custom override rules (override universal settings)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {deptConfigs.map((config, index) => (
                      <motion.div 
                        key={config.id}
                        variants={listItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: index * 0.03 }}
                        layout
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {config.market} &gt; {config.facility_name} &gt; {config.department_name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {formatConfigSummary(config)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConfig(config)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Department Configuration</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the custom configuration for{' '}
                                  <strong>{config.department_name}</strong>? This department will revert to using the universal settings.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(config.id!)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
