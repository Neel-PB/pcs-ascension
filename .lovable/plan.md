

## Remove Static FAQs — Show Only Database FAQs

Single file edit in `src/pages/support/SupportPage.tsx`:

1. Delete the `hardcodedFaqs` array entirely
2. Remove the merge logic (`allFaqs`) — use `dbFaqs` directly
3. Update `filteredFaqs` to filter from `dbFaqs` instead of `allFaqs`

