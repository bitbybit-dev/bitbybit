---
sidebar_position: 1
title: Intro & Algorithm Organization
sidebar_label: Intro
description: Understand how algorithms are organized into common categories across Bitbybit's TypeScript, Blockly, and Rete editors, and why some categories are editor-specific.
tags: [code, draw]
---

# Common Editor Categories & Algorithm Organization

## Organization of Algorithms Across Editors

If you've explored the Bitbybit editors (TypeScript, Blockly, and Rete), you might have noticed a significant overlap in the categories of algorithms and components available. This is by design. Each editor primarily offers a different *method* of coding and interacting with the **same underlying set of core algorithms**.

For instance, crucial categories such as:
*   **OCCT (OpenCascade Technology):** For advanced CAD modeling.
*   **JSCAD:** For programmatic 3D modeling with constructive solid geometry.
*   **BabylonJS:** For interacting with the 3D rendering engine, creating meshes, materials, lights, etc.

...are present across all three editors. This consistency exists because the fundamental algorithms within these categories are identical, regardless of whether you're writing TypeScript, connecting Blockly blocks, or wiring Rete nodes.

### Editor-Specific Differences

However, this doesn't mean there are no differences in the categories available between the editors. Some algorithms or organizational concepts simply make more sense or are only applicable within the paradigm of a specific editor.

*   **Example:** The **Blockly editor** has dedicated categories for creating and managing `Functions` and `Variables` using visual blocks. The **Rete editor**, with its dataflow and node-based approach, doesn't have an equivalent direct concept for user-defined functions or variables in the same way, so such categories are not present there. The **TypeScript editor** handles functions and variables through standard TypeScript syntax.

## What Will Be Discussed in This Section?

In the following pages under this "Common" section, we will provide explanations for the major, shared categories of algorithms found within the Bitbybit editors. Our goal is to help you understand:
*   The general purpose of each category.
*   The kinds of operations or functionalities they provide.
*   Broadly how to approach using them.

We will not be detailing every single algorithm or component within each category here, but rather focusing on the main concepts and starting points. We'll typically begin by discussing the top-level categories you see in the editor toolbars.

## DRY (Don't Repeat Yourself) Approach

We believe in the "Don't Repeat Yourself" (DRY) principle. Therefore, we aim to explain common concepts that apply to all editors *once* within this "Common" section.

To illustrate the consistency and adaptability of our platform, we will often provide examples of how to achieve similar results or use related algorithms in all three main editors:
*   **TypeScript**
*   **Blockly**
*   **Rete**

This will demonstrate that the underlying algorithms and core concepts are transferable, even though the method of interaction differs.

Capabilities or features that are unique to a specific editor (e.g., the specifics of block manipulation in Blockly, or node connection in Rete) will be discussed in more detail under their respective "Getting Started" sections (e.g., "Getting Started / Blockly," "Getting Started / Rete").