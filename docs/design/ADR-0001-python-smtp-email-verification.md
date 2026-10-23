# ADR-0001: Send verification emails from a Python backend module using smtplib

- **Status:** Accepted
- **Date:** 2026-10-23
- **Deciders:** Development team (backend developer, with product owner review)

## Context
- US-002 requires that a real 6-digit code be emailed to a student's @vt.edu address before they can use Hokie Trade. Before this change, the prototype only checked the email's ending, and the Verify screen accepted any code.
- The app is an Expo / React Native prototype (`App.tsx`) that runs on phones through Expo Go. It cannot run Python, and it cannot safely send email itself: any mail password bundled into the app could be pulled out by anyone who downloads it.
- SYSTEM.md planned Firebase Auth (email link) with Next.js. That stack has not been built, and the current UI already uses a 6-digit code, not a link.
- The team wants this piece written in Python, using the standard library (`smtplib`, `email.message.EmailMessage`), and covered by automated pytest tests that never send real email.
- Constraints: no credentials committed to the repo; it must work with free sending options (Gmail app password, SendGrid, Brevo, Mailtrap for testing); and it must stay small enough for a semester project.

## Decision
We will add a standalone Python module, `backend/email_verification.py`, that validates the @vt.edu address, generates a 6-digit code with `secrets`, builds the message with `EmailMessage`, and sends it with `smtplib.SMTP` using STARTTLS (default port 587). Mail settings come from environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_SENDER`). The function returns the code to the caller, which is responsible for storing and checking it.

### Design summary

```
backend/email_verification.py
├── SmtpConfig (frozen dataclass)   host, port, username, password, sender
│     └── from_env()                reads SMTP_* env vars → SmtpConfig
├── normalize_vt_email(email)       trim + lowercase, require "<local>@vt.edu"
├── generate_verification_code()    6 digits from secrets.choice
├── build_verification_email(...)   EmailMessage (Subject / From / To / body)
├── send_verification_email(to, code=None, config=None) -> code
├── InvalidEmailError (ValueError)  bad / non-VT address
└── EmailSendError (RuntimeError)   missing settings, SMTP or network failure
```

```
  [ :Caller ]          [ email_verification ]         [ SMTP server ]
      |                          |                            |
      | 1. send_verification_    |                            |
      |    email("Hokie@VT.edu") |                            |
      |------------------------->|                            |
      |                          | 2. normalize_vt_email()    |
      |                          |    → "hokie@vt.edu"        |
      |                          | 3. generate code, load     |
      |                          |    SmtpConfig.from_env()   |
      |                          | 4. connect, starttls()     |
      |                          |--------------------------->|
      |                          | 5. login(user, password)   |
      |                          |--------------------------->|
      |                          | 6. send_message(msg)       |
      |                          |--------------------------->|
      | 7. return "048213"       |                            |
      |<-------------------------|                            |
  alt [address not @vt.edu]: step 2 raises InvalidEmailError; no connection is made
  alt [SMTP / network error]: steps 4–6 raise EmailSendError
```

## Consequences
- **Positive:**
  - No new runtime dependencies, because `smtplib`, `email`, and `secrets` are part of Python's standard library. Only `pytest` is added for development.
  - Works with any SMTP provider. Switching from Gmail to SendGrid or Brevo only changes `.env`, not code.
  - Credentials stay out of the repo and out of the phone app.
  - Fully testable offline: tests replace `smtplib.SMTP` with a mock (`backend/tests/conftest.py`), and 19 tests cover every US-002 acceptance criterion.
  - Typed errors (`InvalidEmailError`, `EmailSendError`) let a future endpoint turn failures into clear messages for the app. The invalid-email message matches the text already shown in `App.tsx`.
- **Negative:**
  - It adds a second language and runtime (Python next to TypeScript), and the app can't use it until a server is running.
  - It departs from the Firebase Auth plan in SYSTEM.md, which will need updating.
  - Sending is synchronous and can block for up to the 10-second timeout.
  - The module does not store codes, expire them, or limit how often they are requested. The caller must do this.
  - Free providers have daily send limits, and a new sender may land in VT spam folders.
- **Follow-ups:**
  - Add a small HTTP API (e.g. Flask or FastAPI) with "send code" and "verify code" endpoints that call this module.
  - Store each code (hashed) with an expiry, such as 10 minutes, and limit how often codes can be requested and how many wrong guesses are allowed.
  - Update the Send code and Verify buttons in `App.tsx` to call the API instead of advancing screens locally.
  - Update SYSTEM.md to reflect the Python backend.

## Alternatives Considered
| Alternative | Why rejected |
|-------------|--------------|
| Firebase Auth email-link sign-in (the SYSTEM.md plan) | Requires adopting Firebase before it is otherwise needed, sends a link rather than the 6-digit code the current UI expects, and the team chose to implement the logic in Python. It can still be revisited in a later ADR. |
| Send email directly from the Expo app | React Native can't open SMTP connections, and the mail password would ship inside the app where anyone could pull it out. |
| A provider's SDK or HTTP API (e.g. SendGrid's Python library) | Adds a third-party dependency and ties the code to one vendor. Plain SMTP already works with those providers. |
| `smtplib.SMTP_SSL` on port 465 | Works too, but STARTTLS on 587 is the more common default across providers. A future option could support both. |
| Simulated code (the existing prototype behavior) | Doesn't actually verify anything, so it fails US-002 and the trust goal in PRODUCT.md. |

## Links
- Requirement: [US-002 — Send a verification code to my VT email](../requirements/email-verification-user-stories.md)
- PRODUCT.md §5.1 (Authentication), §9 user story 1; SYSTEM.md §5 (Auth Flow)
- Code: `backend/email_verification.py`; tests: `backend/tests/test_email_verification.py`

---

*AI disclosure: drafted with Claude (Opus 5.5) using the course ADR and sequence-diagram templates (`docs/templates/adr.md`, `docs/templates/sequence-diagram.md`), based on the implemented `email_verification.py` and its tests. Reviewed and edited by [your name].*