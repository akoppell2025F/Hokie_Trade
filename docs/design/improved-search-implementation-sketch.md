# Implementation Sketch: Improved Listing Search

**Requirement:** [US-001](../requirements/improved-search-user-stories.md)

## Problem with the original search
The browse screen filtered listings inline in `App.tsx`:

```ts
const filtered = listings.filter(l =>
  !query ||
  l.course.toLowerCase().includes(query.toLowerCase()) ||
  l.title.toLowerCase().includes(query.toLowerCase())
);
```

- Spaces had to match exactly, so `cs3704` didn't find `CS 3704`, and extra spaces broke the search.
- Descriptions were never searched (e.g. "West AJ" only appears in a description).
- The logic was inside the component, so it couldn't be unit tested without rendering the app.

## New logic (`searchUtils.ts`)

**`normalizeSearch(text)`**: lowercases the text and removes all whitespace with `/\s+/g`. Example: `"  CS 3704 "` → `"cs3704"`.

**`filterListings(listings, query)`**: normalizes the query once, then keeps every listing whose normalized `course`, `title`, or `desc` contains it.
- Empty or all-space query → normalizes to `""`, which every string contains, so all listings are returned.
- No match → `filter` returns an empty array, so no cards are shown.
- It's generic (`<T extends SearchableListing>`), so it returns the same full `Listing` objects that `App.tsx` passes in.

## How `App.tsx` uses it
`App.tsx` imports `filterListings` and replaces the inline filter with:

```ts
const filtered = filterListings(listings, query);
```

The `query` state, the search `TextInput`, and the card rendering (`filtered.map(...)`) are unchanged. Each time the user types, `setQuery` re-renders the screen and `filterListings` recalculates the list.

## Why the logic was separated
`searchUtils.ts` has no React or React Native imports. That makes both functions pure and easy to unit test with Vitest, and it keeps the search rule out of `App.tsx`, which already holds every screen and all the styles.

## Testing
`searchUtils.test.ts` (Vitest) covers capitalization, spacing, course numbers without spaces, title search, description search, empty and whitespace-only searches, and no matches. Run with `npx vitest run`.

**Known limits:** punctuation isn't normalized (`CS-3704` won't match `CS 3704`), and there is no typo tolerance.

---

*AI disclosure: drafted with Claude Code (Opus 5.5) from the actual code and tests. Reviewed by Anvit Koppella.*
