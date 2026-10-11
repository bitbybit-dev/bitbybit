---
sidebar_position: 1
title: Text in Bitbybit
sidebar_label: Texts in Bitbybit
description: How bitbybit.text splits, joins, searches, trims, pads and changes the case of text, works with regular expressions and placeholders, and draws text as strokes of a simple font on the XZ plane.
topic: code.base.text
type: explanation
tags: [code, text]
---

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/text-icon.svg" 
  alt="Text category icon" 
  title="Text category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/text.ts)

`bitbybit.text` works with text, which is a plain JavaScript string such as `"Hello, World!"`. Every function gives a new text or value and leaves its input unchanged. Positions count from 0, and searches match exactly, including case.

## Making and converting text

- `create` passes a text through unchanged, so a value can be set once in Rete or Blockly, named and reused.
- `toString` turns any value into text the way JavaScript prints it, so `[1, 2]` becomes `"1,2"`; `toStringEach` does it for every item of a list.
- `format` fills numbered placeholders: in `"Point: ({0}, {1})"` with `[10, 5]`, `{0}` takes the first value and `{1}` the second, giving `"Point: (10, 5)"`. A placeholder without a value stays as it is.

## Cutting and joining

- `split` cuts a text wherever `separator` occurs and drops the separator: `"a,b,c"` gives `["a", "b", "c"]`.
- `join` puts a list of texts together with `separator` between neighbours, and `concat` joins texts with nothing between them.
- `substring` and `slice` take the characters from `start` up to, but not including, `end`; leave `end` out to take the rest. In `slice` a negative position counts from the end, so `slice` from -5 of `"hello world"` gives `"world"`.
- `charAt` reads the character at one position.

## Searching

- `includes`, `startsWith` and `endsWith` tell whether a text contains, begins with or ends with `search`.
- `indexOf` and `lastIndexOf` give the position of its first or last occurrence, or -1.
- `replaceAll` replaces every occurrence of `search`, taken literally, with `replaceWith`.

## Regular expressions

For patterns rather than fixed text, these take a regular expression as `pattern`, written as it would be between the slashes in JavaScript, such as `[0-9]+`, and its `flags` (default `g`):

- `regexTest` tells whether the pattern matches anywhere;
- `regexSearch` gives the position of the first match, or -1;
- `regexMatch` lists every match with the `g` flag, or the first match and its capture groups without it, and gives `null` when nothing matches;
- `regexReplace` replaces every match with the `g` flag, or only the first without it; `$1` in `replaceWith` refers to the first capture group;
- `regexSplit` cuts the text wherever the pattern matches.

## Tidying and shaping

- `trim`, `trimStart` and `trimEnd` remove spaces, tabs and line breaks from both ends, the start or the end.
- `padStart` and `padEnd` repeat `padString` in front or behind until the text is `length` long: `"7"` padded at the start to 3 with `"0"` gives `"007"`.
- `toUpperCase` and `toLowerCase` change every letter; `toUpperCaseFirst` and `toLowerCaseFirst` change only the first character.
- `repeat` writes a text `count` times end to end, and `reverse` reverses its characters.
- `length` counts the characters, and `isEmpty` tells whether a text is empty or holds only whitespace.

## Text as geometry

`vectorChar` and `vectorText` turn text into lines you can draw or build shapes from. They use a built-in stroke font: each character is drawn as the strokes of a pen, as open paths of points, not as closed outlines. The paths lie flat on the XZ plane (every point has Y = 0), so the text lies on the ground.

- `vectorChar` draws one character, scaled so a capital is `height` tall, and gives its `width`, `height` and `paths`. `xOffset` shifts it along X and `yOffset` along Z. A character the font does not have is drawn as a question mark.
- `vectorText` draws a whole text, with `\n` starting a new line. It gives one entry per line, each with its characters and their paths. `lineSpacing` (a multiple of the height, default 1.4) sets the distance between lines, `letterSpacing` adds space between characters, `align` lines up lines of different length at the left, center or right, and `centerOnOrigin` moves the middle of the block to the origin. Spaces take up room but produce no paths.

`extrudeOffset` takes a margin off the height, split above and below each character, so text that is later given thickness keeps its full size.

To show the text, draw the paths as polylines; to make solid letters, build wires from the paths and give them thickness with the CAD kernels.

## Every function

{/* api:text:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`charAt`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#charAt) | Reads the character at a position, counting from 0. |
| [`concat`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#concat) | Joins several texts into one with nothing between them. |
| [`create`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#create) | Passes a text through unchanged, so a value can be given a name and reused. |
| [`endsWith`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#endsWith) | Tells whether a text ends with a search text. |
| [`format`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#format) | Fills numbered placeholders in a text with values: `{0}` takes the first value, `{1}` the second, and so on. |
| [`includes`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#includes) | Tells whether a text contains a search text. |
| [`indexOf`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#indexOf) | Finds where a search text first occurs, counting characters from 0, or -1 when it does not occur. |
| [`isEmpty`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#isEmpty) | Tells whether a text is empty or holds only whitespace. |
| [`join`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#join) | Joins a list of texts into one, with a separator between neighbors. |
| [`lastIndexOf`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#lastIndexOf) | Finds where a search text last occurs, counting characters from 0, or -1 when it does not occur. |
| [`length`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#length) | Counts the characters in a text. |
| [`padEnd`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#padEnd) | Adds a filler text behind until the text reaches a length; a text already that long is left alone. |
| [`padStart`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#padStart) | Adds a filler text in front until the text reaches a length; a text already that long is left alone. |
| [`regexMatch`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#regexMatch) | Finds the parts of a text that a regular expression matches. |
| [`regexReplace`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#regexReplace) | Replaces what a regular expression matches with another text. |
| [`regexSearch`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#regexSearch) | Finds where a regular expression first matches, counting characters from 0, or -1 when it does not match. |
| [`regexSplit`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#regexSplit) | Cuts a text into pieces wherever a regular expression matches; the matches themselves are dropped. |
| [`regexTest`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#regexTest) | Tells whether a regular expression matches somewhere in a text. |
| [`repeat`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#repeat) | Repeats a text a number of times, end to end. |
| [`replaceAll`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#replaceAll) | Replaces every occurrence of a search text with another text. |
| [`reverse`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#reverse) | Reverses the order of the characters. |
| [`slice`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#slice) | Takes the characters from a start position up to, but not including, an end position. |
| [`split`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#split) | Cuts a text into pieces wherever a separator occurs; the separator itself is dropped. |
| [`startsWith`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#startsWith) | Tells whether a text begins with a search text. |
| [`substring`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#substring) | Takes the characters from a start position up to, but not including, an end position. |
| [`toLowerCase`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#toLowerCase) | Turns every letter into lower case. |
| [`toLowerCaseFirst`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#toLowerCaseFirst) | Turns the first character into lower case and leaves the rest as it is. |
| [`toString`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#toString) | Turns any value into text, the way JavaScript prints it. |
| [`toStringEach`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#toStringEach) | Turns every item of a list into text, the way JavaScript prints it. |
| [`toUpperCase`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#toUpperCase) | Turns every letter into a capital. |
| [`toUpperCaseFirst`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#toUpperCaseFirst) | Turns the first character into a capital and leaves the rest as it is. |
| [`trim`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#trim) | Removes spaces, tabs and line breaks from both ends of a text. |
| [`trimEnd`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#trimEnd) | Removes spaces, tabs and line breaks from the end of a text. |
| [`trimStart`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#trimStart) | Removes spaces, tabs and line breaks from the start of a text. |
| [`vectorChar`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#vectorChar) | Draws one character as line paths with a simple stroke font. |
| [`vectorText`](https://docs.bitbybit.dev/classes/Bit.TextBitByBit#vectorText) | Draws a text, with line breaks, as line paths with a simple stroke font. |

{/* api:text:end */}
