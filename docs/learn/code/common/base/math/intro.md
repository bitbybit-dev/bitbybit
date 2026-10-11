---
sidebar_position: 1
title: Math in Bitbybit
sidebar_label: Math in Bitbybit
description: How bitbybit.math does arithmetic, rounding, trigonometry in radians, random numbers, safe evaluation of typed expressions, and the blending, easing and wrapping helpers used for animation and parametric variation.
topic: code.base.math
type: explanation
tags: [code, math]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/math-icon.svg" 
  alt="Math category icon" 
  title="Math category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/math.ts)

`bitbybit.math` works on plain numbers. Many of its functions wrap JavaScript's own `Math`, so that Rete and Blockly can use them as nodes and blocks; in TypeScript you can call either.

## Angles are in radians

`sin`, `cos` and `tan` take an angle in radians, and `asin`, `acos` and `atan` give one. Most angles people type are in degrees, so convert at the boundary with `degToRad` and `radToDeg`: 180 degrees is `pi()`, about 3.14159.

## Arithmetic

- `add`, `subtract`, `multiply`, `divide` and `power` work on `first` and `second`, in that order: subtract gives first minus second, power gives first to the power of second. Dividing by 0 gives `Infinity`, as in JavaScript.
- `modulus` gives the remainder of a division; its sign follows the first number, so -7 modulus 3 is -1.
- `twoNrOperation` does any of add, subtract, multiply, divide, power or modulus, chosen by `operation`.
- `abs`, `negate`, `sign` (-1, 0 or 1), `sqrt` (`NaN` for a negative number), `ln`, `log10`, `exp` (e to the power) and `tenPow` (10 to the power) work on one number.
- `oneNrOperation` does any one-number operation, chosen by `operation`: the ones above, the rounding and trigonometric functions and the angle conversions.
- `evalArithmetic` works out an expression typed as text, such as `(3 + 2) / 4`, with numbers, `+`, `-`, `*`, `/` and parentheses. The library parses it itself and never runs it as JavaScript, so it is safe with text a user typed. Anything else in the text stops the script with an error.

## Rounding and formatting

- `round` rounds to the nearest whole number, with halves rounding up; `floor` rounds down and `ceil` rounds up.
- `roundToDecimals` rounds to `decimalPlaces` digits after the point. `roundAndRemoveTrailingZeros` does the same and also cleans floating-point noise, so 1.320000001 becomes 1.32.
- `fract` keeps the part after the decimal point, measured up from the whole number below, so -2.3 gives 0.7.
- `toFixed` gives text, not a number, with exactly `decimalPlaces` digits and trailing zeros kept: 5 with 3 places is `"5.000"`.

## Numbers to start from

- `number` passes a number through unchanged, so a value can be set once in Rete or Blockly, named and reused. `pi` gives pi.
- `random` gives a number from 0 up to, but not including, 1. `randomNumber` gives one between `low` and `high`, and `randomNumbers` gives `count` of them. Each call gives new values.

## Blending, easing and ranges

These are the building blocks of animation and parametric variation.

- `lerp` blends from `start` to `end` by a fraction `t`: 0 gives the start, 1 the end, and a `t` outside 0 to 1 continues past them. `inverseLerp` goes the other way and gives the `t` of a value.
- `remap` maps a number from one range onto another, keeping its relative position: 5 in 0 to 10 becomes 50 in 0 to 100.
- `ease` maps `x` from 0 to 1 onto `min` to `max` along an easing curve, so the change speeds up or slows down instead of being even. `ease` names the curve: an `easeIn...` curve starts slowly, `easeOut...` ends slowly and `easeInOut...` does both, in the Sine, Quad, Cubic, Quart, Quint, Expo, Circ, Elastic, Back and Bounce families.
- `smoothstep` turns a value from 0 to 1 into a gentle S-curve, after clamping it to that range.
- `clamp` keeps a number between `min` and `max`.
- `wrap` cycles a number into the range from `min` up to `max`, so 370 in 0 to 360 gives 10. Unlike a plain modulus it handles negative numbers.
- `pingPong` bounces a growing `t` back and forth between 0 and `length`.
- `moveTowards` moves `current` toward `target` by at most `maxDelta`, without overshooting.

Here a fraction, as a slider gives it, is remapped to a height between 1 and 6 and rounded to one decimal, and the height sizes a column:

{/* example:remapped-height:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"height\":{\"id\":\"height\",\"name\":\"bitbybit.math.remap\",\"customName\":\"remap\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"number\":0.7,\"fromLow\":0,\"fromHigh\":1,\"toLow\":1,\"toHigh\":6},\"inputs\":{},\"position\":[40,40]},\"rounded\":{\"id\":\"rounded\",\"name\":\"bitbybit.math.roundToDecimals\",\"customName\":\"round to decimals\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"number\":1.123456,\"decimalPlaces\":1},\"inputs\":{\"number\":{\"connections\":[{\"node\":\"height\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"column\":{\"id\":\"column\",\"name\":\"bitbybit.occt.shapes.solid.createCylinder\",\"customName\":\"cylinder\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.5,\"height\":2,\"center\":[0,0,0],\"direction\":[0,1,0],\"angle\":360,\"originOnCenter\":false},\"inputs\":{\"height\":{\"connections\":[{\"node\":\"rounded\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]}},\"modules\":{}}","type":"rete"}}
  title="A fraction remapped to a height in Rete"
  description="A fraction from 0 to 1, such as a slider gives, remapped to a height between 1 and 6 and rounded to one decimal, which sizes a column."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createCylinder\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"Height\"><block type=\"bitbybit.math.roundToDecimals\"><value name=\"Number\"><block type=\"bitbybit.math.remap\"><value name=\"Number\"><block type=\"math_number\"><field name=\"NUM\">0.7</field></block></value><value name=\"FromLow\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"FromHigh\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"ToLow\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"ToHigh\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value></block></value><value name=\"DecimalPlaces\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">360</field></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value></block></xml>","type":"blockly"}}
  title="A fraction remapped to a height in Blockly"
  description="A fraction from 0 to 1, such as a slider gives, remapped to a height between 1 and 6 and rounded to one decimal, which sizes a column."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const height = bitbybit.math.remap({ number: 0.7, fromLow: 0, fromHigh: 1, toLow: 1, toHigh: 6 });\nconst rounded = bitbybit.math.roundToDecimals({ number: height, decimalPlaces: 1 });\nconst column = await bitbybit.occt.shapes.solid.createCylinder({ radius: 0.5, height: rounded, center: [0, 0, 0] });\n\nawait bitbybit.draw.drawAnyAsync({ entity: column });","type":"typescript"}}
  title="A fraction remapped to a height in TypeScript"
  description="A fraction from 0 to 1, such as a slider gives, remapped to a height between 1 and 6 and rounded to one decimal, which sizes a column."
/>

</TabItem>
</Tabs>

{/* example:remapped-height:end */}

## Every function

{/* api:math:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`abs`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#abs) | Drops the sign of a number, so the result is never negative. |
| [`acos`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#acos) | Finds the angle, in radians, whose cosine is the given number. |
| [`add`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#add) | Adds two numbers. |
| [`asin`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#asin) | Finds the angle, in radians, whose sine is the given number. |
| [`atan`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#atan) | Finds the angle, in radians, whose tangent is the given number. |
| [`ceil`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#ceil) | Rounds a number up to the whole number above it. |
| [`clamp`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#clamp) | Keeps a number within a range: below `min` becomes `min`, above `max` becomes `max`. |
| [`cos`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#cos) | Finds the cosine of an angle given in radians. |
| [`degToRad`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#degToRad) | Converts an angle from degrees to radians. |
| [`divide`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#divide) | Divides the first number by the second. |
| [`ease`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#ease) | Maps a value from 0 to 1 onto the range `min` to `max` along an easing curve, so the result speeds up or slows down instead of changing evenly. |
| [`evalArithmetic`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#evalArithmetic) | Works out a simple arithmetic expression written as text: numbers, +, -, the multiplication sign, /, parentheses and spaces. |
| [`exp`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#exp) | Raises e, the base of the natural logarithm, to the power of a number. |
| [`floor`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#floor) | Rounds a number down to the whole number below it. |
| [`fract`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#fract) | Keeps the part of a number after the decimal point, measured up from the whole number below it, so the result is always from 0 up to 1. |
| [`inverseLerp`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#inverseLerp) | Finds where a value sits between a start and an end, as a fraction: the `t` that `lerp` would need to produce it. |
| [`lerp`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#lerp) | Blends from a start value to an end value by a fraction `t`: 0 gives the start, 1 the end, 0.5 the midpoint. |
| [`ln`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#ln) | Finds the natural logarithm of a number: the power e must be raised to for that number. |
| [`log10`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#log10) | Finds the base-10 logarithm of a number: the power 10 must be raised to for that number. |
| [`modulus`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#modulus) | Finds the remainder after dividing one number by another. |
| [`moveTowards`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#moveTowards) | Moves a value toward a target by at most `maxDelta`, without overshooting it. |
| [`multiply`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#multiply) | Multiplies two numbers. |
| [`negate`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#negate) | Flips the sign of a number. |
| [`number`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#number) | Passes a number through unchanged, so a value can be given a name and reused. |
| [`oneNrOperation`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#oneNrOperation) | Applies one operation to a single number: absolute, negate, square root, rounding, logarithms, the trigonometric functions and their inverses, exponential, or a conversion between radians and degrees. |
| [`pi`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#pi) | Gives the constant pi, the ratio of a circle's circumference to its diameter. |
| [`pingPong`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#pingPong) | Bounces a value back and forth between 0 and `length` as `t` grows: up to `length`, back down to 0, and again. |
| [`power`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#power) | Raises the first number to the power of the second. |
| [`radToDeg`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#radToDeg) | Converts an angle from radians to degrees. |
| [`random`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#random) | Gives a random number from 0 up to, but not including, 1. |
| [`randomNumber`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#randomNumber) | Gives a random number between `low` and `high`. |
| [`randomNumbers`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#randomNumbers) | Gives a list of random numbers between `low` and `high`. |
| [`remap`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#remap) | Maps a number from one range onto another, keeping its relative position. |
| [`round`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#round) | Rounds a number to the nearest whole number; halves round up. |
| [`roundAndRemoveTrailingZeros`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#roundAndRemoveTrailingZeros) | Rounds a number to a given number of decimal places and drops the zeros at the end. |
| [`roundToDecimals`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#roundToDecimals) | Rounds a number to a given number of decimal places. |
| [`sign`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#sign) | Tells the sign of a number: -1 when negative, 0 when zero, 1 when positive. |
| [`sin`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#sin) | Finds the sine of an angle given in radians. |
| [`smoothstep`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#smoothstep) | Turns a value from 0 to 1 into a smooth S-curve that starts and ends gently; the value is clamped to that range first. |
| [`sqrt`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#sqrt) | Finds the square root of a number. |
| [`subtract`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#subtract) | Subtracts the second number from the first. |
| [`tan`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#tan) | Finds the tangent of an angle given in radians. |
| [`tenPow`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#tenPow) | Raises 10 to the power of a number. |
| [`toFixed`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#toFixed) | Formats a number as text with a fixed number of decimal places, keeping trailing zeros. |
| [`twoNrOperation`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#twoNrOperation) | Applies one arithmetic operation to two numbers: add, subtract, multiply, divide, power or modulus. |
| [`wrap`](https://docs.bitbybit.dev/classes/Bit.MathBitByBit#wrap) | Wraps a number into a range so it cycles round: past `max` it comes back in at `min`, and below `min` it comes back in at `max`. |

{/* api:math:end */}
