

# Switch Staffing Icon to Outlined People Variant

## Change

Update `src/lib/icons.ts` to use `MdPeopleOutline` instead of `MdPeople` for the `Users` alias.

| Current | New | Alias |
|---|---|---|
| `MdPeople` (filled) | `MdPeopleOutline` (outlined) | Users |

## Technical Detail

In `src/lib/icons.ts`, line 89:
- Change `MdPeople as Users` to `MdPeopleOutline as Users`

No other files need changes since all components import `Users` from `@/lib/icons`.

This affects the Staffing sidebar icon and anywhere else `Users` is referenced (e.g., `AIWelcomeCards`, `RecipientMultiSelect`).

