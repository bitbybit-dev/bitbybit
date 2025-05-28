---
sidebar_position: 1
title: Introduction to TypeScript
sidebar_label: What is TypeScript?
description: Learn about TypeScript, how it enhances JavaScript for safer and more robust coding, and how it's used with the Monaco editor on the Bitbybit platform.
tags: [getting-started, typescript, occt]
---

# What is TypeScript?

TypeScript is a powerful programming language that builds upon JavaScript by adding optional static typing. This "extra syntax" allows for better tooling and integration with your code editor, enabling features like:

*   **Early Error Detection:** Catch potential errors during development directly in your editor, before you even run the code.
*   **Improved Code Readability and Maintainability:** Types make code easier to understand and refactor.
*   **Enhanced Autocompletion and IntelliSense:** Get smarter suggestions and code navigation.

Despite these additions, TypeScript code compiles down to plain JavaScript. This means it can run in any environment where JavaScript runs, including:

*   Web browsers
*   Node.js and Deno (for server-side applications)
*   Various other applications and embedded systems

TypeScript also understands existing JavaScript code and uses type inference to provide much of its tooling benefits even without explicit type annotations.

![Logo of TypeScript](https://ik.imagekit.io/bitbybit/app/assets/start/typescript/typescript-logo.png)
*TypeScript Logo*

## Monaco Editor: Your Gateway to TypeScript on Bitbybit

On the Bitbybit platform, we provide the **Monaco Editor** for users who wish to write TypeScript code directly. Monaco is the same editor that powers the popular Visual Studio Code, so you'll find it offers a rich, user-friendly, and familiar coding experience.

Programming 3D geometry with TypeScript via the Monaco editor offers the **highest degree of flexibility and control** over your creations. However, it is also the most complex way to program on our platform, requiring a good understanding of coding concepts.

**Our Recommendation:**

*   **For Beginners:** If you are new to programming or computational design, we recommend starting with our visual editors, **Blockly** or **Rete**. These provide a more guided and intuitive introduction.
*   **For Experienced Programmers or Advancing Users:** Once you feel comfortable with the concepts in Blockly or Rete, or if you are already an experienced programmer, transitioning to TypeScript in the Monaco editor will unlock the full potential of our platform.

### Considerations for Large Projects

While you can theoretically build substantial projects directly within our web-based Monaco editor, it's important to consider maintainability and debugging for very large or complex endeavors.

*   **For Large-Scale Development:** If you are planning a significant project, we strongly advise using our **[NPM packages](/learn/npm-packages/intro)**. This allows you to set up your own local development environment (using tools like VS Code, WebStorm, etc.), leverage version control (like Git), and build more robust, maintainable, and scalable applications.
*   **Web Editor Suitability:** Our web editor is excellent for learning, prototyping, smaller projects, and sharing interactive examples.

Ultimately, the choice of tool depends on your project's scope, your experience level, and your development preferences.