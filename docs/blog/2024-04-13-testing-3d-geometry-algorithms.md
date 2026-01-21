---
slug: testing-3d-geometry-algorithms-in-occt
title: "TESTING 3D GEOMETRY ALGORITHMS IN OCCT"
authors: [ubarevicius]
tags: [bitbybit, cad]
description: "An introduction to recent improvements in code quality for the @bitbybit-dev/occt layer, focusing on unit testing and refactoring to benefit our platform's users."
---

![Looking for the best way to test 3D geometry algorithms. A girl is shown coding geometry in a room full of 3D printed objects.](https://ik.imagekit.io/bitbybit/app/assets/blog/testing-3d-geometry-algorithms-in-occt/testing-3d-geometry-algorithms-in-occt.jpeg "Looking for the best way to test 3D geometry algorithms")

We've been working on improving the quality of our core codebase by adding new unit tests and restructuring the code in the `@bitbybit-dev/occt` layer. In this article, we'll explain why these changes were necessary and how they benefit our platform's users.

<!--truncate-->

### What is @bitbybit-dev/occt?

`@bitbybit-dev/occt` is the core CAD (Computer-Aided Design) layer of our platform, shared with the open-source community under the MIT license. This layer is built on top of the powerful [OpenCascade Technology (OCCT)](https://github.com/Open-Cascade-SAS/OCCT) 3D kernel.

Over time, numerous 3D geometry algorithms have been developed within this layer, enabling our users to create intricate and complex 3D designs. As the codebase grew steadily, it became necessary to split it into smaller, more manageable modules. However, before embarking on this significant refactoring, it was imperative to write comprehensive unit tests. This ensures that any restructuring would not inadvertently disrupt existing functionality or introduce regressions.

You can find more about `@bitbybit-dev/occt` here:
*   **GitHub Repository:** [@bitbybit-dev/occt](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/occt)
*   **NPM Package:** [@bitbybit-dev/occt](https://www.npmjs.com/package/@bitbybit-dev/occt)

### Our Approach to Unit Tests

Unit tests are small, isolated pieces of code designed to verify specific parts of an algorithm. While "pure" unit tests often mock all external dependencies (like third-party libraries) to focus solely on small functions, we initially opted for a slightly broader approach. Our tests for `@bitbybit-dev/occt` also encompass the full OCCT geometry kernel.

This pragmatic decision was made to ensure that any potential degradations or issues are identified when integrating new versions of OCCT itself. While this doesn't preclude writing more focused, "pure" unit tests in the future where they offer specific benefits, our current strategy provides a robust safety net.

In this context, our "Unit Tests" might be more accurately viewed by some as "Integration Tests" or even "End-to-End" tests for certain functionalities. While purists might debate the terminology, this approach proves highly beneficial in our current situation. Testing geometry-based algorithms loses much of its significance if the constructed geometry itself cannot be effectively validated by the underlying kernel. Running the complete geometry kernel against the unit tests simplifies the testing process and enhances its overall utility.

Although a substantial number of unit tests were already in place, they did not cover all endpoints and functionalities. Refactoring a codebase of this complexity without comprehensive test coverage would have been a risky endeavor. Therefore, it was a logical and necessary step to prioritize writing the missing unit tests before proceeding with any major restructuring.

Here's an example of what one of our unit test files looks like:
*   [Example Unit Test File on GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/occt/lib/services/shapes/edge.test.ts)

### Sharing Unit Test Coverage Report

While our approach to testing is practical, we also believe in transparency. To that end, we've decided to share our unit test coverage report with the public. This report provides insights into the current state of our unit tests and the extent of code coverage achieved for the `@bitbybit-dev/occt` package.

You can access the report here:
*   **Coverage Report:** [tests.bitbybit.dev/occt](https://tests.bitbybit.dev/occt)

<iframe
    src="https://tests.bitbybit.dev/occt"
    width="100%"
    height="600px"
    frameborder="0"
    scrolling="yes"
    title="Unit Test Coverage Report for @bitbybit-dev/occt"
    allowfullscreen
></iframe>

Although we have not yet achieved 100% coverage, we are steadily progressing towards that goal. Reaching 100% coverage is a significant milestone, but it's important to acknowledge that the journey of unit testing doesn't stop there. It's an ongoing process of refining, expanding, and improving test coverage to ensure the highest possible quality of the codebase for its users. Our continued progress towards this goal reflects our unwavering dedication to maintaining the integrity and reliability of our codebase, demonstrating our commitment to providing a robust platform experience.

### Refactoring

Maintaining a clean and well-organized codebase is essential for long-term sustainability and development velocity. However, over-architecting solutions prematurely, without first assessing the codebase's growth and adoption patterns, can be impractical.

Over the past few months, numerous new features and algorithms were added to this particular section of the Bitbybit.dev platform. As a result, the codebase became increasingly challenging to navigate and maintain. This served as a clear indication that restructuring the code into smaller, more focused modules was necessary – and that's precisely what we've undertaken.

While the core algorithms themselves remain unchanged, the code has been significantly restructured. This refactoring aims to:
*   Enhance readability and understandability.
*   Facilitate the addition of future features more easily.
*   Simplify the process of writing new unit tests and maintaining existing ones.

We anticipate that this restructuring will lead to a reduction in the occurrence of bugs within our platform and also make it easier for the community to contribute to the codebase.

### What's Next?

OCCT provides an exceptional geometry kernel, and we have ambitious plans to implement numerous new 3D algorithms within this open-source `@bitbybit-dev/occt` layer. Establishing a more robust and well-tested foundation is crucial for this future development.

While OCCT forms the bedrock, we also have higher-level algorithms in other packages (like `@bitbybit-dev/core` and `@bitbybit-dev/occt-worker`) that warrant thorough testing. We will continue to write unit tests for these repositories and plan to share their coverage reports with the public in due course. You will be able to find these reports, alongside the OCCT one, on our dedicated testing site:
*   **All Test Reports:** [tests.bitbybit.dev](https://tests.bitbybit.dev)

Unit tests are a vital component of ensuring codebase quality, but they are not the only one. We have plans to implement additional quality assurance measures and processes in the future. Stay tuned for further updates on these initiatives.

Our ultimate objective is to ensure the stability and reliability of our codebase, instilling trust in the algorithms we've developed among the computational designers, developers, and creators who utilize our platform worldwide.