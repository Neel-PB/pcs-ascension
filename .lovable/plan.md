

# Use ToggleButtonGroup in Detail Sheet Tabs

## What's changing

Replace the default Radix `TabsList`/`TabsTrigger` in the Position to Open and Position to Close detail sheets with the same pill-shaped `ToggleButtonGroup` component used for main module navigation. This creates a consistent tab experience across the app.

## Files to modify

### 1. `src/components/workforce/PositionToOpenDetailsSheet.tsx`
- Remove `TabsList` and `TabsTrigger` imports (keep `Tabs` and `TabsContent`)
- Add `ToggleButtonGroup` import
- Replace the `<TabsList>` block with a `<ToggleButtonGroup>` that has two items: "Details" and "Comments"
- Wire `onSelect` to update both the local `activeTab` state and the Radix `Tabs` value (switch to controlled mode using `value` + `onValueChange`)

### 2. `src/components/workforce/PositionToCloseDetailsSheet.tsx`
- Same changes as above: swap `TabsList`/`TabsTrigger` for `ToggleButtonGroup`
- Wire it to the existing `activeTab` state

## Visual result

```text
Before:  [ Details ]  [ Comments ]     (plain underline tabs)
After:   [( Details )  Comments ]      (pill-shaped toggle with sliding blue indicator)
```

The toggle group will sit in the same `px-6` container below the header, maintaining the current layout. No changes to tab content or footer.

## Technical notes

- The `Tabs` component from Radix supports controlled mode via `value` + `onValueChange`, so we can sync it with `ToggleButtonGroup`'s `onSelect`
- The `ToggleButtonGroup` already handles the framer-motion sliding indicator, so no additional animation code is needed
- The `layoutId` for each sheet's toggle should be unique (e.g., `"openSheetTab"` and `"closeSheetTab"`) to avoid cross-component animation conflicts

