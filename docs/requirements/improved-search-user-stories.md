# User Stories: Hokie Trade – Improved Listing Search

## US-001 — Forgiving search across course, title, and description

**Story:** As a VT student looking for something to buy, I want the search box to find listings no matter how I type the course number or keyword, so that I don't miss a listing just because I typed "cs3704" instead of "CS 3704" or the word I searched for is only in the description.

**Background:** In the original prototype, search only checked the course and title fields and compared the raw text in lowercase. Typing `cs3704` returned nothing because the listing's course is stored as `CS 3704`, and anything only mentioned in a description (like "West AJ") could not be found at all. PRODUCT.md §5.3 lists both course-number search and keyword search on title/description as MVP features.

**Acceptance Criteria**
1. **Capitalization:** Given the browse screen is open, when I search `cs 3704` or `CS 3704`, then the CS 3704 textbook listing is shown either way.
2. **Spacing:** Given the browse screen is open, when I search `cs3704` or `  CS 3704  ` (extra spaces), then the CS 3704 textbook listing is shown.
3. **Course number search:** Given a listing has the course `MATH 2114`, when I search `math2114`, then that listing is shown.
4. **Title search:** Given a listing titled "Mini Fridge — dorm size" with no course number, when I search `mini fridge`, then that listing is shown.
5. **Description search:** Given a listing whose description mentions "West AJ" but whose title and course do not, when I search `west aj`, then that listing is shown.
6. **Empty search:** Given the search box is empty or contains only spaces, when the browse screen shows results, then every listing is shown.
7. **No match:** Given no listing's course, title, or description contains the search text, when I search `biology`, then no listings are shown.

**Priority:** Must-have (MoSCoW) — course-number search is the main way students find textbooks, and it's part of the MVP in PRODUCT.md §5.3.

**Related requirements:** PRODUCT.md §5.3 (Browse & Search), PRODUCT.md §9 user story 6 (filter listings by course number). Design: [docs/design/improved-search-implementation-sketch.md](../design/improved-search-implementation-sketch.md).

**Assumptions / dependencies:**
- Listings are still the in-memory mock data in `App.tsx`; there is no backend search.
- Matching is a simple "contains" check after normalization. Typos, punctuation (e.g. `CS-3704`), and result ranking are not handled and are out of scope for this story.

---

*AI disclosure: drafted with Claude Code (Opus 5.5) using the course user-story template, based on the implemented `searchUtils.ts` and its tests. Reviewed and edited by Anvit Koppella.*
