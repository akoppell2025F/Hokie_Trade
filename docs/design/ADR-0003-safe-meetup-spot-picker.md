# ADR-0003: Suggest a safe meetup spot from a fixed campus list with client-side rules

- **Status:** Proposed (change to Accepted when the PR is merged)
- **Date:** 2026-11-19
- **Deciders:** Development team (frontend developer, with product owner review)

## Context
- PRODUCT.md lists suggested safe on-campus meetup spots as a core feature. In our survey (12 responses), students rated trust in strangers on general marketplace apps at 2.25 out of 5, and getting scammed was their biggest worry. Meeting in a busy, public place is a basic way to lower that risk.
- Before this change, the message thread screen in `frontend/src/App.tsx` always showed one hardcoded spot ("Newman Library, main entrance"), whatever was being traded. That fits a textbook, but not a mini fridge someone has to carry from a dorm.
- The buyer had no way to choose a different spot or tell the seller which spot they wanted.
- The app is an Expo / React Native prototype with mock data in memory. There is no backend for listings or messages yet, and the app has no location permissions or map library.
- Constraints: work in Expo Go with no new native modules; keep the logic in `frontend/src/utils/` with no React imports so Jest can test it (the same pattern as `listingForm.ts` and `searchUtils.ts`); stay small enough for a semester project.

## Decision
We will add a pure TypeScript module, `frontend/src/utils/meetupSpots.ts`, that holds a fixed list of four public campus spots and a rule-based `suggestMeetupSpot(listing)` function. The message thread screen shows all four spots as a picker, marks the suggested one, and preselects it. The buyer can pick another spot and tap **Propose** to send it to the seller as a normal chat message. The choice resets each time a different listing is opened.

`suggestMeetupSpot` applies these rules in order, and the first match wins:
1. **A place the seller mentioned** in the title or description, matched as whole words against each spot's aliases (for example, "near West AJ" matches Dietrick Hall).
2. **Newman Library** if the listing has a course number (course materials).
3. **Dietrick Hall (D2)**, near the residence halls, if the listing mentions a bulky dorm item (fridge, couch, desk, and so on).
4. **Squires Student Center** for everything else.

### Design summary

```
frontend/src/utils/meetupSpots.ts
├── MeetupSpot (type)                 id, name, detail, aliases[]
├── MEETUP_SPOTS                      Newman Library, Squires Student Center,
│                                     Turner Place at Lavery Hall, Dietrick Hall (D2)
├── getMeetupSpot(id)                 → MeetupSpot | undefined
├── suggestMeetupSpot(listing)        rules 1–4 above → MeetupSpot (never undefined)
└── meetupMessage(spot)               → "Can we meet at <name> (<detail>)?"

frontend/src/App.tsx
├── state: meetupSpotId               null = use the suggested spot
├── openListing()                     resets meetupSpotId to null
├── postMessage(text)                 shared by typed messages and proposed spots
└── thread screen                     picker + "Suggested" badge + Propose button
```

```
  [ :Buyer ]              [ App (thread screen) ]          [ meetupSpots ]
      |                            |                              |
      | 1. tap Contact Seller      |                              |
      |--------------------------->|                              |
      |                            | 2. suggestMeetupSpot(listing)|
      |                            |----------------------------->|
      |                            | 3. return Dietrick Hall (D2) |
      |                            |<-----------------------------|
      | 4. picker shown, suggested |                              |
      |    spot preselected        |                              |
      |<---------------------------|                              |
      | 5. tap Newman Library      |                              |
      |--------------------------->| 6. setMeetupSpotId("newman") |
      | 7. tap Propose             |                              |
      |--------------------------->| 8. meetupMessage(spot)       |
      |                            |----------------------------->|
      |                            | 9. "Can we meet at Newman…?" |
      |                            |<-----------------------------|
      | 10. message added to chat; |                              |
      |     seller replies         |                              |
      |<---------------------------|                              |
  alt [buyer keeps the suggestion]: skip steps 5–6; Propose sends the suggested spot
  alt [buyer opens a different listing]: meetupSpotId resets; a new suggestion is made
```

## Consequences
- **Positive:**
  - Every trade gets a sensible public spot by default, and the buyer can change it in one tap.
  - The proposed spot is sent as a normal chat message, so both people can see what was agreed.
  - No new dependencies or permissions. It works in Expo Go as it is.
  - Fully unit tested: 13 Jest tests in `frontend/__tests__/meetupSpots.test.ts` cover every rule, rule order, capitalization, whole-word matching, and the fallback.
  - Adding or editing a spot changes one line of data, not the logic.
- **Negative:**
  - The spot list and rules are hardcoded in the app. Changing a spot means shipping a new version (or an EAS Update).
  - Keyword rules are simple. A listing that uses an unusual word, such as "loveseat", won't be treated as a bulky item.
  - The four spots were chosen by the team, not confirmed with Virginia Tech or VT Police.
  - Spots are text only, with no map or directions, which is less helpful for new students.
  - The seller can't propose a spot or accept or decline one. Agreement happens in the chat, and messages are still scripted in the prototype.
- **Follow-ups:**
  - Check with VT Police whether there is an official safe exchange location, and add or prefer it if there is.
  - Let sellers choose a preferred spot when they create a listing (`listingForm.ts`), and use it as rule 1.
  - When a backend exists, store the agreed spot with the trade and show it on the rating screen.
  - Consider a map view or a "Get directions" link once the app uses Expo Router.
  - Add a user story and acceptance criteria for this feature in `docs/requirements/`.

## Alternatives Considered
| Alternative | Why rejected |
|-------------|--------------|
| Keep the single hardcoded spot (Newman Library) | Doesn't fit bulky items or trades near the dorms, and the buyer can't change it or share it with the seller. |
| Suggest the nearest spot using the phone's location (`expo-location`) | Needs a location permission, adds a native module, and raises privacy concerns, all to choose between four spots on one campus. |
| Seller picks the spot when creating a listing | Useful, but it only covers new listings, and the buyer still needs a way to choose. Kept as a follow-up that can feed rule 1. |
| Store spots on a server | There is no backend for app data yet. A local list is enough for four spots and can move to a server later. |
| Let users type any meetup location | Defeats the safety goal, because users could pick private or isolated places. Users can still suggest other places in the chat. |

## Links
- [PRODUCT.md](../product/PRODUCT.md): suggested safe meetup spots; survey findings on trust and scams
- [Research](../research/): survey results
- Related: [ADR-0001](ADR-0001-python-smtp-email-verification.md) (email verification)
- Code: `frontend/src/utils/meetupSpots.ts`, `frontend/src/App.tsx` (thread screen); tests: `frontend/__tests__/meetupSpots.test.ts`
- PR: `feature/meetup-spot-picker` → `main`

---

*AI disclosure: drafted with Claude (Opus 5.5) using the course ADR and sequence-diagram templates (`docs/templates/adr.md`, `docs/templates/sequence-diagram.md`), based on the implemented `meetupSpots.ts`, its tests, and the changes to `App.tsx`. Reviewed and edited by [your name].*