---
title: Logic in Bitbybit
sidebar_label: Logic in Bitbybit
description: An overview of the Logic class in Bitbybit, explaining how to work with boolean values, perform comparisons, and create conditional logic.
tags: [code, logic]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/logic-icon.svg" 
  alt="Logic category icon" 
  title="Logic category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/logic.ts)

The `Logic` class in Bitbybit provides fundamental tools for working with boolean logic (true/false values), making comparisons, and controlling program flow based on conditions.

**What is Boolean Logic?**

Boolean logic revolves around two states: **true** or **false**. These are essential for making decisions in any programming or design task. For example, "Is this object visible?" (true/false), or "Is this number greater than 10?" (true/false).

## Core Capabilities of the Logic Class

The `Logic` class helps you create, manipulate, and use boolean values effectively. Here's a high-level look at its features. For the exact input parameters, comparison operator symbols, and detailed behaviors, please consult the [full Logic API documentation](https://docs.bitbybit.dev/classes/Bit.Logic.html) or the GitHub source linked above.

### 1. Creating Boolean Values and Lists

Need to define a boolean or a sequence of them?
*   **Single Boolean (`boolean()`):** Directly specify a `true` or `false` value. This is useful in visual programming to explicitly set a boolean input.
*   **Random Boolean Lists:**
    *   `randomBooleans()`: Create a list of random `true` or `false` values of a specified length. You can control the probability of `true` occurring with a threshold.
*   **Booleans from Numbers (Thresholding):**
    *   `thresholdBooleanList()`: Convert a list of numbers into a list of booleans. Numbers below a specified `threshold` become `true`, and those at or above become `false` (can be inverted).
    *   `thresholdGapsBooleanList()`: Similar to the above, but you define multiple "gap" ranges (pairs of min/max numbers). If a number falls within any of these gaps, it becomes `true`.
    *   `twoThresholdRandomGradient()`: A more advanced method to convert numbers to booleans. It uses two thresholds to define ranges for guaranteed `true` or `false`, and a gradient randomization for numbers in between.

### 2. Manipulating Boolean Values

Basic operations on booleans:
*   **Not Operator (`not()`, `notList()`):** Inverts a boolean value ( `true` becomes `false`, `false` becomes `true`). This can be applied to a single boolean or to every boolean in a list.

### 3. Comparisons and Conditional Logic

Making decisions based on data:
*   **Compare Values (`compare()`):**
    *   Compare two values (numbers, text, etc.) using standard comparison operators like:
        *   `==` (equal to, loose comparison)
        *   `===` (strictly equal to, type and value)
        *   `!=` (not equal to, loose)
        *   `!==` (strictly not equal to)
        *   `<` (less than), `>` (greater than)
        *   `<=` (less than or equal to), `>=` (greater than or equal to)
    *   The result of the comparison is always a boolean (`true` or `false`).
*   **Value Gating (Conditional Output):**
    *   `valueGate()`: Acts like a switch. If a provided boolean is `true`, it passes through a specified `value`. If the boolean is `false`, it outputs `undefined` (nothing). This is useful for conditionally providing data to other operations.
    *   `firstDefinedValueGate()`: Given two input values, it returns the first one that is not `undefined`. If both are `undefined`, it returns `undefined`.
