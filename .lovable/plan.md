

# Show Only Department Badge After Selection

## Problem

Currently, after selecting Market → Facility → Department in the "Share With" cascading selects, all three dropdowns remain visible. The user expects to see only the selected department name as a compact badge.

The issue is the condition on line 425:
```typescript
{sharedDepartment && !sharedMarket ? (
```

This shows the badge only when `sharedDepartment` exists AND `sharedMarket` is empty. But after completing the cascade, `sharedMarket` still has a value, so the condition is always false.

---

## Solution

Change the condition to show the badge whenever a department is selected, and introduce an "editing" state to toggle back to the cascading selects when the user clicks "Change".

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Add Editing State (around line 130)

Add a state variable to track whether the user is actively editing the share selection:

```typescript
// Add after other useState declarations
const [isEditingShare, setIsEditingShare] = useState(false);
```

#### Change 2: Update Market Change Handler (line 150-154)

When a market is selected initially, set editing mode to true:

```typescript
const handleMarketChange = (market: string) => {
  setSharedMarket(market);
  setSharedFacility('');
  setSharedDepartment('');
  setIsEditingShare(true);
};
```

#### Change 3: Auto-Complete After Department Selection (line 529)

When a department is selected, exit editing mode to show the badge:

```typescript
<Select 
  value={sharedDepartment} 
  onValueChange={(value) => {
    setSharedDepartment(value);
    setIsEditingShare(false); // Exit editing mode after selection
  }}
>
```

#### Change 4: Update Badge Display Condition (line 425)

Change the condition to show the badge when department is selected AND not in editing mode:

```typescript
// BEFORE:
{sharedDepartment && !sharedMarket ? (

// AFTER:
{sharedDepartment && !isEditingShare ? (
```

#### Change 5: Update "Change" Button Handler (line 451)

When "Change" is clicked, enter editing mode instead of clearing market:

```typescript
// BEFORE:
onClick={() => setSharedMarket('')}

// AFTER:
onClick={() => setIsEditingShare(true)}
```

#### Change 6: Update Clear Handler (line 161-165)

When clearing, also reset editing state:

```typescript
const handleClearDepartment = () => {
  setSharedMarket('');
  setSharedFacility('');
  setSharedDepartment('');
  setIsEditingShare(false);
};
```

#### Change 7: Reset Editing State on Popover Open (around line 96)

When the popover opens with existing data, ensure editing is off:

```typescript
// In the useEffect that runs on open, add:
setIsEditingShare(false);
```

---

## Animation Behavior

| User Action | Result |
|-------------|--------|
| Open popover (with existing department) | Shows badge with department name |
| Click "Change" | Badge animates out, cascading selects animate in |
| Complete selection | Selects animate out, badge animates in |
| Click X on badge | Badge clears, shows empty market select |

---

## Visual Result

- **Initial state with department**: Compact badge showing department name
- **Click "Change"**: Smooth transition to cascading selects (preserving previous values)
- **Complete new selection**: Smooth transition back to badge with new department
- **Clear**: Empty market dropdown ready for new selection

