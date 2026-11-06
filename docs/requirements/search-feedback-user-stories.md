# User Stories: Hokie Trade – Search Result Feedback (PM2.2)

These stories build on [US-001 (forgiving search)](improved-search-user-stories.md). US-001 made the search
*find* the right listings; these three make the browse screen explain what the search just did.

## US-004 — Tell me when a search matched nothing

**Story:** As a VT student browsing listings, I want the browse screen to say so when my search matches nothing, so that I know my search ran and came back empty instead of wondering whether the app is broken or still loading.

**Background:** Before this change, a search with no matches rendered an empty scroll area under the search box. Nothing on screen distinguished "no listings match CS 1114" from "the app failed to load listings." The usability notes in `usability_report` flagged the blank screen as confusing.

**Acceptance Criteria**
1. **Empty result:** Given the browse screen is open, when I search `biology` and no listing's course, title, or description matches, then the screen shows the message "No listings found".
2. **Non-empty result:** Given at least one listing matches my search, when the results render, then the "No listings found" message is not shown and the matching listing cards are shown instead.
3. **No listings at all:** Given the search box is empty and there are no listings to show, when the browse screen renders, then the same "No listings found" message is shown.

**Priority:** Must-have (MoSCoW) — an unexplained blank screen reads as a bug.

---

## US-005 — Clear my search in one tap

**Story:** As a VT student who just searched for a course number, I want a Clear button next to the search box, so that I can get back to the full listing list without deleting my search text one character at a time on a phone keyboard.

**Acceptance Criteria**
1. **Hidden when empty:** Given the search box is empty, when the browse screen renders, then no Clear button is shown.
2. **Hidden for spaces only:** Given the search box contains only spaces, when the browse screen renders, then no Clear button is shown, because there is no real search to clear.
3. **Shown after typing:** Given I have typed `cs3704` into the search box, when the browse screen renders, then a Clear button is shown next to the search box.
4. **Resets the search:** Given I have searched `cs3704` and one listing is shown, when I tap Clear, then the search box is emptied, every listing is shown again, and the Clear button disappears.

**Priority:** Must-have (MoSCoW) — the browse screen has no other way back to the full list.

---

## US-006 — See how many listings matched

**Story:** As a VT student searching for something to buy, I want to see how many listings matched my search, so that I know whether to scroll for more options or make my search broader.

**Acceptance Criteria**
1. **Count is shown:** Given the browse screen is open, when results render, then a line above the list reports the number of matching listings (e.g. "3 listings found").
2. **Singular wording:** Given exactly one listing matches, when results render, then the line reads "1 listing found", not "1 listings found".
3. **Zero matches:** Given no listing matches, when results render, then the line reads "0 listings found" and appears alongside the US-004 "No listings found" message.
4. **Updates with the search:** Given a search is showing a count, when I change or clear the search, then the count updates to the new number of matching listings.

**Priority:** Should-have (MoSCoW) — useful feedback, but students can still browse without it.

---

**Related requirements:** PRODUCT.md §5.3 (Browse & Search). Design: [docs/design/search-feedback-implementation-sketch.md](../design/search-feedback-implementation-sketch.md).

**Assumptions / dependencies:**
- Listings are still the in-memory mock data in `App.tsx`; there is no backend search or paging, so the count is the full number of matches, not a page size.
- Filtering still comes from `filterListings` in `searchUtils.ts` (US-001); these stories only change what the browse screen displays about the result.
