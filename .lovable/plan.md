

## Two Changes

### 1. Volume Config Sub-Tabs: Make Full Width

**File: `src/components/admin/VolumeOverrideSettings.tsx` (line 357-372)**

Remove the `max-w-md` constraint and add `flex-1` to each trigger:

```tsx
// Before
<Tabs value={mode} onValueChange={...} className="w-full max-w-md">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="universal">...</TabsTrigger>
    <TabsTrigger value="department">...</TabsTrigger>
  </TabsList>
</Tabs>

// After
<Tabs value={mode} onValueChange={...} className="w-full">
  <TabsList className="w-full">
    <TabsTrigger value="universal" className="flex-1">...</TabsTrigger>
    <TabsTrigger value="department" className="flex-1">...</TabsTrigger>
  </TabsList>
</Tabs>
```

### 2. Fix Tab Indicator Flickering

**File: `src/components/ui/tabs.tsx`**

The root cause: every `TabsTrigger` uses the same hardcoded `layoutId="tabIndicator"`. When multiple `Tabs` groups exist on the same page (Settings sub-tabs + Volume Config sub-tabs), framer-motion confuses the indicators and animates between unrelated tabs.

**Fix**: Generate a unique `layoutId` per `LayoutGroup` by passing a unique `id` prop to each `LayoutGroup`, and deriving the `layoutId` from it using React Context.

- Add a `TabsContext` that stores a unique ID (generated via `React.useId()`)
- In `TabsList`, pass this ID to `LayoutGroup`
- In `TabsTrigger`, read the context and use it to build a unique `layoutId` like `tabIndicator-{id}`

This ensures each `Tabs` instance animates its indicator independently without cross-talk.

