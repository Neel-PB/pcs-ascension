

## Improve FAQ Accordion Layout & Colors

### Problem
The FAQ accordion items look plain — the border/background blend into the page, and the expanded state has no visual distinction. The chevron and text styling feel flat.

### Design
Restyle the accordion items to feel more polished:

1. **Collapsed state**: Light blue-tinted background (`bg-primary/5`), subtle left accent border (`border-l-3 border-l-primary`), rounded corners, no full border
2. **Trigger row**: Remove underline hover, add hover background (`hover:bg-primary/10`), use `text-foreground` with medium weight, pad properly (`py-3 px-4`)
3. **Expanded content**: Slightly different background (`bg-muted/30`), top border separator, comfortable padding (`px-4 pb-4`), `text-muted-foreground` for the answer
4. **Chevron**: Brand blue color (`text-primary`), smooth rotation
5. **Spacing**: `space-y-3` between items for breathing room

### File: `src/pages/support/SupportPage.tsx` (lines 110-119)

Replace the Accordion markup:
```tsx
<Accordion type="single" collapsible className="space-y-3">
  {filteredFaqs.map((faq, index) => (
    <AccordionItem 
      key={index} 
      value={`faq-${index}`} 
      className="border border-border/60 border-l-[3px] border-l-primary bg-primary/5 rounded-lg overflow-hidden"
    >
      <AccordionTrigger className="hover:no-underline hover:bg-primary/10 px-4 py-3 transition-colors [&>svg]:text-primary">
        <span className="text-left font-medium text-foreground">{faq.question}</span>
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground bg-background/60 border-t border-border/40 px-4 pb-4 pt-3">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

Single file, styling-only change.

