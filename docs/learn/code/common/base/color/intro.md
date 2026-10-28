---
sidebar_position: 1
title: Colors in Bitbybit
sidebar_label: Colors in Bitbybit
description: How bitbybit.color writes colors as hex text or as r, g, b objects, converts between the two with an explicit channel range, reads single channels, inverts a color for readable text and converts channels between sRGB and linear light.
topic: code.base.color
type: explanation
tags: [code, color]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/color-icon.svg" 
  alt="Color category icon" 
  title="Color category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/color.ts)

`bitbybit.color` builds colors, converts them between the forms the library uses, reads single channels and inverts them.

## Two ways to write a color

- **Hex text**, such as `#ff5733`: six hex digits for red, green and blue. This is what materials and drawing options usually take.
- **An object** `{ r, g, b }`, or `{ r, g, b, a }` with an opacity `a` from 0 (transparent) to 1 (opaque). Its channels run either from 0 to 255 or from 0 to 1, and the functions that convert say which range they read or write.

## Giving a color a name

These functions return their input unchanged. They exist so that a color can be picked once in Rete or Blockly, named and reused:

- `hexColor` for hex text;
- `rgb255Color` and `rgb1Color` for `{ r, g, b }` with channels from 0 to 255 or from 0 to 1;
- `rgba255Color` (color channels from 0 to 255, `a` from 0 to 1) and `rgba1Color` (every channel from 0 to 1).

`rgbAtomic255Color` and `rgbAtomic1Color` build an `{ r, g, b }` object from three separate numbers.

## Converting

- `hexToRgb` reads hex text into `{ r, g, b }` with channels from 0 to 255: `#FF5733` gives `{ r: 255, g: 87, b: 51 }`. The `#` is optional; anything other than six hex digits, such as the short form `#f53`, stops the script with an error.
- `hexToRgbMapped` does the same and remaps the channels so that 0 becomes `from` and 255 becomes `to`. With `from` 0 and `to` 1, `#FF5733` gives `{ r: 1, g: 0.341, b: 0.2 }`.
- `rgbToHex` writes three channel values as hex text, and `rgbObjToHex` does the same from an `{ r, g, b }` object. `min` and `max` say which range the values use; with `max` 1, channels from 0 to 1 are remapped to 0 to 255 and rounded first, so `{ r: 1, g: 0.5, b: 0.2 }` gives `#ff8033`. `rgbToHex` also holds each channel between 0 and 255 after rounding, so a value past the range writes `ff` or `00` rather than a broken color.

## Reading one channel

- `getRedParam`, `getGreenParam` and `getBlueParam` read a channel of a hex color, remapped to the range `from` to `to` as `hexToRgbMapped` does.
- `rgbToRed`, `rgbToGreen` and `rgbToBlue` read a channel of an `{ r, g, b }` object as it is.

## Inverting

`invert` turns each channel of a hex color into 255 minus its value, so `#FF5733` gives `#00a8cc`. With `blackAndWhite` on, it gives black for a light color and white for a dark one instead, judged by perceived brightness, which keeps text readable on a colored background.

## Linear light and sRGB

The channels of a hex color, and of every color the functions above read or write, are **sRGB-encoded**: the numbers are spaced the way eyes see brightness, not the way light adds up. Lighting, glTF material factors and the colors OpenCascade holds after reading a STEP file work in **linear light** instead, so a color crossing between the two needs converting, or it comes out too dark or too pale.

- `srgbToLinear` turns one sRGB channel, from 0 to 1, into linear light: 0.5 gives about 0.214.
- `linearToSrgb` turns a linear channel back: 0.214 gives 0.5.

Both work on one channel at a time, so convert red, green and blue separately; `hexToRgbMapped` with `from` 0 and `to` 1 gives the channels of a hex color to start from. Blending two colors, or comparing how bright they are, is right in linear light: convert, blend, and convert the result back.

## Every function

{/* api:color:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`getBlueParam`](https://docs.bitbybit.dev/classes/Bit.Color#getBlueParam) | Reads the blue channel of a hex color, remapped to a range of your choice. |
| [`getGreenParam`](https://docs.bitbybit.dev/classes/Bit.Color#getGreenParam) | Reads the green channel of a hex color, remapped to a range of your choice. |
| [`getRedParam`](https://docs.bitbybit.dev/classes/Bit.Color#getRedParam) | Reads the red channel of a hex color, remapped to a range of your choice. |
| [`hexColor`](https://docs.bitbybit.dev/classes/Bit.Color#hexColor) | Passes a hex color through unchanged, so a color can be given a name and reused. |
| [`hexToRgb`](https://docs.bitbybit.dev/classes/Bit.Color#hexToRgb) | Reads a hex color into an `{ r, g, b }` object with channels from 0 to 255. |
| [`hexToRgbMapped`](https://docs.bitbybit.dev/classes/Bit.Color#hexToRgbMapped) | Reads a hex color into an `{ r, g, b }` object with the channels remapped to a range of your choice. |
| [`invert`](https://docs.bitbybit.dev/classes/Bit.Color#invert) | Inverts a hex color, turning each channel into its opposite: 255 minus the value. |
| [`linearToSrgb`](https://docs.bitbybit.dev/classes/Bit.Color#linearToSrgb) | Turns one linear-light color channel back into its sRGB encoding, the inverse of `srgbToLinear`, as a hex color holds it. |
| [`rgb1Color`](https://docs.bitbybit.dev/classes/Bit.Color#rgb1Color) | Passes an `{ r, g, b }` color with channels from 0 to 1 through unchanged, so it can be given a name and reused. |
| [`rgb255Color`](https://docs.bitbybit.dev/classes/Bit.Color#rgb255Color) | Passes an `{ r, g, b }` color with channels from 0 to 255 through unchanged, so it can be given a name and reused. |
| [`rgba1Color`](https://docs.bitbybit.dev/classes/Bit.Color#rgba1Color) | Passes an `{ r, g, b, a }` color with every channel from 0 to 1 through unchanged, so it can be given a name and reused. |
| [`rgba255Color`](https://docs.bitbybit.dev/classes/Bit.Color#rgba255Color) | Passes an `{ r, g, b, a }` color with color channels from 0 to 255 and opacity from 0 to 1 through unchanged, so it can be given a name and reused. |
| [`rgbAtomic1Color`](https://docs.bitbybit.dev/classes/Bit.Color#rgbAtomic1Color) | Builds an `{ r, g, b }` color from three separate channel values from 0 to 1. |
| [`rgbAtomic255Color`](https://docs.bitbybit.dev/classes/Bit.Color#rgbAtomic255Color) | Builds an `{ r, g, b }` color from three separate channel values from 0 to 255. |
| [`rgbObjToHex`](https://docs.bitbybit.dev/classes/Bit.Color#rgbObjToHex) | Writes an `{ r, g, b }` color as a hex color. |
| [`rgbToBlue`](https://docs.bitbybit.dev/classes/Bit.Color#rgbToBlue) | Reads the blue channel of an `{ r, g, b }` color. |
| [`rgbToGreen`](https://docs.bitbybit.dev/classes/Bit.Color#rgbToGreen) | Reads the green channel of an `{ r, g, b }` color. |
| [`rgbToHex`](https://docs.bitbybit.dev/classes/Bit.Color#rgbToHex) | Writes three channel values as a hex color. |
| [`rgbToRed`](https://docs.bitbybit.dev/classes/Bit.Color#rgbToRed) | Reads the red channel of an `{ r, g, b }` color. |
| [`srgbToLinear`](https://docs.bitbybit.dev/classes/Bit.Color#srgbToLinear) | Turns one sRGB-encoded color channel into linear light, the form glTF, STEP colors read by XCAF and the renderers' lighting work in. |

{/* api:color:end */}
