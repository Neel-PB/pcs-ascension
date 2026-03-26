

## Restyle Auth Page Header: Logo + Title Inline

### Current Layout
```text
       [Logo]
  Position Control
Enter your email to continue
```

### Desired Layout
```text
  [Logo]  Position Control
```
Logo on the left, title to the right, both centered as a row. No subtitle/subheader text.

### Changes

**File: `src/pages/AuthPage.tsx`** (lines 97-109)

Replace the current `CardHeader` content:
- Combine logo and title into a single horizontal `flex` row, centered
- Remove the `CardDescription` entirely (no more "Enter your email to continue" etc.)

```tsx
<CardHeader className="space-y-1">
  <div className="flex items-center justify-center gap-3">
    <img src={AscensionLogo} alt="Ascension" className="w-10 h-10 object-contain" />
    <CardTitle className="text-2xl font-bold">
      Position Control
    </CardTitle>
  </div>
</CardHeader>
```

One file, ~12 lines replaced with ~7 lines. No other changes needed.

