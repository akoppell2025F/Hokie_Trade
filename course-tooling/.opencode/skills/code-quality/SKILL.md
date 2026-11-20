---
name: code-quality
description: Read-only code-quality checks for an Expo/React Native + Python repo — strict TypeScript, ESLint, Ruff and mypy, Expo dependency health, dead code, complexity, and RN/Expo pitfalls — with a severity rubric.
license: CC-BY-4.0
---

# Code Quality Skill

Procedures for assessing code health in Hokie Trade without changing it. The point is a
verdict the student can act on, not a style lecture: every finding needs a file, a line, a
severity, and an owner.

The frontend lives in `frontend/` (code in `frontend/src/`) and the backend in `backend/`.
The gates below mirror the CI workflow in `.github/workflows/ci.yml`. If this skill and CI
disagree, CI wins: re-read the workflow and report the difference.

## 1. Check matrix

| Check | Command | Gate? |
|---|---|---|
| TypeScript, strict | `cd frontend && npm run typecheck` (`tsc --noEmit`) | **Yes** (CI gate) |
| ESLint | `cd frontend && npm run lint` (`eslint . --max-warnings=0`) | **Yes** (CI gate; warnings fail too) |
| Ruff (Python lint) | `cd backend && ruff check .` | **Yes in CI**. Locally: only if installed, otherwise `not run` |
| mypy (Python types) | `cd backend && mypy .` | **Yes in CI**. Locally: only if installed, otherwise `not run` |
| Python tool availability | `command -v ruff mypy` | Detection only |
| Expo dependency/config health | `cd frontend && npx expo-doctor` | Advisory (network required) |
| Prettier / formatter | `ls frontend/.prettierrc*` | Detection only (none configured today) |
| Test inventory | `cd frontend && npx jest --listTests` | Context |
| Dead exports | `grep -n "^export" frontend/src/utils/<file>` | Advisory |
| Size / complexity proxy | `wc -l <file>`, `grep -c` of branches | Advisory (S3) |
| Review scope | `git diff --stat`, `git log --oneline -5` | Context |

Configuration these checks rely on:

- `frontend/tsconfig.json` extends `expo/tsconfig.base` with `"strict": true` and
  `"types": ["jest"]`.
- `frontend/eslint.config.js` is the flat config from `eslint-config-expo/flat`, ignoring
  `dist/`, `node_modules/`, `.expo/`, and `coverage/`.
- `backend/pyproject.toml` configures Ruff (`target-version = "py312"`, `line-length = 100`,
  rules `E`, `W`, `F`, `I`, `UP`, `B`) and mypy (`python_version = "3.12"`,
  `warn_unused_ignores`, `warn_return_any`). Both tools come from
  `backend/requirements-dev.txt` and are **not** in `backend/requirements.txt`, so they are
  often missing on a student machine.

Use `npm run lint` rather than `npx expo lint`. The npm script uses the same flags CI uses
(`--max-warnings=0`).

## 2. Reads that would be writes (do not run)

| Command | What it writes |
|---|---|
| `npx expo install <pkg>` / `npx expo install --fix` | Changes `package.json` and the lockfile |
| `npm install` / `npm ci` | Changes `node_modules` (and, for `install`, the lockfile) |
| `pip install -r backend/requirements-dev.txt` | Changes the Python environment |
| `eslint --fix`, `npm run lint -- --fix`, `ruff check --fix`, `ruff format` | Rewrites source |
| `npx prettier --write` | Rewrites source |
| `git checkout/stash/restore` | Discards work |

If a check needs one of these, report the check as **not run** and recommend `@build`
(or the student) do it deliberately. Never bootstrap tooling as part of a review.

## 3. TypeScript rules (fail on violation)

- No `any` (explicit or implied) in new or changed code; prefer precise types or `unknown`
  plus a narrowing check.
- Exported functions have explicit parameter and return types.
- No `@ts-ignore` / `@ts-expect-error` without an adjacent reason comment.
- No non-null assertion (`!`) without a comment justifying why the value cannot be null.
- Union types are handled exhaustively — e.g. `type Screen` in `frontend/src/App.tsx` should
  be covered by every branch that switches on it.
- `strict` is on; do not recommend loosening it.
- Pure logic belongs in `frontend/src/utils/` with no React imports (per `AGENTS.md`) so it
  can be unit tested. Logic added directly to `App.tsx` that could live there is an S3.

Any of the above, a non-zero `npm run typecheck`, or a non-zero `npm run lint` is at least
**S2**, because CI would fail.

## 4. Expo / React Native heuristics (advisory unless clearly broken)

- `SafeAreaView` imported from `react-native` is deprecated. It is **known and tracked**
  in `README.md` — report S4 with that context, never as a new discovery.
- Lists rendered with `.map` need stable `key` props (not array index when items reorder).
- Hooks run unconditionally and in a stable order; no hooks inside conditionals or loops.
- Icon-only `TouchableOpacity`/`Pressable` controls need `accessibilityLabel` and a hit
  target of at least 44×44.
- Inline style objects inside frequently re-rendered lists are a performance smell; module
  or `StyleSheet` styles are preferred.
- Native behavior belongs in `frontend/app.json` / config plugins. `frontend/ios/` and
  `frontend/android/` are generated (CNG) and git-ignored — flag any hand edit as S2.
- Expo API usage should match the installed SDK (read the major version of `expo` in
  `frontend/package.json` and consult the versioned docs). Flag usage that looks like a
  different SDK.
- A component that owns a state machine, mock data, and several screens at once is an S3
  maintainability finding — in this repo that is `frontend/src/App.tsx` (425 lines, one
  `App` component).

## 5. Python heuristics (advisory; Ruff/mypy findings are gates)

- Type hints on public functions; the backend already uses them — flag drift (mypy will
  catch some of this in CI).
- Specific exceptions (`InvalidEmailError`, `EmailSendError`) instead of bare `Exception`.
- No secrets in source or committed files; configuration comes from environment variables
  and `backend/.env` stays git-ignored.
- Standard library preferred where it already solves the problem (`smtplib`, `email.message`).
- No bare `except:` and no swallowed exceptions.

## 6. Severity rubric

| Severity | Meaning | Examples |
|---|---|---|
| **S1** | Blocker — correctness or runnability | Test suite cannot start, import cycle that breaks a build |
| **S2** | Major — requirement, safety, or CI at risk | TypeScript error, ESLint/Ruff/mypy error, missing VT-email enforcement, unvalidated price reaching state, `any` in a public API, hand-edited `frontend/ios/` |
| **S3** | Minor — maintainability | 425-line component, duplicated validation, dead branch, missing `key`, logic that belongs in `frontend/src/utils/` |
| **S4** | Advisory | Ruff/mypy not installed locally, `expo-doctor` version warning, deprecated `SafeAreaView`, missing `Traces:` comment |

PASS requires zero S1/S2. S3/S4 are recorded and do not fail the review.

## 7. Report schema

```markdown
### Quality checks
| Check | Command | Result | Severity | Evidence |
|-------|---------|--------|----------|----------|
| TypeScript (strict) | cd frontend && npm run typecheck | 0 errors | — | — |
| ESLint | cd frontend && npm run lint | 0 problems | — | frontend/eslint.config.js |
| Ruff | cd backend && ruff check . | not run (not installed) | S4 | backend/requirements-dev.txt |
| mypy | cd backend && mypy . | not run (not installed) | S4 | backend/requirements-dev.txt |
| Expo dependency health | cd frontend && npx expo-doctor | ... | S4 | ... |
| Dead code | grep -n "^export" frontend/src/utils/listingForm.ts | all exports referenced | — | App.tsx, tests |
| Component size | wc -l frontend/src/App.tsx | 425 lines / 1 component | S3 | frontend/src/App.tsx |

### Findings (highest severity first)
1. **[S2]** `<file>:<line>` — <finding>
   - Why it matters: ...
   - Owner: @build
```

Always include the "not run" line for anything skipped and say why. A silent omission reads
as a pass.

## 8. Guardrails

- Read-only. Never auto-fix, format, or refactor.
- Never create or edit lint/format/type-checker configuration.
- Never install a linter or type checker to make a check runnable.
- Never report a style preference as a defect; attach a severity and a reason.
- Never claim a check passed if it was skipped — say `not configured` or `not run`.
- Never present a review result as a grading decision; grade, deadline, and integrity
  questions go to Dr. Brown (dcbrown@vt.edu).

---

*Generated for the CS-3704 course; licensed under CC-BY-4.0.*
