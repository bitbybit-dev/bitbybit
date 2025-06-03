---
sidebar_position: 4
title: Why There's TypeScript Editor Inside Rete?
sidebar_label: TypeScript in Rete Editor
description: Understanding the synergy between visual programming and text-based scripting (TypeScript, JavaScript, JSON) within Bitbybit's Rete editor.
tags: [getting-started, rete, typescript]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/code-icon.svg" 
  alt="Coding editors category icon" 
  title="Coding editors category icon" /> 

import Admonition from '@theme/Admonition';

You might have noticed that Bitbybit's Rete visual programming editor includes integrated editors for TypeScript, JavaScript, and even JSON. At first glance, this might seem counterintuitive. If visual programming is so powerful, why "cheat" by including code editors?

The answer lies in our philosophy of providing both an intuitive entry point and a pathway to deeper control and understanding. Visual programming is fantastic for many things, but it's one tool in a larger creative and development toolkit.

## Visual Programming: The Intuitive Surface

Wiring algorithms together visually with nodes and connections in Rete is:

*   **Intuitive:** It often maps more directly to how we think about data flow and processes.
*   **Expressive:** Complex relationships can be visualized and understood quickly.
*   **Engaging:** It's a fun and interactive way to build logic, especially for those new to programming or exploring new domains like 3D geometry.

Bitbybit offers a vast library of pre-built Rete components (currently over 1,300 and growing!). These components encapsulate a significant amount of underlying code, making complex operations accessible through simple visual blocks.

<Admonition type="info" title="The Iceberg Analogy">
    Think of the visual components as the visible tips of icebergs. They are powerful and useful on their own. However, beneath each one lies a much larger, more intricate body of code—the "deep ocean" of algorithms and logic that makes them work.
</Admonition>

## Scripting Editors: Your Submarine for Deeper Exploration

While visual components cover a vast range of functionalities, there are times when you need to dive deeper. This is where the integrated scripting editors become invaluable. They are your "submarines," allowing you to:

1.  **Access Unexposed Functionality:**
    *   Not every single feature or parameter of underlying libraries (like BabylonJS can be exposed as a visual node. Sometimes, for fine-grained control or to access very specific, less commonly used features, writing a few lines of code is the most direct and efficient way.
    *   **Example:** You might want to tweak an advanced particle system property in BabylonJS that doesn't have a dedicated Rete node yet.

2.  **Implement Custom Logic:**
    *   There will always be scenarios unique to your project that require custom logic not covered by existing components. Instead of waiting for a new component, you can implement it directly with TypeScript or JavaScript.
    *   **Example:** "Ugh, if only I could just write these five lines of code to combine these data points in a very specific way..." With the script editor, you can!

3.  **Prototype and Extend:**
    *   If you find yourself repeatedly writing the same custom script, it might be a candidate for a new, reusable Rete component. The script editor is a great place to prototype this logic. If the idea proves to be generic and useful, we might even incorporate it as a new official component in a future release.

4.  **Debug and Understand:**
    *   Sometimes, seeing the underlying data or a snippet of code can help you understand why a visual graph isn't behaving as expected. The JSON editor can be useful for inspecting the raw structure of your Rete graph.

5.  **Overcome Limitations and Avoid Getting Stuck:**
    *   One of the most powerful aspects of this hybrid approach is that you're rarely truly "stuck." If a visual approach hits a wall, you have an alternative. This flexibility is crucial for more complex projects and continuous development.

## A Pathway for Growth: From Explorer to Developer

Bitbybit is designed to be a learning platform. We want to help users grow from curious explorers of visual programming to confident developers capable of tackling complex challenges.

*   **Visual Programming as a Gateway:** Rete provides an accessible and engaging entry point. It lowers the barrier to creating sophisticated 3D scenes and algorithmic designs.
*   **Scripting as the Next Step:** As your projects become more ambitious, or your curiosity drives you to understand the "how," the scripting editors are there to support your journey. Learning to read and write code unlocks a new level of capability and understanding.

While "vibe coding" and AI-assisted development are exciting trends, the fundamental ability to understand and write code remains an invaluable skill. Think of visual programming as your map and compass, and scripting as your diving gear—both essential for exploring the vast ocean of possibilities.

<Admonition type="tip" title="Practical Example">
    Want to see this hybrid approach in action?
    <ul>
        <li>Check out tutorials (like those found at [Bitbybit School](https://bitbybit.dev/school/courses/typescript-component-for-magical-powers-in-rete)) that might show how scripting can complement visual graphs.</li>
        <li>Explore live demo projects (like the one at [Magical Paricles Project](https://bitbybit.dev/projects/public/HyCMepiRhTWfua1QRaba/project-magical-particles-by-author-bitbybit)) where this synergy is applied.</li>
    </ul>
</Admonition>

## It's Not "Either/Or" — It's "Both/And"

The inclusion of TypeScript, JavaScript, and JSON editors within the Rete environment isn't about choosing one paradigm over the other. It's about providing a flexible, powerful, and adaptable platform where you can use the best tool for the task at hand, and grow your skills along the way.

Happy exploring, and happy coding!