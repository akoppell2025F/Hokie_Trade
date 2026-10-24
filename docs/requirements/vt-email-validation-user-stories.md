# User Stories: Hokie Trade

## US-003 — Restrict sign-up to Virginia Tech (@vt.edu) email addresses

**Story:** As a Virginia Tech student signing up for Hokie Trade, I want the app to accept only valid `@vt.edu` email addresses and show a clear error for anything else, so that the marketplace stays limited to the VT community.

**Acceptance Criteria**
1. Given the VT Email field on the login screen, when the user enters `alice@vt.edu` and taps **Send code**, then the address is accepted and the app moves to the verification screen.
2. Given the VT Email field, when the user enters ` Alice@VT.EDU ` (leading/trailing whitespace, mixed case) and taps **Send code**, then the value is trimmed, the domain is compared case-insensitively, and the app moves to the verification screen.
3. Given the VT Email field, when the user enters a personal address such as `alice@gmail.com` and taps **Send code**, then the app stays on the login screen, displays a field-level error stating that a valid `@vt.edu` address is required, and does not send a code.
4. Given the VT Email field, when the user enters malformed input — `alicevt.edu` (no `@`), `alice@vt@edu` (multiple `@`), `@vt.edu` (empty local part), or `alice@` (missing domain) — then each submission is rejected with the same field-level error and no code is sent.
5. Given the VT Email field, when the user enters a lookalike or non-exact domain — `alice@vt.edu.evil.com`, `alice@notvt.edu`, or `alice@cs.vt.edu` — then each submission is rejected with the field-level error and no code is sent.
6. Given a validation error is displayed, when the user edits the email field, then the error clears; when the user then submits a valid `@vt.edu` address, the app proceeds to the verification screen.
7. Given the validation function is called directly, outside the login form, when it receives a valid `@vt.edu` address it returns `true`, and when it receives any address rejected above it returns `false`.

**Priority:** Must-have (MoSCoW)

**Related requirements:** ADR-0002 — centralized VT email validation (design artifact for this enhancement); US-002 — email verification (the server-side flow that builds on this client-side gate); `validateEmail.ts` (`isVtEmail`) and `handleSendCode` in `App.tsx`.

**Assumptions / dependencies:**
- The current version is an Expo/React Native prototype with **no backend API**, so validation runs in the client. This is a known limitation recorded in ADR-0002; server-side enforcement is a follow-up once a backend exists.
- A valid `@vt.edu` address proves VT affiliation only; it does **not** prove current student status. Verifying current enrollment is out of scope for this story.
- Email ownership verification is simulated in the prototype; no real code is sent. Real email verification is out of scope.
- "Valid" is defined as: exactly one `@`, a non-empty local part, and a domain that is exactly `vt.edu` compared case-insensitively after trimming leading and trailing whitespace. Subdomains and lookalike/suffix domains are invalid.
- The client-side check is the only enforcement in this prototype and therefore cannot stop a determined user from bypassing the UI; closing that gap requires the backend follow-up in ADR-0002.
