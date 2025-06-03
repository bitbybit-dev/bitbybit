---
sidebar_position: 1
title: Text in Bitbybit
sidebar_label: Texts in Bitbybit
description: An overview of the Text class in Bitbybit, explaining how to create, manipulate, and convert text, including generating vector text for 3D.
tags: [code, text]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/text-icon.svg" 
  alt="Text category icon" 
  title="Text category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/text.ts)

The `TextBitByBit` class (often referred to as `Text` in examples) provides tools for working with text strings. This includes basic string operations as well as more advanced features like converting text into 2D vector paths suitable for 3D rendering.

**What is Text in Bitbybit?**

Text in Bitbybit is simply a standard JavaScript string, like `"Hello, World!"`. This class helps you manage and transform these strings.

## Core Capabilities of the Text Class

Here's a high-level look at what the `Text` class can do. For the exact input parameters (like DTOs) and detailed behavior, please refer to the [full Text API documentation](https://docs.bitbybit.dev/classes/Bit.TextBitByBit.html) or the GitHub source linked above.

### 1. Creating and Representing Text

*   **Basic Text (`create()`):** If you have a string, this function simply returns it. It's primarily used in visual programming environments to explicitly define a text input.

### 2. Manipulating and Transforming Text Strings

Common operations for modifying and combining text:
*   **Splitting Text (`split()`):** Break a single string into a list (array) of smaller strings based on a specified separator character (e.g., splitting `"a,b,c"` by `,` results in `["a", "b", "c"]`).
*   **Replacing Text (`replaceAll()`):** Find all occurrences of a specific piece of text (search string) within a larger string and replace them with another piece of text.
*   **Joining Text (`join()`):** Take a list (array) of items (which will be converted to strings if they aren't already) and combine them into a single string, inserting a specified separator between each item.
*   **Converting to String:**
    *   `toString()`: Convert any single item (like a number or an object) into its string representation.
    *   `toStringEach()`: Convert every item in a list into its string representation, resulting in a list of strings.
*   **Formatting Text (`format()`):** Create a formatted string by replacing placeholders (like `{0}`, `{1}`) in a template string with values from a list.

### 3. Generating Vector Text (Text for 3D)

This is a powerful feature for displaying text in a 3D scene:
*   **Vector Character (`vectorChar()`):**
    *   Takes a single character and converts it into a set of 2D vector paths (polylines) that outline the shape of that character.
    *   It uses an embedded font definition and allows you to specify parameters like height and offset.
    *   The output includes the character's calculated `width`, `height`, and the `paths` (list of point lists) that define its shape on the XY plane (Z is 0).
*   **Vector Text (`vectorText()`):**
    *   Extends `vectorChar()` to process an entire string of text, including multiple lines and spaces.
    *   It handles line breaks (`\n`), letter spacing, line spacing, and text alignment (left, center, right).
    *   You can also choose to center the entire block of generated vector text around the origin `[0,0,0]`.
    *   The output is a list of "lines," where each line contains information about its characters (each character having its own vector paths). This structured data can then be used to create 3D text geometry (e.g., by extruding these 2D paths).

## Key Concepts for Vector Text

*   **Embedded Font:** The vector text generation relies on an internal, simplified font definition to create the character shapes. This means it's not using system fonts directly, so the style is fixed but highly portable.
*   **2D Paths:** The `vectorChar` and `vectorText` methods generate 2D paths (polylines made of `[x,y,z]` points, where `z` is initially 0). These paths represent the outline of the text on the XY plane.
*   **Further Processing:** To make this text visible in 3D, you would typically take these 2D paths and use other Bitbybit tools to extrude them into 3D shapes, or draw them as lines.
