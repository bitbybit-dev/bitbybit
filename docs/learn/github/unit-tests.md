---
sidebar_position: 2
title: Unit Testing in Bitbybit
sidebar_label: Unit Testing Approach
description: Learn about the importance of unit testing in Bitbybit, our practical approach to testing 3D algorithms (including E2E-like tests), and explore our live unit test reports.
tags: [getting-started, github, unit-tests, development]
---

# Unit Testing in Bitbybit (WIP)

Ensuring the reliability, correctness, and stability of a 3D modeling and development platform like Bitbybit is important. One of important aspects of our quality assurance strategy is a suite of transparant **unit tests**.

## Why Are Unit Tests Important?

Unit tests are automated tests that verify individual "units" of source code—typically functions, methods, or classes—in isolation. Their importance cannot be overstated:

1.  **Early Bug Detection:** They catch bugs early in the development cycle, when they are cheapest and easiest to fix.
2.  **Code Quality & Design:** Writing testable code often leads to better-designed, more modular, and maintainable software.
3.  **Refactoring Confidence:** With a solid test suite, developers can refactor and improve code with greater confidence, knowing that the tests will alert them if any existing functionality breaks.
4.  **Living Documentation:** Well-written unit tests can serve as a form of documentation, illustrating how specific parts of the code are intended to be used and what their expected behavior is.
5.  **Regression Prevention:** They help prevent regressions—where previously fixed bugs reappear or new changes break existing functionality.
6.  **Faster Feedback Loop:** Automated tests provide quick feedback to developers, allowing for rapid iteration.

## Our Approach: Practical Testing for 3D Algorithms

While traditional unit tests often emphasize strict isolation and "purity" (mocking all external dependencies), testing 3D algorithms, especially those interacting with geometric kernels like OpenCascade (OCCT) or game engines like BabylonJS/ThreeJS, presents unique challenges.

In Bitbybit, our unit testing strategy embraces a pragmatic approach:

*   **Core Unit Tests:** We have numerous tests that follow the traditional unit testing paradigm, focusing on isolated logic within our TypeScript codebase.
*   **E2E-like Unit Tests for Kernel Interactions:** A significant portion of our tests, particularly for geometry creation and manipulation, function more like **end-to-end (E2E) or integration tests at the unit level**.
    *   These tests often make actual calls into deeper kernel functions (e.g., OCCT's `makeBox`).
    *   While less "pure" in terms of isolation, this approach is incredibly practical for validating the actual output and behavior of our 3D algorithms as they would be used by developers.
    *   It allows us to verify not just our wrapper logic but also the correct integration and expected results from the underlying geometric engines.
    *   This provides a higher degree of confidence that the end-to-end functionality of creating a box, performing a boolean operation, or drawing a shape works as intended.

This blended strategy ensures that we cover both the internal logic of our platform and the critical interactions with the powerful 3D technologies we build upon.

## Bottom UP! Prioritizing Our Testing Efforts

We understand that real-world software development involves balancing various demands, and the energy spent on unit testing, while crucial, must yield practical dividends. This is no different at Bitbybit. Consequently, we have certain priorities when it comes to our unit testing efforts:

*   **Focus on Foundational Layers First:** We prioritize spending time on unit testing deeper-level functions and modules. The base layer of Bitbybit (e.g., core utilities, fundamental data structures) is used by all our NPM packages and higher-level integrations. Therefore, ensuring the robustness of this foundation takes precedence before extensively testing higher-level geometric kernel integrations or even further up the stack with game engine integrations.
*   **Layered Priority:** This doesn't mean that the highest levels of the platform, such as UI components shouldn't be tested. However, when development time and resources are constrained, testing the foundational components offers the broadest impact on overall system stability. As the lower layers become more stable and well-tested, focus can then progressively move to higher layers.

This "bottom-up" prioritization helps us maximize the impact of our testing efforts and build a more reliable platform from the ground up.

### Our Commitment to Transparency and Collaboration

We choose to share our unit test reports publicly for several key reasons, even though we do not achieve 100% code coverage across modules:
*   **Building Trust:** Transparency in our testing efforts helps build trust with our users and the developer community. You can see for yourselves the areas we are actively testing and the current health of our codebase.
*   **Proof of Testing:** It demonstrates that unit tests are an integral part of our development process and that we are committed to quality.
*   **Inviting Collaboration:** By making these reports public, we invite potential collaborators to identify areas that may need more test coverage. This openness encourages contributions from the community, whether it's by reporting issues found through untested paths or by submitting pull requests with new unit tests for parts of the platform that are not yet comprehensively covered. We believe that collaborative testing strengthens the platform for everyone.

## Live Unit Test Coverage Reports

We make our unit test coverage reports publicly available for core packages. These live reports, together with open-sourced test files provide complete transparency into our testing efforts, showing detailed test results, coverage metrics, and execution status.

**[View Live Coverage Reports →](/learn/github/live-unit-test-coverage)**

The coverage reports include:
- Test execution results for core packages (Base, OCCT, Three.js, PlayCanvas, and more)
- Detailed coverage metrics (line, branch, function, and statement coverage)
- Clear visibility into tested and untested code paths

By regularly running and monitoring these tests, we strive to maintain the quality and stability of the platform. We encourage you to explore these reports to get a deeper insight into our development practices and the reliability of our core components.