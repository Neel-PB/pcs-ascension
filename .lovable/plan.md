

## Change Workforce Drawer Trigger to Filled Variant

### Problem

The Workforce/Positions Checklist trigger button on the right edge currently uses `variant="ghost"` with manual `bg-primary` overrides. The user wants it to use a proper filled (default) variant instead.

### Change

**File: `src/components/workforce/WorkforceDrawerTrigger.tsx`**

Switch `variant="ghost"` to `variant="default"` on the Button. Since the `default` variant already applies `bg-primary text-primary-foreground hover:bg-primary/90`, the manual `bg-primary hover:bg-primary/90 text-white` classes become redundant and can be removed for cleanliness.

```
Before: variant="ghost" className="... bg-primary hover:bg-primary/90 ... text-white"
After:  variant="default" className="... shadow-xl active:scale-95 transition-all duration-300 ease-out ..."
```

This only affects the single Workforce Drawer trigger button -- the AI Hub and Feedback triggers remain unchanged.

