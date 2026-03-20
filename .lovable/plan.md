

## Change Volume Badge Text to "Viewing: [UOS names]"

### What Changes
**File: `src/components/staffing/DraggableKPISection.tsx`** — Line 229-231

Replace the current badge text that shows values (`Pat Days + Obs: 12,400 · Total Pat Days + Obs: 8,200`) with just the UOS names prefixed by "Viewing:":

```
Viewing: Pat Days + Obs · Pat Days + Obs _ Newborn · Total Pat Days + Obs
```

No values shown in the badge — just the unit-of-service type names. The modal (opened on click) will continue to show the detailed values.

### Technical Detail
Change line 230 from:
```tsx
{volumeBreakdown.map(d => `${d.label}: ${d.value.toLocaleString()}`).join(' · ')}
```
to:
```tsx
Viewing: {volumeBreakdown.map(d => d.label).join(' · ')}
```

Single line change. Modal remains unchanged.

