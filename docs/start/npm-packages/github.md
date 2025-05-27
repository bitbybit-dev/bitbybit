---
sidebar_position: 2
title: Understanding the Bitbybit GitHub Monorepo
sidebar_label: GitHub Monorepo Overview
description: An overview of the Bitbybit main GitHub monorepo, its structure, contents, and the technologies used.
slug: /development/monorepo-overview # Or a similar path
tags: [github, npm-packages, typescript]
---

# Understanding the Bitbybit GitHub Monorepo

Welcome to this overview of the main Bitbybit GitHub monorepo. This page serves as a guide to understanding its structure, its contents, and how it all fits together to power the Bitbybit platform.

➡️ **Main Repository URL: [https://github.com/bitbybit-dev/bitbybit](https://github.com/bitbybit-dev/bitbybit)**

This monorepo is the central hub for the core 3D development of Bitbybit

## What is a Monorepo? And Why Do We Use One?

A "monorepo" (monolithic repository) is a software development strategy where code for many different projects or packages is stored in the same version control repository.

For Bitbybit, this approach helps us:
*   **Manage interconnected packages:** Our core algorithms are often used together and can have dependencies on each other.
*   **Ensure consistency:** Shared tooling, linting, and build processes can be applied across all packages.
*   **Streamline development:** Changes that affect multiple parts of the platform can be made and tested in a single place.

## Primary Language: TypeScript

The dominant programming language you'll find throughout the `bitbybit` monorepo is **TypeScript**. We chose TypeScript for its:
*   **Strong Typing:** Helps catch errors early, improves code maintainability, and makes refactoring safer.
*   **Enhanced Developer Experience:** Features like autocompletion and better tooling are invaluable.
*   **Suitability for Complex Systems:** Essential for building a robust platform like Bitbybit, especially one that supports visual programming.

## What's Inside the Monorepo? Key Components:

The `bitbybit-dev/bitbybit` monorepo houses several critical parts of the platform:

### 1. Core Algorithmic Packages (NPM)
A significant portion of the monorepo is dedicated to individual **NPM packages**. Each package typically encapsulates a specific set of functionalities or algorithms related to 3D geometry, CAD operations, or utility functions. Examples include:
    *   Packages for creating points, lines, curves, surfaces, and solids.
    *   Packages for performing geometric transformations, intersections, and analysis.
    *   Wrappers and integrations for CAD kernels like OpenCascade Technology (OCCT), Manifold or JSCAD.
    *   Utility packages for common tasks.

These packages are designed to be:
    *   **Modular:** Usable independently or in combination.
    *   **Published to NPM:** Allowing developers to use Bitbybit's capabilities in their own TypeScript/JavaScript projects.
    *   **The backbone of Bitbybit:** They power the higher level proprietary Bitbybit platform and visual programming editors.

You'll typically find these packages within a `packages/dev` directory in the monorepo.

### 2. The Documentation Site (Docusaurus)
This very documentation site is built using **Docusaurus** and its source files (Markdown, React components, configuration) reside directly within the `bitbybit` monorepo, in a `docs/` directory. This colocation makes it easier to keep documentation in sync with code changes.

### 3. Architectural Philosophy
As you explore the codebase, particularly the algorithmic packages, you'll notice a consistent and somewhat strict architectural style. This is intentional and crucial for a key goal of Bitbybit: **to seamlessly support higher-level visual programming editors** (like those based on Rete.js or Blockly).

These architectural rules ensure:
    *   **Clear API Definitions:** Functions have well-defined inputs, outputs, and types, making them easily translatable into visual blocks.
    *   **Predictable Behavior:** Consistent patterns make it easier to integrate algorithms into visual workflows.
    *   **Type Safety for Visual Editors:** TypeScript's type information is leveraged to provide rich feedback within the visual editors.

Understanding this underlying principle is key to understanding the "why" behind some of the code structure.

## How to Engage with the Monorepo

There are several ways to interact with and benefit from the monorepo:

*   **Browse and Learn:** Explore the code to understand how specific algorithms are implemented or how the platform is structured.
*   **Use the NPM Packages:** If you're a developer, you can install and use the published NPM packages in your own projects.
*   **Contribute:**
    *   **Code Contributions:** If you're interested in contributing to the algorithms or core platform features, please check out our [Contribution Guidelines](https://github.com/bitbybit-dev/bitbybit/blob/master/CONTRIBUTING).
    *   **Documentation Improvements:** The documentation is always a great place to contribute. Enhancing clarity, adding examples, or fixing typos directly helps the community. PRs to the docs folder are welcome!
    - **Blog Posts:** If you’ve built interesting projects using Bitbybit and want to share your story, you're welcome to submit a pull request with a Docusaurus blog entry. We advise to discuss your idea first with us via [info@bitbybit.dev](mailto:info@bitbybit.dev). Blog posts should be placed in the `docs/blog` folder. Don’t forget to add your information to `docs/blog/authors`, including your name. If your blog post is accepted, we reserve the right to share it on our social media channels—though we are under no obligation to do so. Please note that we also reserve the right not to merge your pull request, which means your blog post may not be published.

## Separate but Related: The `app-examples` Repository

It's important to note that while the core libraries live in the main `bitbybit` monorepo, we have a separate repository for application examples:

➡️ **[https://github.com/bitbybit-dev/app-examples](https://github.com/bitbybit-dev/app-examples)**

This repository hosts various standalone applications and demos that showcase how the released Bitbybit NPM packages can be used in different contexts. It serves as a practical demonstration ground for the libraries developed in the main monorepo. It might also be that in the future those examples will be brought inside the monorepo, but it's not planned at the moment.

## Summary

The `bitbybit-dev/bitbybit` monorepo is the engine of Bitbybit. It's where our core TypeScript algorithms are developed, packaged for NPM, and where our documentation lives. Its structure is carefully designed to support both direct library usage and integration into powerful visual programming environments.

We encourage you to explore it, learn from it, and consider contributing to its growth!