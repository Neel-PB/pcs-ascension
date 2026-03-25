

## Add Ascension Logo & Rename Title on Auth Page

### Changes

**File: `src/pages/AuthPage.tsx`**

1. Import the Ascension logo: `import AscensionLogo from "@/assets/Ascension-Emblem.svg";`
2. In the `CardHeader`, add the logo image centered above the title and change "Position Control Dashboard" to "Position Control":

```tsx
<CardHeader className="space-y-1">
  <div className="flex justify-center mb-2">
    <img src={AscensionLogo} alt="Ascension" className="w-12 h-12 object-contain" />
  </div>
  <CardTitle className="text-2xl font-bold text-center">
    Position Control
  </CardTitle>
  ...
</CardHeader>
```

One file changed, two small edits.

