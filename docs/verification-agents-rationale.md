
# Verification Agents — Design Rationale

For Hokie Trade, I created two agents, `tester` and `review`, along with three reusable skills to make testing and code review more organized.

The `tester` agent focuses on running frontend and backend tests, checking results, and identifying missing test coverage. The `review` agent focuses on code quality, TypeScript checks, and how well our implementation matches the requirements.

I created three skills: `test-verification`, `code-quality`, and `requirements-traceability`. I kept them separate so they can be reused for different verification tasks.

I made both agents read-only because I wanted them to identify problems without automatically changing our team's code.

During verification, all 37 frontend tests and 19 backend tests passed, along with the TypeScript check. The report also identified missing UI tests and requirements coverage gaps, showing that passing tests doesn't necessarily mean everything is fully tested.

Overall, I think these agents will make it easier for our team to check our work consistently during future milestones.
