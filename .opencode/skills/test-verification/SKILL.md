---
name: test-verification
description: Run the repo's Jest and pytest suites, interpret exit codes and output, and assess whether tests actually exercise each requirement. Use when verifying a change, after a refactor, or before submitting.
license: CC-BY-4.0
---

# Test Verification Skill

Procedures for running the Hokie Trade test suites and turning the output into a verdict.
This repository has **two** suites in **two** languages, started from **two** directories.
Do not assume one command covers both.

## 1. Suite inventory

| Suite | Command | Config | Test files |
|---|---|---|---|
| Jest (TypeScript / Expo) | `npm test` (runs `jest`) | `package.json` → `"jest": { "preset": "jest-expo" }` | Root-level `searchUtils.test.ts`; `__tests__/listingForm.test.ts`; `__tests__/validateEmail.test.ts` |
| pytest (Python backend) | `cd backend && python -m pytest` | `backend/pytest.ini` → `testpaths = tests`, `pythonpath = .`, `addopts = -v` | `backend/tests/test_email_verification.py`, fixtures in `backend/tests/conftest.py` |

Notes that change how you verify:

- **Discover, do not assume.** Tests live both at the repo root and under `__tests__/`.
  Run `npx jest --listTests` first and use the real list.
- **Two working directories.** pytest must run from `backend/` (or with `-c backend/pytest.ini`)
  because of `testpaths`/`pythonpath`. Running it from the repo root collects nothing.
- **No coverage gate.** There is no `coverageThreshold` in `package.json` and no `pytest-cov`
  in `backend/requirements.txt`. Coverage is informational only; see §6 for the substitute.
- **Dependencies.** Node modules must be installed (`npm install`); Python needs `pytest>=8`.
  If either is missing, report **BLOCKED**, not FAIL.
- `backend/.venv/` is git-ignored; there is no checked-in virtualenv.

## 2. Command matrix

Run only what the scope needs, and always quote the command and exit code.

| Goal | Command |
|---|---|
| Full Jest suite | `npm test` |
| Full Jest suite, CI-safe | `npx jest --ci` |
| List test files | `npx jest --listTests` |
| One Jest file | `npx jest searchUtils.test.ts` |
| Jest by path pattern | `npx jest --testPathPattern=validateEmail` |
| Full pytest suite | `cd backend && python -m pytest` |
| pytest, quiet | `cd backend && python -m pytest -q` |
| pytest, list only | `cd backend && python -m pytest --collect-only -q` |
| One pytest file | `cd backend && python -m pytest tests/test_email_verification.py` |
| One pytest test | `cd backend && python -m pytest -k test_missing_env_raises` |
| Informational coverage | `npx jest --coverage` (no threshold; do not gate on it) |

Never run `npm install`, `npx expo install`, or any command that writes to the tree as part
of verification.

## 3. Interpreting output

**Jest** prints a per-file result plus a summary:
`Tests: X failed, Y passed, Z total` and `Test Suites: ...`. A non-zero exit with
`Test suite failed to run` is a **collection/import error** → BLOCKED, not a behavioral
failure. Distinguish it from an assertion failure (`expect(received).toBe(...)`).

**pytest** prints `FAILED <file>::<test>` for assertion failures and `ERROR` for fixture or
collection problems. Use `-q` for a compact list. The final line
`=== X failed, Y passed in Zs ===` is the summary. Exit code 5 means "no tests collected" —
that is a configuration problem (wrong working directory or `testpaths`), report BLOCKED.

Classify each result:

| Observation | Verdict contribution |
|---|---|
| Exit 0, all passed | PASS contribution |
| Assertion failure | FAIL (S1) |
| Collection/import error, missing dependency, no tests collected | BLOCKED |
| Skipped test with a stated reason | Allowed; note it |
| Skipped test with no reason | ADVISORY (S3) |
| Timeout / hang | BLOCKED or S1 depending on cause; report which suite |

## 4. Pass / fail rubric

| Verdict | Condition |
|---|---|
| **PASS** | Jest exits 0 **and** pytest exits 0; zero failed tests; every skip justified; every Must-have acceptance criterion is mapped to a passing test or justified as manual/untestable |
| **FAIL** | Any suite exits non-zero; any test fails; a Must-have criterion has no test and no justification |
| **BLOCKED** | A suite cannot run |

Report BLOCKED separately from FAIL. An environment problem is not a code defect, and
conflating them sends the student to the wrong fix.

## 5. Test-quality checks (advisory unless stated)

- One behavior per test; the test name states the behavior, not the function name alone.
- Arrange–Act–Assert is visible; no assertions buried after side effects.
- Deterministic: no real clock (`Date.now()`), no real network, no real SMTP.
  `backend/tests/conftest.py` already mocks `smtplib.SMTP`; client tests use plain data.
- No assertion-free tests and no snapshot-only tests.
- The file carries the course `AI DISCLOSURE` header where required by the AI policy.
- Integration seams are exercised where the requirements cross modules — e.g.
  `listingForm.test.ts` "create listing + search" crosses `buildListing` → `filterListings`.

## 6. Export inventory (substitute for a coverage threshold)

Since there is no coverage gate, measure test *reach* against the exported surface:

```bash
grep -n "^export" listingForm.ts searchUtils.ts validateEmail.ts
grep -n "^def \|^class " backend/email_verification.py
```

For each exported symbol, decide: directly tested, indirectly tested (used by a tested
path), or unreferenced by tests. Known baseline for this repo:

| Module | Exports |
|---|---|
| `listingForm.ts` | `Listing`, `ListingForm`, `ListingFormErrors`, `emptyListingForm`, `MAX_TITLE_LENGTH`, `MAX_PRICE`, `parsePrice`, `validateListing`, `sellerNameFromEmail`, `nextListingId`, `buildListing`, `formatPrice` |
| `searchUtils.ts` | `SearchableListing`, `normalizeSearch`, `filterListings`, `showClearButton`, `resultCountText` |
| `validateEmail.ts` | `isVtEmail` |
| `backend/email_verification.py` | `SmtpConfig`, `InvalidEmailError`, `EmailSendError`, `normalize_vt_email`, `generate_verification_code`, `build_verification_email`, `send_verification_email` |

Report unreferenced exports as ADVISORY. Do not require 100% coverage of types or constants.

## 7. Report schema

```markdown
## Test Verification Report
Date: <YYYY-MM-DD HH:MM> | Scope: <...> | Verdict: PASS | FAIL | BLOCKED

| # | Suite | Command | Exit | Passed | Failed | Skipped | Time |
|---|-------|---------|------|--------|--------|---------|------|

### Failures (highest severity first)
1. **[S1]** `<file>:<line>` — `<test>`
   - Expected: ...
   - Actual: ...

### Requirements exercised
| Req | AC | Test(s) | Status |
|-----|----|---------|--------|

### Not run / limitations
- ...

### Recommendation
<what to fix first; @build performs fixes>
```

## 8. Guardrails

- Never claim a suite passed without its exit code.
- Never edit a test, weaken an assertion, add `.skip`, or change configuration to make a run
  green. Recommend `@build` instead.
- Never install packages (including test renderers) as part of verification.
- Never scaffold an ESLint config to "check lint" — that is a write, and it is not a test.
- Never present a verification result as a grading decision; anything about grades,
  extensions, or integrity goes to Dr. Brown (dcbrown@vt.edu).

---

*Generated for the CS-3704 course; licensed under CC-BY-4.0.*
