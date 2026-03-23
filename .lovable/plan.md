

## Redesign Access Scope: Replace Popovers with a Dialog

### Problem
The current Access Scope uses small popovers that open/close awkwardly inside the sheet — they clip, overlap, and feel cramped. For Facility and Department (which have long searchable lists), popovers are especially poor.

### Solution
Replace the entire Access Scope section with a **single "Configure Access" button** that opens a **full Dialog** with all four levels (Region, Market, Facility, Department) in a clean tabbed or stacked layout with plenty of room.

### Changes

**1. New component: `src/components/admin/AccessScopeDialog.tsx`**
- A `Dialog` with title "Configure Access Scope"
- Four sections stacked vertically inside a `ScrollArea`:
  - **Region** — checkbox list (compact, few items)
  - **Market** — checkbox list, cascaded by selected regions
  - **Facility** — searchable checkbox list with Name + ID columns
  - **Department** — searchable checkbox list with Name + ID columns
- Each section has a header with icon + count badge showing selected items
- "Clear All" and "Done" buttons in the dialog footer
- All the cascading filter logic moves here (from current AccessScopeManager)
- On "Done", calls `onAccessChange(data)` callback

**2. Simplify `src/components/admin/AccessScopeManager.tsx`**
- Becomes a thin wrapper: shows a summary of current selections + a "Configure" button that opens the dialog
- Summary shows: "No restrictions" or chips/badges for selected items grouped by level
- Remove all Popover/Command/MultiSelectChips usage
- Remove Supabase direct queries — use `apiFetch` for edit mode (fetch from `GET /users/:id`)
- Remove `window.__accessScopeSave` hack

**3. `src/components/admin/UserFormSheet.tsx`**
- Names side-by-side (2-column grid)
- Tighten spacing to `space-y-4`
- Add separator between user fields and access scope section
- Access scope shows as summary + "Configure" button (much cleaner in the sheet)

### Visual Result
```text
Sheet:
┌─────────────────────────────┐
│ ┌──────────┐ ┌──────────┐   │
│ │First Name│ │Last Name │   │
│ └──────────┘ └──────────┘   │
│ ┌───────────────────────┐   │
│ │ Email                 │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ Role            ▾     │   │
│ └───────────────────────┘   │
│ ─────────────────────────── │
│ Access Scope                │
│ No restrictions applied     │
│ [Configure Access...]       │
│                             │
│  [Cancel]   [Send Invite]   │
└─────────────────────────────┘

Dialog (on clicking "Configure Access"):
┌───────────────────────────────────┐
│ Configure Access Scope        [X] │
├───────────────────────────────────┤
│ 🌐 Region                    (2) │
│ ┌─────────────────────────────┐   │
│ │ ☑ East  ☑ West  ☐ Central  │   │
│ └─────────────────────────────┘   │
│                                   │
│ 📍 Market                    (1) │
│ ┌─────────────────────────────┐   │
│ │ ☑ Florida  ☐ Texas  ...    │   │
│ └─────────────────────────────┘   │
│                                   │
│ 🏢 Facility        [Search...]   │
│ ┌─────────────────────────────┐   │
│ │ ☑ St. Vincent   │ FAC-001  │   │
│ │ ☐ Sacred Heart  │ FAC-002  │   │
│ └─────────────────────────────┘   │
│                                   │
│ 📑 Department      [Search...]   │
│ ┌─────────────────────────────┐   │
│ │ ☑ Nursing       │ DEP-001  │   │
│ │ ☐ Radiology     │ DEP-002  │   │
│ └─────────────────────────────┘   │
├───────────────────────────────────┤
│       [Clear All]    [Done]       │
└───────────────────────────────────┘
```

### What stays the same
- Cascading filter logic (Region filters Markets, Markets filter Facilities, etc.)
- `AccessScopeData` interface — same shape passed to parent
- `useFilterData` hook for org hierarchy data
- Selection highlight style (bg-primary/15, border-primary/30)

