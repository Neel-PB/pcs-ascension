

# Align Select Dropdowns to Helix Menu Spec

## Problem
The `Select` dropdowns used in filter sheets (EmployeesFilterSheet, ContractorsFilterSheet, RequisitionsFilterSheet) and the global FilterBar don't match the Helix Menu spec. The `DropdownMenu` component already follows Helix, but `Select` uses different padding and item spacing.

## Current vs Helix

| Property | DropdownMenu (Helix) | Select (Current) |
|---|---|---|
| Min width | `min-w-[210px]` | `min-w-[8rem]` (128px) |
| Content padding | `pt-3 pb-1 px-0` | `p-1` (via Viewport) |
| Item padding | `px-4 py-2` | `px-2 py-2` |
| Item border radius | none (flush) | `rounded-sm` |

## Changes

### 1. `src/components/ui/select.tsx` -- SelectContent
- Add `min-w-[210px]` to the content wrapper
- Change Viewport padding from `p-1` to `pt-3 pb-1 px-0`

### 2. `src/components/ui/select.tsx` -- SelectItem and SelectItemNoCheck
- Change item padding from `px-2 py-2` to `px-4 py-2` (matching DropdownMenuItem)
- Remove `rounded-sm` from items so they sit flush edge-to-edge like Helix option items

## Technical Details

**SelectContent** (line 69-70):
- From: `min-w-[8rem]`
- To: `min-w-[210px]`

**Viewport** (line 80-81):
- From: `p-1`
- To: `pt-3 pb-1 px-0`

**SelectItem** (line 108-109):
- From: `rounded-sm py-2 px-2`
- To: `py-2 px-4`

**SelectItemNoCheck** (line 125-126):
- Same change as SelectItem

## Scope
This is a global component change so it will automatically apply to:
- All filter sheets (Employees, Contractors, Requisitions)
- Global FilterBar selects (Region, Market)
- Admin and settings selects
- Any other Select usage across the app

No changes needed to individual filter sheet files.
