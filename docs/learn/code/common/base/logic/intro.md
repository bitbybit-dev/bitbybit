---
title: Logic in Bitbybit
sidebar_label: Logic in Bitbybit
description: How bitbybit.logic compares values, flips booleans, turns lists of numbers into true/false patterns by thresholds or at random, and lets a value through only when a condition holds.
topic: code.base.logic
type: explanation
tags: [code, logic]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/logic-icon.svg" 
  alt="Logic category icon" 
  title="Logic category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/logic.ts)

`bitbybit.logic` works with booleans, the values `true` and `false`, and with decisions made from them: "is this number greater than 10?", "should this item of the pattern get a hole?".

## Single booleans

- `boolean` passes a `true` or `false` through unchanged, so a value can be set once in Rete or Blockly, named and reused.
- `not` flips a boolean, and `notList` flips every boolean in a list.

## Comparing values

`compare` compares `first` with `second` and gives a boolean. `operator` picks the comparison:

- `<`, `<=`, `>` and `>=`;
- `==` and `!=`, which convert types first, so `5 == "5"` is true;
- `===` and `!==`, which do not, so `5 === "5"` is false.

## Patterns from numbers

These turn a list of numbers into a list of booleans, one each, and are the usual way to decide which items of a pattern get a feature. Feed them distances, noise values or parameters along a curve, then pick items with `bitbybit.lists.getByPattern`.

- `thresholdBooleanList` gives true for a number below `threshold` and false at or above it.
- `thresholdGapsBooleanList` gives true for a number inside any of the ranges in `gapThresholds`, each `[min, max]` with both ends included.
- `twoThresholdRandomGradient` blends between two thresholds: below `thresholdTotalTrue` a number is always true, above `thresholdTotalFalse` always false, and in between the chance of true falls in `nrLevels` steps, so the pattern fades out instead of switching sharply.

`thresholdBooleanList` and `thresholdGapsBooleanList` take `inverse`, which flips every result.

`randomBooleans` draws `length` random booleans with no numbers as input, each true with probability `trueThreshold`. It and `twoThresholdRandomGradient` give a different result on every run.

## Letting values through

- `valueGate` gives `value` when `boolean` is true and `undefined` when it is false. Use it to switch a branch of a script on or off.
- `firstDefinedValueGate` gives `value1` when it is defined and `value2` otherwise, so the second acts as a fallback. Only `undefined` counts as missing; `null`, `0` and `false` pass.

## Every function

{/* api:logic:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`boolean`](https://docs.bitbybit.dev/classes/Bit.Logic#boolean) | Passes a boolean through unchanged, so a value can be given a name and reused. |
| [`compare`](https://docs.bitbybit.dev/classes/Bit.Logic#compare) | Compares two values with an operator: less, less or equal, greater, greater or equal, equal or not equal, in the loose (`==`) or strict (`===`) form. |
| [`firstDefinedValueGate`](https://docs.bitbybit.dev/classes/Bit.Logic#firstDefinedValueGate) | Picks the first of two values that is defined, so the second acts as a fallback. |
| [`not`](https://docs.bitbybit.dev/classes/Bit.Logic#not) | Flips a boolean: true becomes false and false becomes true. |
| [`notList`](https://docs.bitbybit.dev/classes/Bit.Logic#notList) | Flips every boolean in a list. |
| [`randomBooleans`](https://docs.bitbybit.dev/classes/Bit.Logic#randomBooleans) | Draws a list of random booleans, each true with a given probability. |
| [`thresholdBooleanList`](https://docs.bitbybit.dev/classes/Bit.Logic#thresholdBooleanList) | Turns numbers into booleans: true below the threshold, false at or above it. |
| [`thresholdGapsBooleanList`](https://docs.bitbybit.dev/classes/Bit.Logic#thresholdGapsBooleanList) | Turns numbers into booleans: true when the number falls inside any of the given ranges, false otherwise. |
| [`twoThresholdRandomGradient`](https://docs.bitbybit.dev/classes/Bit.Logic#twoThresholdRandomGradient) | Turns numbers into booleans with a random blend between two thresholds. |
| [`valueGate`](https://docs.bitbybit.dev/classes/Bit.Logic#valueGate) | Lets a value through when the boolean is true and gives undefined when it is false. |

{/* api:logic:end */}
