# ADR-0001: Centralize VT Email Validation in a Single Anchored-Regex Module

- **Status:** Accepted
- **Date:** 2026-10-23
- **Deciders:** Requirements Analyst, System Architect, Build

## Context
Hokie Trade is a Virginia Tech-only marketplace: the product premise is that every account holder is reachable at a VT address. The current app is an Expo/React Native prototype with no backend API, so the sign-up gate lives entirely in the client.

The sign-up screen originally accepted any syntactically valid email. The enhancement must accept only `@vt.edu` addresses and reject everything else with a clear error.

Additional forces shaping this decision:

- **Domain matching must be exact.** The intuitive implementations are the dangerous ones: suffix checks (`endsWith("@vt.edu")` is safe only by accident, and `endsWith("vt.edu")` is not) and substring checks admit lookalikes such as `alice@vt.edu.evil.com` or `alice@notvt.edu`. Subdomain handling must be an explicit decision, not an accident of string matching.
- **The rule needs one definition.** The check is used from the login handler today and will be reused by future entry points (invites, profile changes, a future backend). Copying the regex into each call site invites drift.
- **Case and whitespace are not meaningful here.** Users paste addresses with surrounding spaces and type mixed-case domains; the rule should normalize those before deciding.
- **A clear sign-up error is a usability requirement.** A silent rejection or a generic failure leaves the user unable to correct the problem; the message must be field-level and actionable.
- **Client-only enforcement is a known limitation in this prototype.** With no backend, a determined caller can invoke the flow directly. The design should keep the rule reusable so the eventual server can enforce the same definition.

## Decision
We will define the rule once in `validateEmail.ts` as an exported `isVtEmail(value)` that trims the input and tests it against the anchored, case-insensitive pattern `/^[A-Za-z0-9._%+-]+@vt\.edu$/i`; `handleSendCode` in `App.tsx` will call it before advancing to verification and will show a field-level error without navigating when it returns `false`.

## Consequences
- **Positive:**
  - One exported function is the single definition of "valid VT email"; every current and future caller inherits identical behavior.
  - The anchors (`^` and `$`) plus the escaped dot make the domain match exact, rejecting subdomains (`@cs.vt.edu`) and lookalikes (`@vt.edu.evil.com`, `@notvt.edu`).
  - Trimming and the `i` flag handle pasted whitespace and mixed-case domains without extra branching.
  - The function is pure and easy to unit test independently of the UI.
  - Rejection is handled in the UI with a field-level message, so the user can correct the address instead of losing the form.
- **Negative:**
  - Enforcement is client-side only. Because there is no backend, a caller can bypass the screen and there is no authoritative check; this is acceptable for the prototype but not for production.
  - The regex validates shape, not mailbox ownership: a mistyped or unread address still passes, and the verification code is simulated.
  - `@vt.edu` proves affiliation, not current student status; alumni and staff with live addresses pass.
  - The local-part character class is a pragmatic subset of RFC 5322, so unusual but technically valid addresses are rejected.
  - The on-screen hint says "Must end in @vt.edu", which describes a suffix rule and does not match the exact-domain rule; the copy should be corrected.
  - Subdomain addresses (e.g., department-hosted `@cs.vt.edu`) are rejected by deliberate choice; supporting them later is a new decision, not a configuration change.
- **Follow-ups:**
  - Extend `__tests__/validateEmail.test.ts` to cover whitespace, multiple `@`, missing domain, subdomain, and `@notvt.edu`; the current suite covers the main cases but not all of these.
  - Correct the hint/error copy so it says the domain must be exactly `vt.edu`, not merely "end in".
  - When a backend is added, enforce the same rule server-side as the authoritative check and treat the client check as UX only.
  - Move the rule into a shared package/module if the backend is written in a different language, or duplicate the *definition* only with a shared test corpus.
  - Consider real email ownership verification if mailbox control becomes a product requirement.

## Alternatives Considered
| Alternative | Why rejected |
|-------------|--------------|
| `endsWith('@vt.edu')` / suffix matching | Easy to get subtly wrong and reads as a suffix rule; `endsWith('vt.edu')` accepts `notvt.edu`, and substring checks accept `vt.edu.evil.com`. The anchored regex makes exactness explicit. |
| Split on `@` and compare the domain with `===` | Correct but more code and more edge cases (multiple `@`, empty parts) handled imperatively; the regex expresses the same rule in one testable line. |
| Full RFC 5322 regex or validation library | Much larger surface than needed for a single-domain prototype, harder to review, and still does not prove affiliation; overkill for a `@vt.edu` gate. |
| DNS / MX lookup on the domain | Verifies deliverability, not affiliation, adds a network dependency and latency to sign-up, and fails on transient resolver errors; it answers a different question than the product is asking. |
| Allow any `.edu` address | Broader than the product premise (VT students only); admits every other university's address and cannot be enforced without trusting external rosters. |
| Wait for a backend and enforce only server-side | Leaves the current prototype with no gate at all, so non-VT addresses pass today; the client check is a useful interim control as long as its limitation is documented. |

## Links
- US-001 — restrict sign-up to Virginia Tech email addresses.
- `validateEmail.ts` — implementation of the single rule.
- `App.tsx` (`handleSendCode`) — the UI integration point.
- `__tests__/validateEmail.test.ts` — unit tests for the rule.
- Future requirement: server-side enforcement when a backend exists.
- Future requirement: student-status verification and email ownership verification.
