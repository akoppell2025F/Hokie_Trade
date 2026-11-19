---
name: code-quality
description: Read-only code-quality checks for an Expo/React Native + Python repo — strict TypeScript, lint availability, Expo dependency health, dead code, complexity, and RN/Expo pitfalls — with a severity rubric.
license: CC-BY-4.0
---

# Code Quality Skill

Procedures for assessing code health in Hokie Trade without changing it. The point is a
verdict the student can act on, not a style lecture: every finding needs a file, a line, a
severity, and an owner.

## 1. Check matrix

| Check | Command | Gate? |
|---|---|---|
| TypeScript, strict | `npx tsc --noEmit` | **Yes — authoritative** |
| Expo dependency/config health | `npx expo-doctor` | Advisory (network required) |
| ESLint configuration present | `ls eslint.config.* .eslintrc*` | Detection only |
| ESLint run | — | **Never run here** — `npx expo lint` creates `eslint.config.js` |
| Prettier / formatter | `ls .prettierrc*` | Detection only |
| Python linter | `ls ruff.toml .flake8 setup.cfg` + `command -v ruff flake8` | Detection only |
| Test inventory | `npx jest --listTests` | Context |
| Dead exports | `grep -n "^export" <file>` | Advisory |
| Size / complexity proxy | `wc -l <file>`, `grep -c` of branches | Advisory (S3) |
| Review scope | `git diff --stat`, `git log --oneline -5` | Context |

`tsconfig.json` extends `expo/tsconfig.base` with `"strict": true` and `"types": ["jest"]`.
That makes TypeScript the only tool here that can legitimately fail a change.

## 2. Reads that would be writes (do not run)

| Command | What it writes |
|---|---|
| `npx expo lint` | Creates `eslint.config.js` when none exists |
| `npx expo install <pkg>` / `npx expo install --fix` | Mutates `package.json` + lockfile |
| `npm install` | Mutates `node_modules`, lockfile |
| `npx prettier --write`, `eslint --fix` | Rewrites source |
| `git checkout/stash/restore` | Discards work |

If a check needs one of these, report the check as **not configured / not run** and
recommend `@build`. Never bootstrap tooling as part of a review.

## 3. TypeScript rules (fail on violation)

- No `any` (explicit or implied) in new or changed code; prefer precise types or `unknown`
  plus a narrowing check.
- Exported functions have explicit parameter and return types.
- No `@ts-ignore` / `@ts-expect-error` without an adjacent reason comment.
- No non-null assertion (`!`) without a comment justifying why the value cannot be null.
- Union types are handled exhaustively — e.g. `type Screen` in `App.tsx` should be covered
  by every branch that switches on it.
- `strict` is on; do not recommend loosening it.

Any of the above, or a non-zero `npx tsc --noEmit`, is at least **S2**.

## 4. Expo / React Native heuristics (advisory unless clearly broken)

- `SafeAreaView` imported from `react-native` is deprecated. It is **known and tracked**
  in `README.md` — report S4 with that context, never as a new discovery.
- Lists rendered with `.map` need stable `key` props (not array index when items reorder).
- Hooks run unconditionally and in a stable order; no hooks inside conditionals or loops.
- Icon-only `TouchableOpacity`/`Pressable` controls need `accessibilityLabel` and a hit
  target of at least 44×44.
- Inline style objects inside frequently re-rendered lists are a performance smell; module
  or `StyleSheet` styles are preferred.
- Native behavior belongs in `app.json` / config plugins. `ios/` and `android/` are
  generated (CNG) — flag any hand edit as S2.
- Expo API usage should match the installed SDK (read the major version in `package.json`
  and consult the versioned docs). Flag usage that looks like a different SDK.
- A component that owns a state machine, mock data, and several screens at once is an S3
  maintainability finding — in this repo that is `App.tsx` (425 lines, one component).

## 5. Python heuristics (advisory)

- Type hints on public functions; the backend already uses them — flag drift.
- Specific exceptions (`InvalidEmailError`, `EmailSendError`) instead of bare `Exception`.
- No secrets in source or committed files; configuration comes from environment variables
  and `backend/.env` stays git-ignored.
- Standard library preferred where it already solves the problem (`smtplib`, `email.message`).
- No bare `except:` and no swallowed exceptions.

## 6. Severity rubric

| Severity | Meaning | Examples |
|---|---|---|
| **S1** | Blocker — correctness or runnability | TypeScript error, import cycle that breaks a build, test suite cannot start |
| **S2** | Major — requirement or safety at risk | Missing VT-email enforcement, unvalidated price reaching state, `any` in a public API, hand-edited `ios/` |
| **S3** | Minor — maintainability | 425-line component, duplicated validation, dead branch, missing `key` |
| **S4** | Advisory | Lint not configured, no Python linter, deprecated `SafeAreaView`, missing `Traces:` comment |

PASS requires zero S1/S2. S3/S4 are recorded and do not fail the review.

## 7. Report schema

```markdown
### Quality checks
| Check | Command | Result | Severity | Evidence |
|-------|---------|--------|----------|----------|
| TypeScript (strict) | npx tsc --noEmit | 0 errors | — | — |
| Expo dependency health | npx expo-doctor | ... | S4 | ... |
| ESLint | — | not configured | S4 | no eslint.config.js |
| Python lint | — | no linter installed | S4 | backend/requirements.txt |
| Dead code | grep -n "^export" listingForm.ts | all exports referenced | — | App.tsx, tests |
| Component size | wc -l App.tsx | 425 lines / 1 component | S3 | App.tsx |

### Findings (highest severity first)
1. **[S2]** `<file>:<line>` — <finding>
   - Why it matters: ...
   - Owner: @build
```

Always include the "not run" line for anything skipped and say why. A silent omission reads
as a pass.

## 8. Guardrails

- Read-only. Never auto-fix, format, or refactor.
- Never create or edit lint/format configuration.
- Never report a style preference as a defect; attach a severity and a reason.
- Never claim a check passed if it was skipped — say `not configured` or `not run`.
- Never present a review result as a grading decision; grade, deadline, and integrity
  questions go to Dr. Brown (dcbrown@vt.edu).

---

*Generated for the CS-3704 course; licensed under CC-BY-4.0.*
