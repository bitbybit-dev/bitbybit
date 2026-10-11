---
sidebar_position: 1
title: Lists in Bitbybit
sidebar_label: Lists in Bitbybit
description: How bitbybit.lists reads, builds, edits, regroups and sorts lists of any kind of item, what the clone option does to your input, and how positions are counted from 0.
topic: code.base.lists
type: explanation
tags: [code, lists]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/lists-icon.svg" 
  alt="Lists category icon" 
  title="Lists category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/lists.ts)

`bitbybit.lists` reads, builds and reshapes lists. A list is a plain JavaScript array, so it can hold anything: numbers, texts, points, shapes, or other lists, as in `[1, 2, 3]`, `["apple", "banana"]` or `[[0,0,0], [1,1,1]]`.

## Two rules first

- **Positions count from 0**: index 0 is the first item.
- **`clone` keeps your input as it was.** Most functions take a `clone` option, on by default, that deep-copies the list (with `structuredClone`) before working on it. Switched off, the functions that add, remove, reverse, shuffle or sort change the list you pass in, which is faster on large data. Data with circular references cannot be copied, and cloning it throws. `removeAllItems` has no such option: it always empties the list it is given.

## Building lists

- `createEmptyList` gives `[]`.
- `repeat` gives a list that holds the same item `times` times.
- `repeatInPattern` repeats a list of items over and over until the result is `lengthLimit` long, so `[1, 2, 3]` to length 7 gives `[1, 2, 3, 1, 2, 3, 1]`.
- `concatenate` joins several lists end to end.

## Reading items

- `getItem` reads the item at an index; an index outside the list throws. `getFirstItem` and `getLastItem` read the ends and throw on an empty list.
- `getSubList` cuts out the items from `indexStart` up to, but not including, `indexEnd`.
- `getNthItem` keeps every `nth` item: an item is kept when its index plus `offset` divides evenly by `nth`. `getByPattern` keeps the items where a repeating true/false pattern says true.
- `randomGetThreshold` keeps each item with probability `threshold`, so the result differs on every call.
- `includes` tells whether an item is in the list and `findIndex` gives its first index, or -1. Both compare by identity: an object is found only if the very same object is in the list.

Here `getNthItem` keeps every second of two hundred spiral points, and a smooth curve passes through the points kept:

{/* example:every-second-point:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"spiral\":{\"id\":\"spiral\",\"name\":\"bitbybit.point.spiral\",\"customName\":\"spiral\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"phi\":0.9,\"numberPoints\":200,\"widening\":3,\"radius\":6,\"factor\":1},\"inputs\":{},\"position\":[40,40]},\"kept\":{\"id\":\"kept\",\"name\":\"bitbybit.lists.getNthItem\",\"customName\":\"get nth item\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"nth\":2,\"offset\":0,\"clone\":true},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"spiral\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"curve\":{\"id\":\"curve\",\"name\":\"bitbybit.occt.shapes.wire.interpolatePoints\",\"customName\":\"interpolate points\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"periodic\":false,\"tolerance\":1e-7,\"parametrization\":\"chordLength\"},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"kept\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]}},\"modules\":{}}","type":"rete"}}
  title="Every second point of a spiral in Rete"
  description="Two hundred points on a spiral, every second of them kept with a list function, and a smooth curve through the points kept."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"points\">points</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"points\">points</field><value name=\"VALUE\"><block type=\"bitbybit.point.spiral\"><value name=\"Phi\"><block type=\"math_number\"><field name=\"NUM\">0.9</field></block></value><value name=\"NumberPoints\"><block type=\"math_number\"><field name=\"NUM\">200</field></block></value><value name=\"Widening\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Factor\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"points\">points</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.interpolatePoints\"><value name=\"Points\"><block type=\"bitbybit.lists.getNthItem\"><value name=\"List\"><block type=\"variables_get\"><field name=\"VAR\" id=\"points\">points</field></block></value><value name=\"Nth\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Offset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Periodic\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Tolerance\"><block type=\"math_number\"><field name=\"NUM\">1e-7</field></block></value><value name=\"Parametrization\"><block type=\"bitbybit.occt.enums.bSplineParametrizationEnum\"><field name=\"bitbybit.occt.enums.bSplineParametrizationEnum\">'chordLength'</field></block></value></block></value></block></next></block></next></block></xml>","type":"blockly"}}
  title="Every second point of a spiral in Blockly"
  description="Two hundred points on a spiral, every second of them kept with a list function, and a smooth curve through the points kept."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const points = bitbybit.point.spiral({ numberPoints: 200, radius: 6, phi: 0.9, widening: 3, factor: 1 });\nconst kept = bitbybit.lists.getNthItem({ list: points, nth: 2, offset: 0, clone: true });\nconst curve = await bitbybit.occt.shapes.wire.interpolatePoints({ points: kept });\n\nawait bitbybit.draw.drawAnyAsync({ entity: points });\nawait bitbybit.draw.drawAnyAsync({ entity: curve });","type":"typescript"}}
  title="Every second point of a spiral in TypeScript"
  description="Two hundred points on a spiral, every second of them kept with a list function, and a smooth curve through the points kept."
/>

</TabItem>
</Tabs>

{/* example:every-second-point:end */}

## Measuring

- `listLength` counts the items.
- `getListDepth` gives how deeply lists are nested: `[1, 2]` is 1, `[[1, 2], [3]]` is 2.
- `getLongestListLength` gives the length of the longest of several lists.

## Adding and removing items

- `addItem` adds an item at the end, `prependItem` at the start, and `addItemFirstLast` at whichever end `position` names.
- `addItemAtIndex` inserts an item at an index. `addItemAtIndexes` inserts the same item at several indexes, and `addItemsAtIndexes` inserts one item per index; both count the indexes on the list as it was before any insertion. `addItemsAtIndexes` throws unless there is one index per item, in ascending order.
- `removeItemAtIndex` removes the item at an index, and `removeItemAtIndexFromEnd` counts from the end, where 0 is the last item. `removeItemsAtIndexes` removes several, all counted on the original list. `removeFirstItem` and `removeLastItem` remove the ends. Indexes outside the list are ignored.
- `removeNthItem` removes the items `getNthItem` would keep, and `randomRemoveThreshold` drops each item with probability `threshold`.
- `removeAllItems` empties the list in place.

## Removing duplicates

- `removeDuplicates` keeps the first occurrence of each item, comparing by identity, so two equal-looking objects both stay.
- `removeDuplicateNumbers` does the same for numbers, and `removeDuplicateNumbersTolerance` also counts numbers closer than `tolerance` (default `1e-7`) as the same, so floating-point noise does not leave near copies.

## Reshaping

- `reverse` reverses the order; `shuffle` puts the items in a random order.
- `groupNth` splits the list into groups of `nrElements`. Items left over at the end are dropped unless `keepRemainder` is on.
- `flipLists` turns a list of lists on its side, so rows become columns: `[[0, 1, 2], [3, 4, 5]]` gives `[[0, 3], [1, 4], [2, 5]]`. The inner lists must all have the same length, or it throws.
- `mergeElementsOfLists` regroups lists by position, the first items together, then the second, and so on. Unlike `flipLists` it accepts lists of different lengths. `level` says how deep inside each list to regroup, and the result keeps that much nesting around the groups.
- `interleave` weaves lists into one, taking the first item of each, then the second of each: `[[0, 1, 2], [3, 4, 5]]` gives `[0, 3, 1, 4, 2, 5]`. A shorter list drops out once it runs dry.

## Sorting

- `sortNumber` sorts numbers, lowest first when `orderAsc` is on (the default) or highest first.
- `sortTexts` sorts texts by character code, so capitals come before lower case: `["b", "a", "C"]` gives `["C", "a", "b"]`.
- `sortByPropValue` sorts objects by the number held in their `property`.

## Every function

{/* api:lists:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`addItem`](https://docs.bitbybit.dev/classes/Bit.Lists#addItem) | Adds an item at the end of the list. |
| [`addItemAtIndex`](https://docs.bitbybit.dev/classes/Bit.Lists#addItemAtIndex) | Inserts an item at a position; the items from that position on shift up by one. |
| [`addItemAtIndexes`](https://docs.bitbybit.dev/classes/Bit.Lists#addItemAtIndexes) | Inserts the same item at several positions of the original list. |
| [`addItemFirstLast`](https://docs.bitbybit.dev/classes/Bit.Lists#addItemFirstLast) | Adds an item at the start or at the end of the list, as chosen. |
| [`addItemsAtIndexes`](https://docs.bitbybit.dev/classes/Bit.Lists#addItemsAtIndexes) | Inserts several items, the first at the first index, the second at the second, and so on, all counted on the original list. |
| [`concatenate`](https://docs.bitbybit.dev/classes/Bit.Lists#concatenate) | Joins several lists into one, end to end. |
| [`createEmptyList`](https://docs.bitbybit.dev/classes/Bit.Lists#createEmptyList) | Makes a new list with nothing in it. |
| [`findIndex`](https://docs.bitbybit.dev/classes/Bit.Lists#findIndex) | Finds the position of the first occurrence of an item, or -1 when it is not in the list. |
| [`flipLists`](https://docs.bitbybit.dev/classes/Bit.Lists#flipLists) | Turns a list of lists on its side: rows become columns and columns become rows. |
| [`getByPattern`](https://docs.bitbybit.dev/classes/Bit.Lists#getByPattern) | Keeps the items where a repeating true/false pattern says true and drops the others. |
| [`getFirstItem`](https://docs.bitbybit.dev/classes/Bit.Lists#getFirstItem) | Reads the first item of the list. |
| [`getItem`](https://docs.bitbybit.dev/classes/Bit.Lists#getItem) | Reads the item at a position in the list, counting from 0. |
| [`getLastItem`](https://docs.bitbybit.dev/classes/Bit.Lists#getLastItem) | Reads the last item of the list. |
| [`getListDepth`](https://docs.bitbybit.dev/classes/Bit.Lists#getListDepth) | Measures how deeply lists are nested inside the list. |
| [`getLongestListLength`](https://docs.bitbybit.dev/classes/Bit.Lists#getLongestListLength) | Measures the longest list among several. |
| [`getNthItem`](https://docs.bitbybit.dev/classes/Bit.Lists#getNthItem) | Keeps every nth item, starting from an offset. |
| [`getSubList`](https://docs.bitbybit.dev/classes/Bit.Lists#getSubList) | Cuts out the items from a start index up to, but not including, an end index. |
| [`groupNth`](https://docs.bitbybit.dev/classes/Bit.Lists#groupNth) | Splits the list into groups of n items. |
| [`includes`](https://docs.bitbybit.dev/classes/Bit.Lists#includes) | Tells whether an item is in the list. |
| [`interleave`](https://docs.bitbybit.dev/classes/Bit.Lists#interleave) | Weaves several lists into one by taking the first item of each in turn, then the second of each, and so on. |
| [`listLength`](https://docs.bitbybit.dev/classes/Bit.Lists#listLength) | Counts the items in the list. |
| [`mergeElementsOfLists`](https://docs.bitbybit.dev/classes/Bit.Lists#mergeElementsOfLists) | Regroups nested lists by position: the first items of every list go together, then the second items, and so on. |
| [`prependItem`](https://docs.bitbybit.dev/classes/Bit.Lists#prependItem) | Adds an item at the start of the list. |
| [`randomGetThreshold`](https://docs.bitbybit.dev/classes/Bit.Lists#randomGetThreshold) | Keeps each item of the list with a given probability and drops the rest, so the result differs on every call. |
| [`randomRemoveThreshold`](https://docs.bitbybit.dev/classes/Bit.Lists#randomRemoveThreshold) | Drops each item of the list with a given probability and keeps the rest, so the result differs on every call. |
| [`removeAllItems`](https://docs.bitbybit.dev/classes/Bit.Lists#removeAllItems) | Empties the list it is given, in place: the same array comes back with no items in it. |
| [`removeDuplicateNumbers`](https://docs.bitbybit.dev/classes/Bit.Lists#removeDuplicateNumbers) | Removes repeated numbers, keeping the first occurrence of each. |
| [`removeDuplicateNumbersTolerance`](https://docs.bitbybit.dev/classes/Bit.Lists#removeDuplicateNumbersTolerance) | Removes numbers that are within a tolerance of one already kept, so values that differ only by floating-point noise count as the same. |
| [`removeDuplicates`](https://docs.bitbybit.dev/classes/Bit.Lists#removeDuplicates) | Removes repeated items of any kind, keeping the first occurrence of each. |
| [`removeFirstItem`](https://docs.bitbybit.dev/classes/Bit.Lists#removeFirstItem) | Removes the first item. |
| [`removeItemAtIndex`](https://docs.bitbybit.dev/classes/Bit.Lists#removeItemAtIndex) | Removes the item at a position. |
| [`removeItemAtIndexFromEnd`](https://docs.bitbybit.dev/classes/Bit.Lists#removeItemAtIndexFromEnd) | Removes an item counted from the end: index 0 is the last item, 1 the one before it. |
| [`removeItemsAtIndexes`](https://docs.bitbybit.dev/classes/Bit.Lists#removeItemsAtIndexes) | Removes the items at several positions, all counted on the original list. |
| [`removeLastItem`](https://docs.bitbybit.dev/classes/Bit.Lists#removeLastItem) | Removes the last item. |
| [`removeNthItem`](https://docs.bitbybit.dev/classes/Bit.Lists#removeNthItem) | Removes every nth item, starting from an offset. |
| [`repeat`](https://docs.bitbybit.dev/classes/Bit.Lists#repeat) | Makes a list that holds the same item a number of times. |
| [`repeatInPattern`](https://docs.bitbybit.dev/classes/Bit.Lists#repeatInPattern) | Repeats a pattern of items over and over until the list reaches a given length. |
| [`reverse`](https://docs.bitbybit.dev/classes/Bit.Lists#reverse) | Reverses the order of the items. |
| [`shuffle`](https://docs.bitbybit.dev/classes/Bit.Lists#shuffle) | Puts the items in a random order, different on every call. |
| [`sortByPropValue`](https://docs.bitbybit.dev/classes/Bit.Lists#sortByPropValue) | Sorts objects by the number held in one of their properties. |
| [`sortNumber`](https://docs.bitbybit.dev/classes/Bit.Lists#sortNumber) | Sorts numbers from lowest to highest, or from highest to lowest. |
| [`sortTexts`](https://docs.bitbybit.dev/classes/Bit.Lists#sortTexts) | Sorts texts alphabetically, from A to Z or from Z to A. |

{/* api:lists:end */}
