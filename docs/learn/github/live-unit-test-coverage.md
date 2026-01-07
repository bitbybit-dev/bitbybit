---
sidebar_position: 3
title: Live Unit Test Coverage Reports
sidebar_label: Live Coverage Reports
description: Explore live unit test coverage reports for Bitbybit's core packages, demonstrating our commitment to quality and transparency.
tags: [github, unit-tests, coverage, development]
---

# Live Unit Test Coverage Reports

We believe in **transparency and accountability** in our development process. To that end, we make our unit test coverage reports publicly available for core packages in the Bitbybit ecosystem.

## Why Share Test Coverage Reports?

Making our test coverage reports public serves several important purposes:

### 1. **Transparency & Trust**
By openly sharing our test coverage, we demonstrate our commitment to quality and allow users to see exactly which parts of the codebase are tested. This builds trust with developers who rely on Bitbybit for their projects.

### 2. **Quality Assurance Visibility**
Coverage reports provide concrete evidence of our testing efforts. While coverage percentage alone doesn't guarantee quality, it shows that we systematically test our code and continuously monitor which areas need more attention.

### 3. **Inviting Community Contributions**
Public coverage reports help potential contributors identify areas that could benefit from additional tests. If you see untested code paths that you believe should have coverage, we welcome pull requests with additional unit tests.

### 4. **Accountability**
Making these reports live and accessible holds us accountable to maintain and improve our testing standards over time. It's a public commitment to quality that we take seriously.

### 5. **Educational Resource**
For developers learning about testing practices in complex 3D and CAD applications, these reports serve as real-world examples of how testing can be structured and maintained.

## Understanding the Reports

The reports below show:
- **Test suites and individual tests** with pass/fail status
- **Code coverage metrics** including line, branch, function, and statement coverage
- **Detailed execution results** for each test case

---

## Core Package Coverage Reports

### 1. Base Utilities and Core Types (`@bitbybit-dev/base`)

This package contains fundamental utilities, type definitions, and helper functions used across the Bitbybit platform. Its tests ensure the stability of these core building blocks.

<iframe
    src="https://tests.bitbybit.dev/base"
    width="100%"
    style={{backgroundColor: "white"}}
    height="600px"
    frameBorder="0"
    scrolling="yes"
    title="Bitbybit - Base Utilities Unit Test Report"
    allow="fullscreen"
></iframe>

---

### 2. OpenCascade Technology (OCCT) Wrapper (`@bitbybit-dev/occt`)

This is a critical package providing the JavaScript/TypeScript interface to the powerful OpenCascade geometric modeling kernel. Tests here cover a wide range of CAD operations, from creating basic shapes to complex boolean operations, filleting, chamfering, and data import/export.

<iframe
    src="https://tests.bitbybit.dev/occt"
    style={{backgroundColor: "white"}}
    width="100%"
    height="600px"
    frameBorder="0"
    scrolling="yes"
    title="Bitbybit - OCCT Wrapper Unit Test Report"
    allow="fullscreen"
></iframe>

---

### 3. Three.js Integration (`@bitbybit-dev/threejs`)

This package facilitates the integration of Bitbybit's algorithmic capabilities with the Three.js 3D graphics library. Tests cover drawing Bitbybit geometries in Three.js, converting between Bitbybit and Three.js data structures, and utility functions specific to the Three.js environment.

<iframe
    src="https://tests.bitbybit.dev/threejs"
    style={{backgroundColor: "white"}}
    width="100%"
    height="600px"
    frameBorder="0"
    scrolling="yes"
    title="Bitbybit - ThreeJS Integration Unit Test Report"
    allow="fullscreen"
></iframe>

---

### 4. PlayCanvas Integration (`@bitbybit-dev/playcanvas`)

This package provides the integration layer between Bitbybit and the PlayCanvas game engine. Tests verify the correct rendering of CAD geometries as PlayCanvas entities, material application, camera controls, and other PlayCanvas-specific functionality.

<iframe
    src="https://tests.bitbybit.dev/playcanvas"
    style={{backgroundColor: "white"}}
    width="100%"
    height="600px"
    frameBorder="0"
    scrolling="yes"
    title="Bitbybit - PlayCanvas Integration Unit Test Report"
    allow="fullscreen"
></iframe>

---

## Additional Package Reports Coming Soon

We are continuously expanding our test coverage across the Bitbybit ecosystem. Reports for additional packages, including:
- **BabylonJS Integration** (`@bitbybit-dev/babylonjs`)
- **JSCAD Wrapper** (`@bitbybit-dev/jscad`)
- **Manifold Wrapper** (`@bitbybit-dev/manifold`)

...will be added as they become available.

---

## Contributing to Test Coverage

If you'd like to help improve our test coverage:

1. **Explore the reports** to identify untested code paths
2. **Fork our repository** on GitHub
3. **Write unit tests** for uncovered functionality
4. **Submit a pull request** with your tests

We welcome contributions that help make Bitbybit more robust and reliable!

For more information about our testing philosophy and approach, see our [Unit Testing Approach](/learn/github/unit-tests) page.
