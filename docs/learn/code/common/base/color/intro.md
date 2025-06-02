---
sidebar_position: 1
title: Colors in Bitbybit
sidebar_label: Colors in Bitbybit
description: An overview of the Color class in Bitbybit, explaining how to work with hex and RGB color formats, convert between them, and perform basic color manipulations.
tags: [code, color]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/color-icon.svg" 
  alt="Color category icon" 
  title="Color category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/color.ts)

The `Color` class in Bitbybit provides tools for defining, converting, and manipulating colors, primarily focusing on hexadecimal (hex) and RGB (Red, Green, Blue) color formats.

**Understanding Color Formats in Bitbybit:**

*   **Hex Color (`Inputs.Base.Color`):** This is a string representation of a color, commonly used in web design and graphics, like `#FF0000` (for red) or `#00FF00` (for green).
*   **RGB Color (`Inputs.Base.ColorRGB`):** This is an object representing color with separate red, green, and blue components, typically as numbers. For example, `{ r: 255, g: 0, b: 0 }` for red.
    *   The `Color` class can handle RGB values in different ranges (e.g., 0-255, 0-1, or 0-100) and will remap them as needed for conversions.

## Core Capabilities of the Color Class

The `Color` class makes it easy to work with these common color formats. Here's what it can do. For precise input parameters and detailed behavior (like how RGB ranges are handled), please consult the [full Color API documentation](https://docs.bitbybit.dev/classes/Bit.Color.html) or the GitHub source linked above.

### 1. Creating and Representing Colors

*   **Hex Color Input (`hexColor()`):** If you already have a hex color string (e.g., from a color picker), this function simply returns it. It's useful in visual programming environments to explicitly define a color input.

### 2. Converting Between Color Formats

This is a key function of the class, allowing you to switch between hex and RGB representations:
*   **Hex to RGB (`hexToRgb()`):** Converts a hex color string (e.g., `#FF0000`) into an RGB object (e.g., `{ r: 255, g: 0, b: 0 }`).
*   **Hex to RGB Mapped (`hexToRgbMapped()`):** Converts a hex color to an RGB object, but then remaps the R, G, and B values from the standard 0-255 range to a custom range you specify (e.g., 0-1).
*   **RGB to Hex (`rgbToHex()`):** Converts individual R, G, and B numerical values into a hex color string. It can intelligently handle input RGB values that are not in the 0-255 range by remapping them if you provide their original `min` and `max` range.
*   **RGB Object to Hex (`rgbObjToHex()`):** Similar to `rgbToHex()`, but takes an RGB object (`{r, g, b}`) as input instead of separate R, G, B parameters.

### 3. Extracting Color Components

Get individual R, G, or B values from a color:
*   **From Hex (Mapped):**
    *   `getRedParam()`: Gets the red component from a hex color, remapped to a specified range.
    *   `getGreenParam()`: Gets the green component from a hex color, remapped to a specified range.
    *   `getBlueParam()`: Gets the blue component from a hex color, remapped to a specified range.
*   **From RGB Object:**
    *   `rgbToRed()`: Extracts the `r` value from an RGB object.
    *   `rgbToGreen()`: Extracts the `g` value from an RGB object.
    *   `rgbToBlue()`: Extracts the `b` value from an RGB object.

### 4. Basic Color Manipulation

*   **Invert Color (`invert()`):**
    *   Takes a hex color and produces its photographic negative (e.g., red becomes cyan, white becomes black).
    *   It also offers an option to invert to pure black or white based on the original color's perceived brightness, which can be useful for ensuring text visibility against a colored background.
