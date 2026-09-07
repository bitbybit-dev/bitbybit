---
sidebar_position: 3
title: Live Unit Test Coverage Reports
sidebar_label: Live Coverage Reports
description: Read the test and coverage report Bitbybit publishes on every CI run - every suite, every number, on the run that produced it.
tags: [github, unit-tests, coverage, development]
---

# Live Unit Test Coverage Reports

Every push and every pull request runs the whole test suite, and the run writes a report of what it
found. That report is public, and it is the same one the maintainers read.

**[Open the latest run →](https://github.com/bitbybit-dev/bitbybit/actions/workflows/verify.yml)**

Pick the run at the top of that list; the report is on its summary page, above the job list. Add
`?query=branch%3Amaster` to the URL to see only the release branch.

## What the report shows

- **A headline** - total tests, how many passed, failed and were skipped, how long the run took, and
  the coverage over every package together, summed rather than averaged so a large package is not
  hidden behind several small ones.
- **A row per package** - tests, time, and line, branch and function coverage with a bar beside it.
- **Movement against the recorded floor.** Coverage in this repository is a floor, not a target: it
  is recorded per package and may rise, never fall. The report shows what each suite moved against
  that floor, so a run tells you not only where coverage stands but which way it went.
- **Failures in full**, with their messages, on a red run - so a failure is read on the summary page
  rather than dug out of a log.
- **Skipped tests and the slowest files**, folded away until you want them.

## Why the run, rather than a hosted coverage site

A published coverage site is a copy: it is built by a separate step, it lives at its own address, and
it goes stale the moment that step stops running - silently, because a stale page looks exactly like
a fresh one. The report on a run cannot drift. It is produced by the run it describes, from the
results that run wrote, and it carries that run's commit. If it is missing, the run is there to
explain why.

It is also honest about scope. The report says what each suite reached, including the packages where
that number is low, and a suite that stopped leaving results at all is called out by name and fails
the step rather than quietly vanishing from the table.

## Reading the numbers fairly

Coverage percentages measure which lines a test executed, not whether the assertions around them are
worth anything. We publish them because they are evidence of effort and a useful trend, not because
a high number proves correctness - a suite can execute every line and assert nothing. The test files
are open beside the source, which is the better thing to read if you want to judge the testing
rather than measure it.

Where a number is low, it is low because that area is newer or leans on a running kernel rather than
because the code is untested by design. See [Unit Testing Approach](/learn/github/unit-tests) for how
we prioritise.

## Contributing to test coverage

If you would like to help:

1. **Open the latest run** and find a package whose numbers are low.
2. **Fork the repository** on GitHub.
3. **Write unit tests** for what is not covered - the existing suites beside the source are the
   pattern to follow.
4. **Open a pull request.** Your run publishes the same report, so you can see what your tests moved.

Contributions that raise a floor are welcome, and so are ones that replace a weak assertion with a
real one.
