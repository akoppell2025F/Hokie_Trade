---
name: requirements-traceability
description: Build a requirement-to-code-to-test traceability matrix from docs/product/PRODUCT.md, docs/design/SYSTEM.md, docs/requirements/*-user-stories.md, and the ADRs; detect orphan requirements, orphan features, and untested acceptance criteria.
license: CC-BY-4.0
---

# Requirements Traceability Skill

Procedures for proving that requirements, implementation, and tests line up — and for
reporting the places where they do not. Traceability is a claim backed by a file and a
line, never a compliment. All paths below are relative to the repository root.

## 1. Sources of truth (read in this order)

| Priority | Source | What it contributes |
|---|---|---|
| 1 | `docs/requirements/*-user-stories.md` | Decomposed user stories (`US-###`) with Given/When/Then acceptance criteria — the finest-grained testable unit |
| 2 | `docs/product/PRODUCT.md` | §5.1–5.7 MVP scope, §7 out of scope, §8 success metrics, §9 core user stories |
| 3 | `docs/design/SYSTEM.md` | §7 non-functional requirements, §3 data model, §4 routes (planned target, not the prototype) |
| 4 | `docs/design/ADR-*.md` (and `docs/adr/*.md` once it exists) | Design decisions and their explicit "Follow-ups" |
| 5 | `README.md`, `docs/research/usability-report.md`, `docs/research/survey-results.md`, `docs/design/*-implementation-sketch.md` | Context and demo flow (not requirements) |

ADRs currently live in `docs/design/`. `AGENTS.md` says new ADRs go in `docs/adr/`, which
does not exist yet, so check both locations.

Current requirement documents:

| Document | Stories | ACs |
|---|---|---|
| `docs/requirements/email-verification-user-stories.md` | US-002 | 8 |
| `docs/requirements/vt-email-validation-user-stories.md` | US-003 | 7 |
| `docs/requirements/improved-search-user-stories.md` | US-001 | 7 |
| `docs/requirements/search-feedback-user-stories.md` | US-004, US-005, US-006 | 11 |

Total: **6 stories, 33 acceptance criteria.** Re-count before reporting; new stories may
have been added.

`PRODUCT.md` §5.2 (Listings: create/edit/delete/mark sold) has **no** `US-###`
decomposition yet — treat it as a requirement without a story and check it explicitly.
`README.md` and `SYSTEM.md` diverge from the prototype by design; that is not a defect.

## 2. ID scheme

Use the IDs the repository already uses, and never invent new ones.

| ID | Meaning | Example |
|---|---|---|
| `US-###` | User story | `US-001` |
| `US-###/AC-n` or `US-### AC-n` | Acceptance criterion inside a story | `US-003/AC-5` |
| `PRODUCT §5.n` | Product-level scope bullet | `PRODUCT §5.3` |
| `PRODUCT §9 story n` | Product-level story | `PRODUCT §9 story 6` |
| `ADR-NNNN` | Design decision | `ADR-0002` |
| `UC-###` | Use case (from the `analysis` skill) | `UC-001` |
| `FR-###` / `NFR-###` | Spec requirement (from the `specification` skill) | `NFR-001` |

## 3. Annotation convention

**Document side (canonical, already in use).** US-002 has a criterion→test table under
"Implementation and tests":

```markdown
| Criterion | Test(s) |
|---|---|
| 1 | `test_send_uses_smtp_correctly`, `test_send_generates_code_when_none_given` |
```

Extend that table to every story that has tests. It is the human-readable mirror of the
code annotations.

**Code side (proposed, not yet applied repo-wide).** Put a trace comment directly above the
test that claims the criterion:

```ts
// frontend/__tests__/searchUtils.test.ts
// Traces: US-001 AC-3
it('finds course numbers without spaces', () => { ... });
```

```python
# backend/tests/test_email_verification.py
# Traces: US-002 AC-5
def test_code_is_six_digits():
    ...
```

Until those annotations exist, infer links from test names and imports, and say in the
report that the link was inferred. Applying annotations to existing tests is a follow-up
task for `@build` — this skill never edits test files.

## 4. Procedure

1. **Enumerate the criteria.** `grep -n "^## US-" docs/requirements/*.md` for stories;
   `grep -nE "^[0-9]+\. " docs/requirements/*.md` for numbered criteria.
2. **Find the implementation.** For each criterion, identify the symbol that satisfies it —
   `grep -rn "<symbol-or-feature>" frontend/src backend --include=*.ts --include=*.tsx --include=*.py`.
   Record `file:line`.
3. **Find the test.** `grep -rn "<symbol>" frontend/__tests__ backend/tests`.
   Prefer a test whose name states the criterion's behavior over one that merely imports
   the symbol.
4. **Confirm the test passes.** Use the latest `@tester` result or run the suite
   (`cd frontend && npm test`, `cd backend && python3 -m pytest`). A link to a test you have
   not seen pass is at most `Partial`.
5. **Assign a status** using §5. Do not round up.
6. **Run the orphan checks in both directions:**
   - Requirement → no implementation → `Untested – gap` or `Orphan requirement`.
   - Implementation → no requirement → `Orphan feature`.
   - Test → no requirement → note it in the report (it may be a legitimate unit test).
7. **Flag conflicts.** When two sources disagree (e.g. `PRODUCT.md` §5.1 says "confirmation
   link" while US-002 AC-5 specifies a 6-digit code), report `Conflict` and name both
   sources. This agent does not decide which one is right.
8. **Check cross-links.** If a story links to a design document or ADR that does not exist
   at that path, report it as an S4 documentation finding. (Known today:
   `email-verification-user-stories.md` links to `../adr/ADR-0002-vt-email-validation.md`,
   but the file is in `docs/design/`.)

Useful enumeration commands:

```bash
grep -n "^## US-" docs/requirements/*.md
grep -n "^\*\*Priority" docs/requirements/*.md
grep -rn "Traces:" frontend/__tests__ backend/tests
grep -rn "US-0" frontend/__tests__ backend/tests
grep -cE "^[0-9]+\. " docs/requirements/*.md
```

## 5. Status vocabulary

| Status | Rule |
|---|---|
| **Covered** | A named, passing test exercises the criterion and the implementing symbol is identified |
| **Partial** | Some cases are tested; a named sub-case (e.g. whitespace, subdomain) is not |
| **Untested – manual** | No automated test is possible today (e.g. UI-level with no renderer installed), but the behavior is implemented and reachable |
| **Untested – gap** | The behavior is implemented and *could* be unit-tested, but no test exists |
| **Orphan requirement** | A requirement has no implementing code |
| **Orphan feature** | User-facing implemented behavior has no requirement document |
| **Conflict** | Two authoritative sources disagree |
| **Out of scope** | Explicitly excluded by `PRODUCT.md` §7 or a story's "Assumptions / dependencies" |

A test that exists but is currently failing is **never** `Covered` — report the failure and
mark the criterion `Partial` until it is green.

## 6. Known baseline (verify, do not copy blindly)

| Req | Implementation | Tests | Expected finding |
|---|---|---|---|
| US-001 | `frontend/src/utils/searchUtils.ts` `normalizeSearch`, `filterListings` | `frontend/__tests__/searchUtils.test.ts` | Covered; one prose mention of US-001 (a comment near line 52), no ID convention |
| US-002 | `backend/email_verification.py` | `backend/tests/test_email_verification.py` | Covered — the criterion→test table already exists in the story |
| US-003 | `frontend/src/utils/validateEmail.ts` `isVtEmail`, `frontend/src/App.tsx` `handleSendCode` | `frontend/__tests__/validateEmail.test.ts` | Partial — AC-2 whitespace and AC-5 subdomain (`@cs.vt.edu`) not covered; AC-6 (error clears) is UI-level |
| US-004/005/006 | `frontend/src/App.tsx` browse screen, using `showClearButton` / `resultCountText` from `searchUtils.ts` | Helpers in `frontend/__tests__/searchUtils.test.ts`; screen untested | Helper logic testable; on-screen behavior untested (UI) — 11 criteria, no renderer installed |
| PRODUCT §5.2 | `frontend/src/utils/listingForm.ts`, `App.tsx` create screen | `frontend/__tests__/listingForm.test.ts` | Implemented and tested, but no `US-###` story decomposes the §5.2 bullet |
| — | `frontend/src/App.tsx` messaging (`thread`), rating, safe meetup | — | Orphan feature — no requirement document |

Treat this table as a hypothesis to re-verify, not as ground truth.

## 7. Report schema

```markdown
### Traceability matrix
| Req | ACs | Implemented by | Test(s) | Status |
|-----|-----|----------------|---------|--------|
| US-001 | 1–7 | `frontend/src/utils/searchUtils.ts` | `frontend/__tests__/searchUtils.test.ts` | Covered |
| US-003 | 1–7 | `frontend/src/utils/validateEmail.ts`, `App.tsx:handleSendCode` | `frontend/__tests__/validateEmail.test.ts` | Partial (AC-2, AC-5, AC-6) |
| US-004/005/006 | 11 | `frontend/src/App.tsx` browse screen | — | Untested (UI) |
| PRODUCT §5.2 | — | `frontend/src/utils/listingForm.ts` | `frontend/__tests__/listingForm.test.ts` | Undecomposed requirement |
| — | — | `frontend/src/App.tsx` messaging / rating / meetup | — | Orphan feature |

### Orphans and conflicts
1. **[S2]** US-003 AC-5 — subdomain `@cs.vt.edu` not tested.
2. **[S3]** `PRODUCT.md` §5.1 vs US-002 AC-5 — "confirmation link" vs 6-digit code.
3. **[S3]** `App.tsx` messaging has no requirement document.

### Coverage summary
- Covered: N of 33 criteria
- Partial: N
- Untested (manual/UI): N
- Untested (gap): N
- Undecomposed requirements: N
```

Always show the requirement's text alongside its ID when talking to a student —
`US-003` alone means nothing to them.

## 8. Guardrails

- Never invent a requirement ID, a story number, or a criterion.
- Never mark `Covered` without naming both the implementation and a passing test.
- Never edit requirement documents, tests, or source to make the matrix look better.
- Never resolve a `Conflict` yourself; report both sources and point the student to the
  team (or Dr. Brown for anything affecting a grade).
- Never present a traceability result as a grading decision; grade, deadline, and integrity
  questions go to Dr. Brown (dcbrown@vt.edu).

---

*Generated for the CS-3704 course; licensed under CC-BY-4.0.*
