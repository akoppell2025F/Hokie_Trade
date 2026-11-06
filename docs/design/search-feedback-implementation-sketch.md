# Implementation Sketch: Search Result Feedback

**Requirements:** [US-004, US-005, US-006](../requirements/search-feedback-user-stories.md)

## What changed
The browse screen already filtered listings with `filterListings` (US-001), but it only rendered
the matching cards. If nothing matched, the user got a blank area, there was no way to reset the
search except backspacing, and nothing said how many listings matched.

This change adds three pieces of feedback to the browse screen: an empty-state message, a Clear
button, and a result count. The search logic itself is untouched.

## New helpers (`searchUtils.ts`)

Both are pure functions in the same file as `filterListings`, so the browse screen stays mostly
JSX and the rules can be unit tested without rendering the app.

**`showClearButton(query)`**: `true` once the query has a non-space character. A spaces-only query
is treated as no search, which matches how `filterListings` already handles it (`"   "` normalizes
to `""` and returns everything), so the button doesn't appear when there is nothing to clear.

**`resultCountText(count)`**: builds the count line, picking "listing" vs "listings" so one match
reads "1 listing found" instead of "1 listings found" (US-006 AC2).

The empty-state message is a plain string in the JSX rather than a helper, since it never varies.

## How `App.tsx` uses them

The search `TextInput` moved into a `searchRow` so the Clear button can sit beside it:

```tsx
<View style={styles.searchRow}>
  <TextInput style={[styles.searchInput, { flex: 1 }]} value={query} onChangeText={setQuery} ... />
  {showClearButton(query) ? (
    <TouchableOpacity style={styles.clearBtn} onPress={() => setQuery('')}>
      <Text style={styles.clearBtnText}>Clear</Text>
    </TouchableOpacity>
  ) : null}
</View>
<Text style={styles.resultCount}>{resultCountText(filtered.length)}</Text>
```

Clear just calls `setQuery('')`. Because `filtered` is recomputed from `query` on every render,
emptying the query re-runs `filterListings` with `""`, which returns every listing, and
`showClearButton('')` then hides the button again — no extra state to keep in sync.

Inside the `ScrollView`, the card list is guarded by the match count:

```tsx
{filtered.length === 0 ? (
  <Text style={styles.emptyText}>No listings found</Text>
) : filtered.map(l => ( /* card, unchanged */ ))}
```

`filtered.length === 0` covers both "the search matched nothing" and "there are no listings at
all" (US-004 AC3) with the same branch.

New styles follow the existing palette: `searchRow`, `clearBtn` / `clearBtnText` (tan button with
maroon text, like the other secondary controls), `resultCount` (small muted gray text), and
`emptyText` (centered muted text).

## Alternatives considered
- **An X icon inside the TextInput.** Closer to iOS convention, but it needs absolute positioning
  and a bigger tap target to be usable; a labeled button is clearer and simpler for a prototype.
- **Hiding the count when the search is empty.** Rejected — the count also tells a new user how
  many listings exist, and always showing it keeps the layout from shifting as they type.
- **Keeping the two rules inline in `App.tsx`.** They'd be one-liners, but putting them in
  `searchUtils.ts` means the plural rule and the spaces-only rule get real tests.

## Testing
`searchUtils.test.ts` adds cases for `showClearButton` (empty, spaces-only, typed query),
`resultCountText` (singular, zero, many, and the count of an actual `filterListings` result), and
a clear-the-search case asserting that an emptied query returns every listing again. The existing
US-001 tests still cover the filtering. Run with `npm test`.

**Known limits:** the empty state is one fixed message — it doesn't suggest a broader search or
offer to clear the search from inside the message. The count is not announced to screen readers
as a live region, so a VoiceOver user has to move focus to it to hear the new number.
