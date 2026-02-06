

# Add Searchable Dropdowns for Facility and Department Filters

## Overview

Replace the standard Select component with a Popover + Command pattern for Facility and Department dropdowns, enabling users to search by name or ID.

---

## Technical Approach

We'll use a **Popover + Command** pattern (similar to the shadcn/ui combobox pattern) which provides:
- Search input at the top
- Filtered list of options below
- Same two-column layout (name | ID) with fixed widths
- Same blue highlight for selected item
- Same fixed trigger width with truncation

---

## Visual Design

```text
┌──────────────────────┐
│ Select facility   ▼  │  ← Fixed-width trigger (current behavior preserved)
└──────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 🔍 Search by name or ID...            │  ← Search input
├────────────────────────────┬──────────┤
│ ASH Pensacola Hospital     │    26012 │  ← Matches "26012" or "Pensacola"
├────────────────────────────┼──────────┤
│ Sacred Heart Bay MC ░░░░░░░│░░░26013░░│  ← Selected (blue bg)
├────────────────────────────┼──────────┤
│ Gulf Breeze Campus         │    26017 │
└────────────────────────────┴──────────┘
```

---

## Implementation Details

### File: `src/components/staffing/FilterBar.tsx`

**1. Add new imports:**
```typescript
import { useState, useRef } from "react";
import { Search, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
```

**2. Add state for popover open/close:**
```typescript
const [facilityOpen, setFacilityOpen] = useState(false);
const [departmentOpen, setDepartmentOpen] = useState(false);
```

**3. Replace Facility Select (lines 340-383) with Popover + Command:**

```typescript
{filterPermissions.facility && (
  <div className="relative">
    <Popover open={facilityOpen} onOpenChange={setFacilityOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={facilityOpen}
          disabled={isFacilityDisabled}
          className={`${isCompact ? 'w-[160px]' : 'w-[250px]'} justify-between bg-background border-border ${isFacilityDisabled ? 'pr-8' : ''}`}
        >
          <span className="truncate">
            {selectedFacility === "all-facilities"
              ? "All Facilities"
              : availableFacilities.find(f => f.facility_id === selectedFacility)?.facility_name ?? "Select facility"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0 bg-popover border-border z-50" align="start">
        <Command filter={(value, search) => {
          // Custom filter that searches both name and ID
          const facility = availableFacilities.find(f => f.facility_id === value);
          if (!facility) return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          const searchLower = search.toLowerCase();
          return (
            facility.facility_name.toLowerCase().includes(searchLower) ||
            facility.facility_id.toLowerCase().includes(searchLower)
          ) ? 1 : 0;
        }}>
          <CommandInput placeholder="Search by name or ID..." />
          <CommandList>
            <CommandEmpty>No facility found.</CommandEmpty>
            <CommandGroup>
              {(shouldShowAllOption('facility') || selectedFacility === 'all-facilities') && (
                <CommandItem
                  value="all-facilities"
                  onSelect={() => {
                    onFacilityChange?.("all-facilities");
                    setFacilityOpen(false);
                  }}
                  className={selectedFacility === "all-facilities" ? "bg-primary/15 border border-primary/30" : ""}
                >
                  <Check className={`mr-2 h-4 w-4 ${selectedFacility === "all-facilities" ? "opacity-100" : "opacity-0"}`} />
                  All Facilities
                </CommandItem>
              )}
              {availableFacilities.map(facility => (
                <CommandItem
                  key={facility.facility_id}
                  value={facility.facility_id}
                  onSelect={() => {
                    onFacilityChange?.(facility.facility_id);
                    setFacilityOpen(false);
                  }}
                  className={selectedFacility === facility.facility_id ? "bg-primary/15 border border-primary/30" : ""}
                >
                  <div className="grid grid-cols-[250px_80px] w-full">
                    <span className="truncate text-left">{facility.facility_name}</span>
                    <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right">
                      {facility.facility_id}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    {isFacilityDisabled && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Lock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>Assigned by administrator</TooltipContent>
      </Tooltip>
    )}
  </div>
)}
```

**4. Replace Department Select (lines 387-430) with similar Popover + Command pattern**

Same structure as Facility, with:
- `departmentOpen` state
- Custom filter searching both `department_name` and `department_id`
- Same two-column grid layout

---

## Key Features

| Feature | Implementation |
|---------|----------------|
| Search by name OR ID | Custom `filter` function on Command component |
| Fixed trigger width | Same `w-[Xpx]` classes with truncation |
| Two-column layout | Same `grid-cols-[250px_80px]` grid |
| Blue selected highlight | Same `bg-primary/15 border border-primary/30` classes |
| Loading state | Show loading spinner when `facilitiesLoading` / `departmentsLoading` |
| Lock icon for restricted | Same Tooltip with Lock icon pattern |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/staffing/FilterBar.tsx` | Replace Facility and Department Select components with Popover + Command pattern with search capability |

