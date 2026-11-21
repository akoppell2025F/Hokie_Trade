# Hokie Trade

A marketplace made only for verified Virginia Tech students to buy, sell, and trade textbooks, course supplies, dorm gear, and peer services (like tutoring). Listings can be searched by course number, and the app has in-app messaging, ratings, and suggested safe on-campus meetup spots.

**Course:** CS 3704, Project 2 (Fall 2026)

## Team

| Name | Email |
|---|---|
| Nathan Bezabeh | nathanb05@vt.edu |
| Nyla Eyob | nyla@vt.edu |
| Delina Gebrehiwot | delina@vt.edu |

Project 1 was built by The Bubble Guppies (Nathan Bezabeh, Nyla Eyob, Delina Gebrehiwot).

## The Problem

VT students trade things with each other all the time, but they use general apps and group chats (Facebook Marketplace, GroupMe, Instagram) that never confirm the other person is a student and are not organized around classes. In our survey (12 responses), students rated trust in strangers on general marketplace apps at 2.25 out of 5 on average, and their biggest worry was getting scammed.

## What Hokie Trade Does

- Sign up with an `@vt.edu` email and a verification code
- Search listings by course number (for example, "CS 3704"), title, or description
- Create a listing as a seller
- View a listing and its verified seller
- Message the seller inside the app
- See a suggested safe place to meet on campus
- Rate the trade afterward

## Project Status

This is a **working prototype** built with React Native, Expo, and TypeScript. It runs on a real phone through Expo Go. It uses **mock data** stored in memory, so nothing is saved, email verification is simulated in the app, and messages are scripted.

The `backend/` folder has a tested Python module that sends real verification codes by email over SMTP ([ADR-0001](docs/adr/ADR-0001-python-smtp-email-verification.md)). It is not connected to the app yet.

See the [open issues](../../issues) for known bugs and planned features.

## Documentation

- [Product requirements](docs/product/PRODUCT.md) – requirements, survey findings, and user stories
- [System design](docs/design/SYSTEM.md) – original planned architecture and data model (Next.js + Firebase; not what the prototype uses)
- [User stories](docs/requirements/) – US-001 search, US-002 email verification, US-003 VT email validation
- [Architecture decisions](docs/adr/) – ADR-0001, ADR-0002
- [Research](docs/research/) – survey results and usability study

## How to Run It

### What you need

- [Node.js](https://nodejs.org) (LTS) and npm
- [Git](https://git-scm.com)
- The **Expo Go** app on your phone (App Store or Google Play)
- Your phone and computer on the **same Wi-Fi network**
- Python 3.10+ (only for the backend tests)

### Steps

```bash
git clone https://github.com/akoppell2025F/Hokie_Trade
cd Hokie_Trade/frontend
npm install
npx expo start
```

1. A QR code will show in your terminal.
2. **iPhone:** scan it with the Camera app. **Android:** open Expo Go and tap "Scan QR code."
3. The app opens in Expo Go.

### Try the main flow

1. Enter an email ending in `@vt.edu` and tap **Send code**, then enter any 6 digits and tap **Verify**.
2. Type `CS 3704` in the search box.
3. Open the textbook listing and tap **Contact Seller**.
4. Send a message, then tap **Trade complete** and leave a rating.
5. Back on the browse screen, tap **+ Sell an item** to post your own listing.

### Run the tests

```bash
# frontend (Jest)
cd frontend
npm test
npx tsc --noEmit

# backend (pytest)
cd backend
pip install -r requirements.txt
pytest
```

### Troubleshooting

- **Phone cannot connect:** make sure your phone and computer are on the same Wi-Fi, and that your computer is not on a VPN.
- **Typing does not work in the Android emulator:** use a real phone with Expo Go instead.
- **A warning about `SafeAreaView` shows up:** it is only a deprecation notice and does not stop the app (tracked in the issues).

## Repository Layout

```
frontend/                 Expo / React Native app
  index.ts                Expo entry point
  app.json                Expo configuration
  assets/                 App icons and images
  src/App.tsx             All screens, mock data, and styles
  src/utils/              Search, email validation, and listing-form helpers
  __tests__/              Jest unit tests
backend/                  Python email verification module and pytest tests
docs/
  product/                Product requirements (PRODUCT.md)
  design/                 System design and implementation sketches
  adr/                    Architecture decision records
  requirements/           User stories
  research/               Survey results and usability study
  course-tooling/           CS3704 course agent setup (not needed to run the app)
AGENTS.md, CLAUDE.md      Instructions for AI coding tools
```

## AI Use

We used Claude and the course opencode agent template during this project. Details are in our final report.