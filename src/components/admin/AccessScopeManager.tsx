import { useState, useEffect, useMemo, useCallback } from "react";
import { Globe, MapPin, Building2, Layers, Settings2, X } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilterData } from "@/hooks/useFilterData";
import { apiFetch } from "@/lib/apiFetch";
import { AccessScopeDialog } from "./AccessScopeDialog";

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

export function AccessScopeManager({ userId, isEditMode, onAccessChange }: AccessScopeManagerProps) {
  const [selectedAccess, setSelectedAccess] = useState<SelectedAccess>({
    regions: new Set(),
    markets: new Set(),
    facilities: new Set(),
    departments: new Set(),
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { facilities, departments, isLoading: filterLoading } = useFilterData();

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

  const handleDialogDone = (newAccess: SelectedAccess) => {
    setSelectedAccess(newAccess);
  };

  const totalSelected =
    selectedAccess.regions.size +
    selectedAccess.markets.size +
    selectedAccess.facilities.size +
    selectedAccess.departments.size;

  // Build summary chips
  const summaryItems = useMemo(() => {
    const items: { icon: React.ReactNode; label: string; key: string; level: keyof SelectedAccess; value: string }[] = [];
    selectedAccess.regions.forEach((r) =>
      items.push({ icon: <Globe className="h-3 w-3" />, label: r, key: `r-${r}`, level: "regions", value: r })
    );
    selectedAccess.markets.forEach((m) =>
      items.push({ icon: <MapPin className="h-3 w-3" />, label: m, key: `m-${m}`, level: "markets", value: m })
    );
    selectedAccess.facilities.forEach((fid) => {
      const f = facilities.find((x) => x.facility_id === fid);
      items.push({
        icon: <Building2 className="h-3 w-3" />,
        label: f?.facility_name || fid,
        key: `f-${fid}`,
        level: "facilities",
        value: fid,
      });
    });
    selectedAccess.departments.forEach((did) => {
      const d = departments.find((x) => x.department_id === did);
      items.push({
        icon: <Layers className="h-3 w-3" />,
        label: d?.department_name || did,
        key: `d-${did}`,
        level: "departments",
        value: did,
      });
    });
    return items;
  }, [selectedAccess, facilities, departments]);

  const removeItem = (level: keyof SelectedAccess, value: string) => {
    setSelectedAccess((prev) => {
      const next = new Set(prev[level]);
      next.delete(value);
      return { ...prev, [level]: next };
    });
  };

  if (filterLoading || isLoading) {
    return <div className="text-sm text-muted-foreground py-2">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      {totalSelected === 0 ? (
        <p className="text-sm text-muted-foreground">
          No restrictions — user can access all data.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {summaryItems.map((item) => (
            <Badge
              key={item.key}
              variant="secondary"
              className="pl-1.5 pr-1 py-0.5 flex items-center gap-1 text-xs"
            >
              {item.icon}
              <span className="max-w-[120px] truncate">{item.label}</span>
              <button
                type="button"
                onClick={() => removeItem(item.level, item.value)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setDialogOpen(true)}
      >
        <Settings2 className="h-3.5 w-3.5" />
        Configure Access
      </Button>

      <AccessScopeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialAccess={selectedAccess}
        onDone={handleDialogDone}
      />
    </div>
  );
}

export const OrgAccessManager = AccessScopeManager;
