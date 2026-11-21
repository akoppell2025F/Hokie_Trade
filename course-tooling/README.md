# Course Tooling (CS3704)

This folder holds the CS3704 course's AI-agent setup. **None of it is needed to build, run, or test Hokie Trade.** It was moved here from the repo root to keep the project tidy, since the team is not currently using it.

## What it is

CS3704 (Intermediate Software Design and Engineering, Virginia Tech) has students develop alongside AI coding agents. The course's setup tool, [baker](https://github.com/CS3704-VT/agent-template), copies a course "agent template" into each project repo. That template is what's in this folder:

| Path | Purpose |
|---|---|
| `.opencode/` | Course agents (`@dcbrown`, `@assignment`, requirements analyst, system architect, etc.), skills, a plugin, and scripts that log AI usage and package submissions |
| `opencode.json` | Points [opencode](https://opencode.ai) at Virginia Tech's ARC LLM API (needs an `ARC_API_KEY` environment variable) |
| `baker.yml` | Baker recipe that installs the template into the repo |
| `PHASE.md` | Which agents are unlocked in the current phase of the semester (maintained by the course) |
| `docs/templates/` | Templates the agents follow for user stories, use cases, ADRs, and UML diagrams |
| `docs/README.md`, `docs/STUDENT_GUIDE.md`, `docs/ACKNOWLEDGEMENTS.md` | The course's own docs for the agent template |

Two pieces of the template were left in place at the root because they are mixed with team content:
- The section between `# >>> baker:cs3704-hokie-trade >>>` and `# <<< baker:cs3704-hokie-trade <<<` in `AGENTS.md` (course rules for agents).
- The matching baker section in `.gitignore` (ignores AI logs and submission zips).

## Why it isn't in use here

opencode only finds `.opencode/` and `opencode.json` at the root of the folder it's opened in, and the agents expect `PHASE.md` and `docs/templates/` at the repo root. Inside this folder, the tooling is inactive.

## How to use it again

Move everything back to where baker put it, from the repo root:

```bash
git mv course-tooling/.opencode course-tooling/opencode.json course-tooling/baker.yml course-tooling/PHASE.md .
git mv course-tooling/docs/templates course-tooling/docs/README.md course-tooling/docs/STUDENT_GUIDE.md course-tooling/docs/ACKNOWLEDGEMENTS.md docs/
```

Then set `ARC_API_KEY` and run `opencode` from the repo root. See `docs/STUDENT_GUIDE.md` once it's back in place.

Notes:
- `baker run setup` runs `npm install` at the repo root, which fails because the app lives in `frontend/`. Run `cd frontend && npm install` instead.
- Running `baker bake .` again will recreate these files at the root and append to `AGENTS.md` and `.gitignore`.
- If the course releases a new phase branch (e.g. `phase/03-testing-maintenance`), merging it will add or update files at the original root paths, not in this folder.