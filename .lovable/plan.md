
# Enhancements: Status/Reason Popover Positioning, Share With Selection, and View Change Animations

## Summary of Requested Changes

1. **Status/Reason Popover Positioning**: Currently opens on top (`side="top"`) which looks bad when clicking top rows - the popover appears outside the visible area
2. **Share With Department Selection**: Currently a simple text input - should allow hierarchical selection of Market → Facility → Department, but only show Department in the UI after selection
3. **View Change Animations**: Add polished animations when switching between different form states (selecting status, revealing Shared Position fields, etc.)

---

## Technical Changes

### File 1: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1.1: Fix Popover Positioning

**Problem**: The popover uses `side="top"` which causes it to appear outside the viewport when clicking rows at the top of the table.

**Solution**: Change to `side="bottom"` with intelligent collision handling - Radix will automatically flip to top when there's more room above.

```typescript
// Current (line 210-216):
<PopoverContent 
  className="w-80 p-0 z-50"
  align="center"
  side="top"
  sideOffset={8}
  collisionPadding={20}
  avoidCollisions={true}
>

// Change to:
<PopoverContent 
  className="w-80 p-0 z-50"
  align="end"
  side="bottom"
  sideOffset={8}
  collisionPadding={16}
  avoidCollisions={true}
  sticky="partial"
>
```

With `side="bottom"` as the preferred side and `avoidCollisions={true}`, Radix Popover will:
- Try to position below the trigger first
- Flip to above when there's not enough space below
- This gives the best UX for both top and bottom rows

#### Change 1.2: Replace "Shared With" Text Input with Cascading Selects

**Current Implementation** (lines 307-315):
```typescript
<div className="space-y-1.5">
  <Label className="text-xs font-medium">Shared With</Label>
  <Input
    value={editSharedWith}
    onChange={(e) => setEditSharedWith(e.target.value)}
    placeholder="e.g., ICU - Building A"
    className="h-7 text-xs"
  />
</div>
```

**New Implementation**: Add hierarchical selection with Market → Facility → Department selects, but save only the department name to display in the UI.

```typescript
// Add new state variables for cascading selection
const [sharedMarket, setSharedMarket] = useState('');
const [sharedFacility, setSharedFacility] = useState('');
const [sharedDepartment, setSharedDepartment] = useState('');

// Use filter data hook for cascading options
const { markets, getFacilitiesByMarket, getDepartmentsByFacility } = useFilterData();

// Compute filtered options based on selections
const sharedFacilities = sharedMarket ? getFacilitiesByMarket(sharedMarket) : [];
const sharedDepartments = sharedFacility ? getDepartmentsByFacility(sharedFacility) : [];

// Replace the Input with three cascading Selects wrapped in AnimatePresence
{isSharedPosition && (
  <>
    <motion.div 
      className="space-y-1.5"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Label className="text-xs font-medium">Share With</Label>
      
      {/* Step 1: Market Selection */}
      <Select value={sharedMarket} onValueChange={handleMarketChange}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Select market..." />
        </SelectTrigger>
        <SelectContent>
          {markets.map((m) => (
            <SelectItem key={m.id} value={m.market}>{m.market}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Step 2: Facility Selection (visible after market selected) */}
      <AnimatePresence>
        {sharedMarket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Select value={sharedFacility} onValueChange={handleFacilityChange}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Select facility..." />
              </SelectTrigger>
              <SelectContent>
                {sharedFacilities.map((f) => (
                  <SelectItem key={f.id} value={f.facility_id}>{f.facility_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Step 3: Department Selection (visible after facility selected) */}
      <AnimatePresence>
        {sharedFacility && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Select 
              value={sharedDepartment} 
              onValueChange={setSharedDepartment}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Select department..." />
              </SelectTrigger>
              <SelectContent>
                {sharedDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.department_name}>
                    {d.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Show selected department name as chip after selection */}
      <AnimatePresence>
        {sharedDepartment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pt-1"
          >
            <Badge variant="secondary" className="text-xs">
              {sharedDepartment}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    
    {/* ...Shared FTE and Shared Expiry fields remain the same */}
  </>
)}
```

**Data Storage**: Save only the department name to `actual_fte_shared_with` (current schema preserved):
```typescript
saveData.actual_fte_shared_with = sharedDepartment || null;
```

#### Change 1.3: Add Smooth Animations for Form State Changes

Wrap the form sections in AnimatePresence for smooth transitions when:
- Status is selected (reveal FTE dropdown)
- Shared Position is selected (reveal share with fields)
- Expiry fields appear/disappear

```typescript
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants for consistent motion design
const formFieldVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: 'auto', marginTop: 12 },
  exit: { opacity: 0, height: 0, marginTop: 0 }
};

// Wrap each conditional section
<AnimatePresence mode="wait">
  {editStatus && (
    <motion.div
      key="fte-field"
      variants={formFieldVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Active FTE Dropdown content */}
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence mode="wait">
  {editStatus && !isSharedPosition && (
    <motion.div
      key="expiry-field"
      variants={formFieldVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Expiry Date content */}
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence mode="wait">
  {isSharedPosition && (
    <motion.div
      key="shared-fields"
      variants={formFieldVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* All shared position fields */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## Visual Behavior Summary

| Action | Current Behavior | New Behavior |
|--------|-----------------|--------------|
| Click top row | Popover opens above, possibly clipped | Popover opens below (or flips if needed) |
| Select "Shared Position" | Fields appear instantly | Fields slide in smoothly with fade |
| "Share With" field | Free text input | Cascading Market → Facility → Dept selects |
| After dept selection | Shows raw text | Shows department name as Badge chip |
| Change status | Instant field changes | Smooth animated transitions |

---

## Animation Design

The animations follow the existing patterns in the codebase:

1. **Accordion-style reveals**: Using `height: 0 → auto` for expanding sections
2. **Fade + scale**: For the department badge chip that appears after selection
3. **Staggered reveals**: Each cascading dropdown appears after the previous selection
4. **Spring transitions**: Consistent with the tab indicator animations using spring physics

```typescript
// Transition configurations used:
{
  type: "spring",
  stiffness: 400,
  damping: 30
}
// For simpler transitions:
{
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] // ease-out
}
```

---

## Testing Checklist

1. **Popover Positioning**:
   - Click top row → popover opens below the cell
   - Click bottom row → popover opens above (or below with scroll)
   - Resize window → popover stays within viewport

2. **Share With Selection**:
   - Select "Shared Position" status → Market dropdown appears
   - Select market → Facility dropdown animates in
   - Select facility → Department dropdown animates in
   - Select department → Badge chip appears with department name
   - Save → Only department name is stored in DB

3. **Animations**:
   - Status change → FTE field slides in smoothly
   - Switch to Shared Position → Share fields animate in
   - Switch away from Shared Position → Fields animate out
   - No jank or layout shifts during animations
