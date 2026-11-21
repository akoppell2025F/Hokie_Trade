"""Write a pass/fail table from a JUnit XML report to the GitHub job summary.

Usage: python junit_summary.py <report.xml> "<Title>"
"""

import os
import sys
import xml.etree.ElementTree as ET


def main() -> int:
    path, title = sys.argv[1], sys.argv[2]
    out = os.environ.get("GITHUB_STEP_SUMMARY")
    lines = [f"## {title}", ""]

    if not os.path.exists(path):
        lines.append(f"❌ No test report found at `{path}`. The test step probably crashed.")
    else:
        root = ET.parse(path).getroot()
        suites = [root] if root.tag == "testsuite" else list(root.iter("testsuite"))
        total = failed = skipped = 0
        failures: list[str] = []
        for suite in suites:
            for case in suite.iter("testcase"):
                total += 1
                name = f"{case.get('classname', '')} › {case.get('name', '')}".strip(" ›")
                if case.find("failure") is not None or case.find("error") is not None:
                    failed += 1
                    failures.append(name)
                elif case.find("skipped") is not None:
                    skipped += 1
        passed = total - failed - skipped
        status = "✅ All tests passed" if failed == 0 else f"❌ {failed} test(s) failed"
        lines += [
            f"**{status}**",
            "",
            "| Total | ✅ Passed | ❌ Failed | ⏭️ Skipped |",
            "|---:|---:|---:|---:|",
            f"| {total} | {passed} | {failed} | {skipped} |",
        ]
        if failures:
            lines += ["", "### Failed tests", *[f"- `{f}`" for f in failures]]

    text = "\n".join(lines) + "\n"
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(text)
    print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())