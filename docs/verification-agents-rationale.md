
# Verification Agents — Design Rationale

For Hokie Trade, I created two agents, `tester` and `review`, along with three reusable skills to make testing and code review more organized.

The `tester` agent focuses on running frontend and backend tests, checking results, and identifying missing test coverage. The `review` agent focuses on code quality, TypeScript and lint checks, and how well our implementation matches the requirements.

I created three skills: `test-verification`, `code-quality`, and `requirements-traceability`. I kept them separate so they can be reused for different verification tasks.

I made both agents read-only because I wanted them to identify problems without automatically changing our team's code.

## Where the files live

| File | Purpose |
|---|---|
| `course-tooling/.opencode/agents/tester.md` | Runs Jest and pytest, maps tests to acceptance criteria |
| `course-tooling/.opencode/agents/review.md` | Runs the CI quality gates read-only, builds the traceability matrix |
| `course-tooling/.opencode/skills/test-verification/SKILL.md` | Test commands, output interpretation, export inventory |
| `course-tooling/.opencode/skills/code-quality/SKILL.md` | Quality gates and severity rubric |
| `course-tooling/.opencode/skills/requirements-traceability/SKILL.md` | Requirement → code → test matrix procedure |

## Updates for the reorganized repository (PM2.3)

After the repository was split into `frontend/` and `backend/`, I updated the agents and skills to match it:

- **Paths.** Frontend code is in `frontend/src/` (helpers in `frontend/src/utils/`), and frontend tests are in `frontend/__tests__/`. Product and design docs moved to `docs/product/`, `docs/design/`, and `docs/research/`. Requirement files are named `docs/requirements/*-user-stories.md`.
- **Commands.** Jest runs from `frontend/` (`cd frontend && npm test`), and pytest runs from `backend/` (`cd backend && python3 -m pytest`). I changed `python` to `python3` because this Mac has no `python` binary.
- **Quality gates match CI.** ESLint is now configured (`frontend/eslint.config.js`, `npm run lint`), and the backend has Ruff and mypy (`backend/pyproject.toml`, `backend/requirements-dev.txt`). The old version said lint was "not configured", which is no longer true. The `review` agent now runs the same checks as `.github/workflows/ci.yml`, without any `--fix` flags.
- **Read-only is enforced, not just requested.** The agents used to have `bash: allow` for every command, so only the prompt kept them read-only. They now use an OpenCode bash allowlist. Any command not on the list is denied, and so are writes (`rm`, `git commit`, `npm install`, `--fix`, `>` redirection, and so on). `edit` was already denied.
- **`npm run test:ci` is blocked.** Its JUnit reporter writes `frontend/junit.xml`, which is committed to git, so running it would change the tree. The agents use `npx jest --ci` instead.
- **Turn limit.** I added `steps: 20`, which is the key OpenCode actually reads. I kept `skills:` and `maxTurns:` because the other course agents use them too.
- **Correction.** The traceability skill said US-002 **AC-4** was the 6-digit code criterion. It is actually **AC-5**.

## How to load the agents

OpenCode only looks for `.opencode/` in the folder it runs from (and parent folders up to the git root). It never looks inside `course-tooling/`, so running `opencode` from the repo root finds none of the course agents. Running it from `course-tooling/` finds them, but then commands run from the wrong folder for `cd frontend` and `cd backend`.

The smallest fix I found does not move any files. Run this from the repository root:

```bash
OPENCODE_CONFIG_DIR="$PWD/course-tooling/.opencode" \
OPENCODE_CONFIG="$PWD/course-tooling/opencode.json" \
opencode
```

With OpenCode 1.19.0, this loaded all 15 agents (including `tester` and `review`), all 14 course skills, the ARC provider config, and the course plugin. The other option is to move the folder back to the root (see `course-tooling/README.md`), but that is a bigger change, and the tooling was moved out of the root on purpose to keep the project tidy.

## Verification results (run on 2026-11-20)

| Check | Command | Result |
|---|---|---|
| Jest | `cd frontend && npm test` | Exit 0 — 3 suites, **37 passed**, 0 failed |
| ESLint | `cd frontend && npm run lint` | Exit 0 — no problems (`--max-warnings=0`) |
| TypeScript | `cd frontend && npm run typecheck` | Exit 0 — no errors |
| pytest | `cd backend && python3 -m pytest` | Exit 0 — **19 passed**, 0 failed |
| Expo doctor | `cd frontend && npx expo-doctor` | Exit 1 — 20/21 checks passed; `expo` 57.0.31 installed, `~57.0.33` expected (patch mismatch, advisory) |
| Ruff | `cd backend && ruff check .` | **Not run** — Ruff is not installed locally (CI runs it) |
| mypy | `cd backend && mypy .` | **Not run** — mypy is not installed locally (CI runs it) |
| Agent/skill discovery | `opencode agent list`, `opencode debug skill` | `tester`, `review`, and all three skills load using the command above |
| Read-only enforcement | `opencode debug agent <name> --tool bash` | Test, lint, and typecheck commands run. `npm install`, `npm run test:ci`, `--fix`, `git commit`, `rm`, `find -delete`, `>` redirection, and unlisted commands are denied |

The traceability procedure also still finds real gaps, which shows that passing tests doesn't necessarily mean everything is fully tested:

- US-003 is only partly covered. There are no tests for whitespace input (AC-2) or for `@cs.vt.edu` subdomains (AC-5).
- The search-feedback stories (US-004 to US-006) have tested helpers, but the screen itself has no tests because no UI renderer is installed.
- Messaging, rating, and safe-meetup features in `App.tsx` have no requirement documents.
- `email-verification-user-stories.md` links to `../adr/ADR-0002-vt-email-validation.md`, but the ADR is in `docs/design/`.

## Remaining limitations

- **The agents have not been run end to end with a model.** That needs an `ARC_API_KEY`. I checked that OpenCode loads the agents and enforces their bash permissions, but I have not checked how the model follows the prompts.
- **Ruff and mypy were not run locally.** Installing them (`pip install -r backend/requirements-dev.txt`) is a deliberate step for the student, not the agents. Until then, only CI checks them.
- **The allowlist is strict.** Any command containing `>` is denied, including `2>&1`. Commands that are not listed (for example `echo`) are also denied, so they have to go through `@build`. I chose `deny` over `ask` because I could not confirm how `ask` behaves outside the interactive app.
- **`skills:` and `maxTurns:` are not OpenCode settings.** OpenCode passes them to the model provider as extra options. I have not confirmed that the ARC API ignores them.
- **Other course agents may still expect root paths.** `course-tooling/README.md` says the course agents expect `PHASE.md` and `docs/templates/` at the root. Our two agents and three skills do not depend on those files.
- **UI behavior cannot be tested automatically** until the team adds a React Native test renderer.

Overall, I think these agents will make it easier for our team to check our work consistently during future milestones.

---

*AI use: I updated these agents, skills, and this document with help from an AI coding assistant (Claude Code). The verification results above come from commands actually run on 2026-11-20.*
