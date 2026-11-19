# Hokie Trade Product Requirements Document (PRODUCT.md)

## 1. Problem Statement
Virginia Tech students regularly buy, sell, or trade goods and services with one another: textbooks, dorm furniture, tutoring, event tickets, rides, and more, but no dedicated platform supports this exchange within the campus community. Students currently rely on general-purpose tools (Facebook Marketplace, GroupMe, Instagram pages, physical flyers), none of which verify the other party is actually a VT student, and none of which are organized around VT-specific context like course numbers.

## 2. Vision
Hokie Trade is a peer-to-peer marketplace built exclusively for verified Virginia Tech students to buy, sell, and trade textbooks, course supplies, dorm gear, and peer services (tutoring, rides, etc.), searchable by course number and tailored to campus life.

## 3. Target Users
- Undergraduate and graduate VT students (freshman through senior, all majors)
- Buyers: looking for cheap textbooks/supplies for a specific course, or a tutor/service
- Sellers: students with used textbooks, unused dorm items, or skills to offer

## 4. Requirements Elicitation Findings
A survey of 12 respondents (11 current VT students) informed the requirements below:
- Trust in strangers on general marketplace apps is low (average 2.25 out of 5, no rating above 3).
- Fear of scams was the top reason students hesitate to use peer-to-peer trading apps, even though no respondent had personally been scammed yet.
- 7 of 12 respondents rated VT-only verification as important (4 to 5 out of 5), while 4 rated it 1 or 2.
- Most requested features: in-app messaging, verified @vt.edu accounts, buyer/seller ratings and reviews, suggested safe on-campus meetup spots, and service listings (tutoring, rides, etc.).
- Most respondents said they would "probably" or "definitely" use a VT-exclusive marketplace app.

These findings directly shaped the MVP scope below: trust and safety features moved from stretch goals into MVP, since they are the top concern of actual target users.

## 5. MVP Scope (must-have for demo)

### 5.1 Authentication
- Sign up / log in restricted to @vt.edu email addresses (verified via email confirmation link)
- Basic user profile: name, year, major (optional), profile photo (optional)

### 5.2 Listings
- Create a listing with: title, description, category (Textbook, Supplies, Dorm Gear, Service), price, course number (optional, required for textbooks/supplies), condition (for physical items), photo upload
- Edit / delete own listings
- Mark a listing as "Sold" / "Unavailable"

### 5.3 Browse & Search
- Browse all active listings, newest first
- Filter by category
- Filter/search by course number (e.g. "CS 3704")
- Basic keyword search (title/description)

### 5.4 Listing Detail Page
- Full listing info plus seller name/year
- "Contact Seller" button

### 5.5 Messaging
- Simple in-app chat between buyer and seller tied to a listing
- Message list / inbox view

### 5.6 Trust & Safety (moved into MVP based on survey findings)
- Buyer/seller ratings and reviews after a completed trade
- Suggested safe on-campus meetup spots (e.g. library, student center) shown when arranging a trade

### 5.7 Profile
- View own active listings
- View own past/sold listings
- View ratings received

## 6. Stretch Goals (post-MVP, if time allows)
- In-app payments (Stripe); MVP defaults to arranging payment in person, Venmo, etc.
- AI-powered service/listing matching
- Push/email notifications for new listings matching saved searches
- Saved/favorited listings
- ID verification beyond VT email

## 7. Out of Scope (explicitly not building for MVP)
- Payment processing / escrow
- Shipping/delivery logistics
- Admin moderation dashboard (manual moderation only, if needed)
- Native mobile app (web-first, responsive)

## 8. Success Metrics (for demo/grading)
- A user can sign up with a VT email, create a listing, and have another user find it via course-number search and message them, end to end, with no errors.
- Clean, working demo covering: auth, create listing, browse/filter/search, view detail, message seller, leave a rating.

## 9. User Stories (core, grounded in survey data)
1. As a VT student, I want to see that every user is verified with a @vt.edu email so I trust the platform more than Facebook Marketplace or GroupMe.
2. As a buyer, I want in-app messaging with a seller so I don't have to exchange personal contact info with a stranger.
3. As a buyer/seller, I want to rate the other person after a trade so future users can gauge trustworthiness.
4. As a student arranging a trade, I want suggested safe on-campus meetup spots so I don't have to meet a stranger somewhere risky.
5. As a student who tutors or offers rides, I want to list my service alongside physical goods so classmates can find and book me.
6. As a buyer, I want to filter listings by course number so I only see what's relevant to my classes.
7. As a user, I want to get notified when a new listing matches something I'm looking for, so I don't have to keep checking manually. (stretch)