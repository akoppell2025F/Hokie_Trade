# Hokie Trade — System Design (SYSTEM.md)

## 1. Tech Stack
- **Frontend:** Next.js (React) + TypeScript, Tailwind CSS
- **Backend/DB:** Firebase (Firestore for data, Firebase Auth for login, Firebase Storage for listing photos)
- **Hosting/Deployment:** Vercel (frontend), Firebase (backend services)
- **Messaging:** Firestore real-time listeners (no separate service needed for MVP)

This stack was chosen because it matches the team's existing experience (Next.js, Firebase), keeps infrastructure simple for a semester-length MVP, and gives free-tier hosting for both frontend and backend.

## 2. High-Level Architecture

```
[ Browser ]
     |
     v
[ Next.js App (Vercel) ]
     |
     |-- Firebase Auth  (VT email sign-up/login)
     |-- Firestore       (listings, users, messages)
     |-- Firebase Storage (listing photos)
```

- Client-side app talks directly to Firebase SDKs (Auth, Firestore, Storage) — no custom backend server needed for MVP.
- Firestore Security Rules enforce: only authenticated `@vt.edu` users can read/write listings and messages; users can only edit/delete their own listings.

## 3. Data Model (Firestore Collections)

### `users`
| Field | Type | Notes |
|---|---|---|
| uid | string | Firebase Auth UID (doc ID) |
| email | string | must end in @vt.edu |
| name | string | |
| year | string | optional (Freshman–Grad) |
| major | string | optional |
| photoUrl | string | optional |
| createdAt | timestamp | |

### `listings`
| Field | Type | Notes |
|---|---|---|
| id | string | doc ID |
| sellerId | string | ref to users.uid |
| title | string | |
| description | string | |
| category | enum | Textbook / Supplies / DormGear / Service |
| courseNumber | string | optional, e.g. "CS3704" |
| price | number | |
| condition | string | optional, physical items only |
| photoUrls | array<string> | |
| status | enum | Active / Sold |
| createdAt | timestamp | |

### `messages`
| Field | Type | Notes |
|---|---|---|
| id | string | doc ID |
| listingId | string | ref to listings.id |
| participants | array<string> | [buyerId, sellerId] |
| senderId | string | |
| text | string | |
| createdAt | timestamp | |

(Messages grouped into a `conversationId` = `listingId_buyerId_sellerId` for easy querying of a thread.)

## 4. Core App Screens / Routes
| Route | Purpose |
|---|---|
| `/signup`, `/login` | VT email auth |
| `/` | Browse/search/filter listings |
| `/listing/[id]` | Listing detail + contact seller |
| `/listing/new` | Create listing form |
| `/messages` | Inbox of conversations |
| `/messages/[conversationId]` | Individual chat thread |
| `/profile` | Own listings (active + sold) |

## 5. Auth Flow
1. User signs up with VT email via Firebase Auth (email/password or email link).
2. On signup, reject if email doesn't end in `@vt.edu`.
3. Create corresponding `users` doc in Firestore.
4. Session persisted via Firebase Auth client SDK; protected routes redirect to `/login` if unauthenticated.

## 6. Search/Filter Implementation (MVP)
- Category filter: simple Firestore `where("category", "==", ...)` query.
- Course number filter: `where("courseNumber", "==", ...)` (exact match for MVP; fuzzy search is a stretch goal).
- Keyword search: client-side filter on title/description for MVP (Firestore doesn't support full-text search natively); could upgrade to Algolia post-MVP if needed.

## 7. Non-Functional Requirements
- **Security:** Firestore rules restrict all reads/writes to authenticated `@vt.edu` users; users can only mutate their own listings/profile.
- **Performance:** Listings paginated (e.g. 20 per page) to avoid loading entire collection.
- **Responsiveness:** Mobile-first layout via Tailwind, since most students will browse on phones.

## 8. Deployment
- Frontend: connected to Vercel via GitHub for auto-deploy on push to `main`.
- Backend: Firebase project (Auth + Firestore + Storage) configured via `.env` (Firebase config keys), not committed to repo.
