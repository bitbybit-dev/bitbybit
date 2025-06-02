---
sidebar_position: 1
title: Math in Bitbybit
sidebar_label: Math in Bitbybit
description: An overview of the Math class in Bitbybit, providing tools for common mathematical operations, number generation, and easing functions.
tags: [code, math]
---

<img 
  src="https://s.bitbybit.dev/assets/icons/white/math-icon.svg" 
  alt="Math category icon" 
  title="Math category icon"
  width="100" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/math.ts)

The `MathBitByBit` class (often referred to as `Math` in examples) is your go-to utility for a variety of numerical operations, from basic arithmetic to more specialized functions like easing and number generation.

Many of its functions are convenient wrappers around standard JavaScript `Math` object methods, making them readily available within the Bitbybit ecosystem.

## Core Capabilities of the Math Class

Here's a breakdown of what the `Math` class offers. For precise input parameters, specific operator names (for `twoNrOperation` and `oneNrOperation`), and detailed behavior, please consult the [full Math API documentation](https://docs.bitbybit.dev/classes/Bit.MathBitByBit.html) or the GitHub source linked above.

### 1. Basic Arithmetic & Number Operations

These are the everyday math functions:
*   **Fundamental Operations:** Add (`add`), subtract (`subtract`), multiply (`multiply`), divide (`divide`), and raise to a power (`power`). There's also a general `twoNrOperation()` that can perform these based on an operator type.
*   **Single Number Functions:**
    *   Get the square root (`sqrt`), absolute value (`abs`), or negate a number (`negate`).
    *   Rounding: Round to the nearest integer (`round`), round down (`floor`), or round up (`ceil`). You can also round to a specific number of decimal places (`roundToDecimals()`).
    *   Logarithms: Natural log (`ln`), base-10 log (`log10`).
    *   Exponentials: `e` to the power of x (`exp`), 10 to the power of x (`tenPow`).
    *   Modulus: Find the remainder of a division (`modulus()`).
*   **Trigonometry:** Standard trigonometric functions like `sin()`, `cos()`, `tan()`, and their inverses (`asin()`, `acos()`, `atan()`).
*   **Angle Conversion:** Convert between degrees and radians (`degToRad()`, `radToDeg()`).
*   A general `oneNrOperation()` method can perform many of these single-number operations by specifying an operator type.

### 2. Number Generation & Constants

Creating numbers:
*   **Specific Number:** Simply return a provided number (`number()`). This can be useful in visual programming environments.
*   **Random Numbers:**
    *   Generate a random number between 0 (inclusive) and 1 (exclusive) (`random()`).
    *   Generate a random number within a specified range (low to high) (`randomNumber()`).
    *   Generate a list of random numbers within a range (`randomNumbers()`).
*   **Constants:** Get the value of Pi (`pi()`).

### 3. Number Manipulation & Easing

More advanced ways to work with numbers:
*   **Remapping (`remap()`):** Take a number from one range and scale it proportionally to fit into a new range. For example, mapping a value from `0-100` to `0-1`.
*   **Easing Functions (`ease()`):** This is a powerful feature for creating smooth transitions or non-linear progressions.
    *   You provide an input value `x` (typically from 0 to 1), a target output range (`min` and `max`), and an `ease` type (e.g., `easeInSine`, `easeOutQuad`, `easeInOutElastic`).
    *   The function transforms `x` according to the chosen easing curve and then maps it to your desired `min`-`max` range.
    *   This is extremely useful for animations, procedural modeling where you want non-uniform distributions, and controlling behavior over time. The class includes a comprehensive set of standard easing functions (like Sine, Quad, Cubic, Expo, Bounce, etc., with In, Out, and InOut variations).
*   **Fixed Decimal Representation (`toFixed()`):** Convert a number to a string, rounded to a specified number of decimal places.
