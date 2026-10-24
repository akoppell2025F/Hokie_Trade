# User Stories: Hokie Trade – Email Verification

## US-002 — Send a verification code to my VT email

**Story:** As a VT student signing up for Hokie Trade, I want a real verification code emailed to my @vt.edu address, so that only people who actually own a VT email can get into the marketplace and other students can trust that I'm a verified Hokie.

**Background:** In the original prototype, tapping **Send code** only checked that the email ended in `@vt.edu`. No email was ever sent, and the Verify screen accepted any 6 digits, so the "✓ Verified @vt.edu" badge on every seller meant nothing. Trust was the top concern in our survey (average trust in strangers 2.25 / 5; 9 of 12 respondents asked for verified @vt.edu accounts), and PRODUCT.md §5.1 makes @vt.edu verification an MVP requirement. This story covers **sending** the code. Checking the code the student types in is a separate, later story.

**Acceptance Criteria**
1. **Valid VT email:** Given the mail server settings are configured, when a code is requested for `hokie@vt.edu`, then one email is sent to `hokie@vt.edu` containing a 6-digit code, and that same code is returned to the caller so it can be checked later.
2. **Capitalization and spaces:** Given the mail server settings are configured, when a code is requested for `  Hokie@VT.EDU `, then the email is sent to `hokie@vt.edu` (trimmed and lowercased).
3. **Non-VT email:** Given any address that is not a real @vt.edu address (for example `hokie@gmail.com`, `hokie@vt.edu.evil.com`, `a@b@vt.edu`, `@vt.edu`, or an empty box), when a code is requested, then it is rejected with the message "Enter a VT email ending in @vt.edu to get a code." and the mail server is never contacted.
4. **Email contents:** Given a code is sent, when the student opens the email, then the subject is "Your Hokie Trade verification code", the sender is the configured Hokie Trade address, and the body shows the code.
5. **Unpredictable codes:** Given no code is supplied, when codes are generated, then each one is exactly 6 digits (leading zeros allowed), is made with a secure random generator, and repeated requests do not produce the same code every time.
6. **Mail server failure:** Given the mail server rejects the login or cannot be reached, when a code is requested, then a clear "Could not send verification email" error is raised instead of an unhandled crash.
7. **Missing settings:** Given a required mail setting (`SMTP_HOST`, `SMTP_USERNAME`, or `SMTP_PASSWORD`) is not set, when a code is requested, then an error is raised that names the missing setting.
8. **No secrets in the repo:** Given the project is committed to GitHub, when the mail settings are read, then they come from environment variables (with `SMTP_PORT` defaulting to 587 and `SMTP_SENDER` defaulting to `SMTP_USERNAME`), and the real `backend/.env` file is git-ignored.

**Priority:** Must-have (MoSCoW). VT-only verification is the app's core trust feature and part of the MVP in PRODUCT.md §5.1.

**Related requirements:** PRODUCT.md §5.1 (Authentication), PRODUCT.md §9 user story 1 (see that every user is verified with a @vt.edu email), SYSTEM.md §5 (Auth Flow). Design: [docs/design/ADR-0001-python-smtp-email-verification.md](../design/ADR-0001-python-smtp-email-verification.md).

**Implementation and tests:** `backend/email_verification.py` → `send_verification_email()`. Each criterion is covered in `backend/tests/test_email_verification.py`:

| Criterion | Test(s) |
|---|---|
| 1 | `test_send_uses_smtp_correctly`, `test_send_generates_code_when_none_given` |
| 2 | `test_normalize_accepts_vt_emails`, `test_send_uses_smtp_correctly` |
| 3 | `test_normalize_rejects_non_vt_emails`, `test_invalid_email_never_contacts_server` |
| 4 | `test_build_email_headers_and_body` |
| 5 | `test_code_is_six_digits`, `test_codes_are_random` |
| 6 | `test_smtp_failure_raises_email_send_error`, `test_connection_failure_raises_email_send_error` |
| 7 | `test_missing_env_raises` |
| 8 | `test_config_from_env` |

**Assumptions / dependencies:**
- A sending email account with SMTP access exists, such as a dedicated Gmail account with an app password, or an email service like SendGrid or Brevo.
- The code is sent as a 6-digit number, matching the existing Verify screen, rather than the "email confirmation link" wording in PRODUCT.md §5.1.
- Out of scope for this story: storing codes, code expiry, checking the code the student enters, resend and rate limits, and connecting the Expo app to the backend. These need a backend endpoint and are follow-up stories.
- Email delivery to vt.edu inboxes is not guaranteed; a new sending account may land in spam at first.

---

*AI disclosure: drafted with Claude (Opus 5.5) using the course user-story template (`docs/templates/user-story.md`), based on the implemented `email_verification.py` and its tests. Reviewed and edited by [your name].*