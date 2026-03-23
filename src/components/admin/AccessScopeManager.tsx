import { useState, useEffect, useMemo, useCallback } from "react";
import { Globe, MapPin, Building2, Layers, ChevronRight, X } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilterData } from "@/hooks/useFilterData";
import { apiFetch } from "@/lib/apiFetch";
import { AccessScopeLevelDialog, type ScopeItem } from "./AccessScopeLevelDialog";
import { cn } from "@/lib/utils";

export interface SelectedAccess {
  regions: Set<string>;
  markets: Set<string>;
  facilities: Set<string>;
  departments: Set<string>;
}

export interface AccessScopeData {
  regions: string[];
  markets: string[];
  facilities: { facility_id: string; facility_name: string; market?: string }[];
  departments: { department_id: string; department_name: string; facility_id?: string; facility_name?: string; market?: string }[];
}

interface AccessScopeManagerProps {
  userId?: string;
  isEditMode: boolean;
  onAccessChange?: (data: AccessScopeData) => void;
}

type ScopeLevel = "regions" | "markets" | "facilities" | "departments";

const LEVEL_CONFIG: {
  key: ScopeLevel;
  label: string;
  icon: React.ReactNode;
  description: string;
  searchable: boolean;
}[] = [
  {
    key: "regions",
    label: "Region",
    icon: <Globe className="h-4 w-4" />,
    description: "Select regions to restrict access",
    searchable: false,
  },
  {
    key: "markets",
    label: "Market",
    icon: <MapPin className="h-4 w-4" />,
    description: "Select markets to restrict access",
    searchable: false,
  },
  {
    key: "facilities",
    label: "Facility",
    icon: <Building2 className="h-4 w-4" />,
    description: "Select facilities to restrict access",
    searchable: true,
  },
  {
    key: "departments",
    label: "Department",
    icon: <Layers className="h-4 w-4" />,
    description: "Select departments to restrict access",
    searchable: true,
  },
];

export function AccessScopeManager({ userId, isEditMode, onAccessChange }: AccessScopeManagerProps) {
  const [selectedAccess, setSelectedAccess] = useState<SelectedAccess>({
    regions: new Set(),
    markets: new Set(),
    facilities: new Set(),
    departments: new Set(),
  });
  const [openLevel, setOpenLevel] = useState<ScopeLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { regions, markets, facilities, departments, isLoading: filterLoading } = useFilterData();

  // Fetch existing access scope for edit mode
  useEffect(() => {
    if (isEditMode && userId) {
      setIsLoading(true);
      apiFetch<any>(`/users/${userId}`)
        .then((user) => {
          const accessScope = user.accessScope || [];
          const newAccess: SelectedAccess = {
            regions: new Set(),
            markets: new Set(),
            facilities: new Set(),
            departments: new Set(),
          };
          accessScope.forEach((d: any) => {
            if (d.region) newAccess.regions.add(d.region);
            if (d.market && !d.facility_id) newAccess.markets.add(d.market);
            if (d.facility_id && !d.department_id) newAccess.facilities.add(d.facility_id);
            if (d.department_id) newAccess.departments.add(d.department_id);
          });
          setSelectedAccess(newAccess);
        })
        .catch((err) => console.error("Error fetching access scope:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, userId]);

  // Build AccessScopeData from SelectedAccess
  const buildAccessData = useCallback(
    (access: SelectedAccess): AccessScopeData => ({
      regions: Array.from(access.regions),
      markets: Array.from(access.markets),
      facilities: Array.from(access.facilities).map((fid) => {
        const f = facilities.find((x) => x.facility_id === fid);
        return { facility_id: fid, facility_name: f?.facility_name || "", market: f?.market };
      }),
      departments: Array.from(access.departments).map((did) => {
        const d = departments.find((x) => x.department_id === did);
        const f = d ? facilities.find((x) => x.facility_id === d.facility_id) : null;
        return {
          department_id: did,
          department_name: d?.department_name || "",
          facility_id: d?.facility_id,
          facility_name: f?.facility_name,
          market: f?.market,
        };
      }),
    }),
    [facilities, departments]
  );

  // Notify parent whenever selections change
  useEffect(() => {
    if (onAccessChange) {
      onAccessChange(buildAccessData(selectedAccess));
    }
  }, [selectedAccess, buildAccessData, onAccessChange]);

  // Cascading items for each level
  const levelItems = useMemo((): Record<ScopeLevel, ScopeItem[]> => {
    // Regions — always show all
    const regionItems: ScopeItem[] = regions.map((r) => ({
      id: r.region,
      label: r.region,
    }));

    // Markets — filtered by selected regions
    const filteredMarkets =
      selectedAccess.regions.size === 0
        ? markets
        : markets.filter((m) => m.region && selectedAccess.regions.has(m.region));
    const marketItems: ScopeItem[] = filteredMarkets.map((m) => ({
      id: m.market,
      label: m.market,
      sublabel: m.region || undefined,
    }));

    // Facilities — filtered by selected markets > regions
    let filteredFacs = facilities;
    if (selectedAccess.markets.size > 0) {
      filteredFacs = facilities.filter((f) => selectedAccess.markets.has(f.market));
    } else if (selectedAccess.regions.size > 0) {
      filteredFacs = facilities.filter((f) => f.region && selectedAccess.regions.has(f.region));
    }
    const facilityItems: ScopeItem[] = filteredFacs.map((f) => ({
      id: f.facility_id,
      label: f.facility_name,
      sublabel: f.facility_id,
    }));

    // Departments — filtered by selected facilities > markets > regions, deduplicated
    let filteredDepts = departments;
    if (selectedAccess.facilities.size > 0) {
      filteredDepts = departments.filter((d) => selectedAccess.facilities.has(d.facility_id));
    } else if (selectedAccess.markets.size > 0) {
      const fIds = facilities
        .filter((f) => selectedAccess.markets.has(f.market))
        .map((f) => f.facility_id);
      filteredDepts = departments.filter((d) => fIds.includes(d.facility_id));
    } else if (selectedAccess.regions.size > 0) {
      const fIds = facilities
        .filter((f) => f.region && selectedAccess.regions.has(f.region))
        .map((f) => f.facility_id);
      filteredDepts = departments.filter((d) => fIds.includes(d.facility_id));
    }
    // Deduplicate by department_id
    const seen = new Map<string, (typeof departments)[0]>();
    for (const d of filteredDepts) {
      if (!seen.has(d.department_id)) seen.set(d.department_id, d);
    }
    const deptItems: ScopeItem[] = Array.from(seen.values()).map((d) => ({
      id: d.department_id,
      label: d.department_name,
      sublabel: d.department_id,
    }));

    return {
      regions: regionItems,
      markets: marketItems,
      facilities: facilityItems,
      departments: deptItems,
    };
  }, [regions, markets, facilities, departments, selectedAccess]);

  const handleLevelDone = (level: ScopeLevel, newSelected: Set<string>) => {
    setSelectedAccess((prev) => ({ ...prev, [level]: newSelected }));
  };

  const removeItem = (level: ScopeLevel, value: string) => {
    setSelectedAccess((prev) => {
      const next = new Set(prev[level]);
      next.delete(value);
      return { ...prev, [level]: next };
    });
  };

  // Resolve display names for chips
  const getDisplayName = (level: ScopeLevel, id: string): string => {
    if (level === "regions" || level === "markets") return id;
    if (level === "facilities") {
      const f = facilities.find((x) => x.facility_id === id);
      return f?.facility_name || id;
    }
    const d = departments.find((x) => x.department_id === id);
    return d?.department_name || id;
  };

  if (filterLoading || isLoading) {
    return <div className="text-sm text-muted-foreground py-2">Loading...</div>;
  }

  return (
    <div className="space-y-1.5">
      {LEVEL_CONFIG.map((config) => {
        const count = selectedAccess[config.key].size;
        const selectedIds = Array.from(selectedAccess[config.key]);

        return (
          <div key={config.key}>
            {/* Level row */}
            <button
              type="button"
              onClick={() => setOpenLevel(config.key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left",
                count > 0
                  ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-md shrink-0",
                  count > 0 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{config.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs font-semibold">
                      {count}
                    </Badge>
                  )}
                </div>
                {count === 0 ? (
                  <span className="text-xs text-muted-foreground">All {config.label.toLowerCase()}s</span>
                ) : (
                  <span className="text-xs text-muted-foreground truncate block">
                    {selectedIds
                      .slice(0, 3)
                      .map((id) => getDisplayName(config.key, id))
                      .join(", ")}
                    {selectedIds.length > 3 && ` +${selectedIds.length - 3} more`}
                  </span>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>

            {/* Selected chips (if any) */}
            {count > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5 ml-11">
                {selectedIds.slice(0, 6).map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="pl-1.5 pr-1 py-0.5 flex items-center gap-1 text-xs"
                  >
                    <span className="max-w-[100px] truncate">{getDisplayName(config.key, id)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(config.key, id);
                      }}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
                {selectedIds.length > 6 && (
                  <Badge variant="outline" className="text-xs py-0.5">
                    +{selectedIds.length - 6} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Per-level dialogs */}
      {LEVEL_CONFIG.map((config) => (
        <AccessScopeLevelDialog
          key={config.key}
          open={openLevel === config.key}
          onOpenChange={(isOpen) => {
            if (!isOpen) setOpenLevel(null);
          }}
          title={config.label}
          description={config.description}
          icon={config.icon}
          items={levelItems[config.key]}
          selected={selectedAccess[config.key]}
          onDone={(newSelected) => handleLevelDone(config.key, newSelected)}
          searchable={config.searchable}
        />
      ))}
    </div>
  );
}

export const OrgAccessManager = AccessScopeManager;
