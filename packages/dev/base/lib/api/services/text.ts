import * as Inputs from "../inputs";
import * as Models from "../models";
import { defaultsVectorParams } from "../models/simplex";
import { Point } from "./point";

type Line = { width: number, height: number, chars: Models.Text.VectorCharData[] };

/**
 * Working with text: splitting, joining, searching, trimming, padding, changing case, regular
 * expressions and formatting with placeholders. `vectorChar` and `vectorText` turn text into line
 * paths drawn with a simple stroke font, so words can become geometry. Positions in text count from
 * 0.
 */
export class TextBitByBit {
    constructor(private readonly point: Point) {
    }

    /**
     * Passes a text through unchanged, so a value can be given a name and reused.
     *
     * Example: 'Hello World' -> 'Hello World'
     * @param inputs - The text
     * @returns The same text
     * @group create
     * @shortname text
     * @drawable false
     */
    create(inputs: Inputs.Text.TextDto): string {
        return inputs.text;
    }

    /**
     * Cuts a text into pieces wherever a separator occurs; the separator itself is dropped.
     *
     * Example: 'apple,banana,cherry' split by ',' -> ['apple', 'banana', 'cherry']
     * @param inputs - The text and the separator
     * @returns The pieces, in order
     * @group transform
     * @shortname split
     * @drawable false
     * @example
     * ```typescript
     * const parts = bitbybit.text.split({ text: "apple,banana,cherry", separator: "," });
     * ```
     */
    split(inputs: Inputs.Text.TextSplitDto): string[] {
        return inputs.text.split(inputs.separator);
    }

    /**
     * Replaces every occurrence of a search text with another text.
     *
     * Example: 'hello hello' replacing 'hello' with 'hi' -> 'hi hi'
     * @param inputs - The text, what to search for and what to put in its place
     * @returns The text with the replacements made
     * @group transform
     * @shortname replaceAll
     * @drawable false
     * @example
     * ```typescript
     * const greeting = bitbybit.text.replaceAll({ text: "hello hello", search: "hello", replaceWith: "hi" });
     * ```
     */
    replaceAll(inputs: Inputs.Text.TextReplaceDto): string {
        return inputs.text.split(inputs.search).join(inputs.replaceWith);
    }

    /**
     * Joins a list of texts into one, with a separator between neighbors.
     *
     * Example: ['apple', 'banana', 'cherry'] joined by ', ' -> 'apple, banana, cherry'
     * @param inputs - The texts and the separator
     * @returns The joined text
     * @group transform
     * @shortname join
     * @drawable false
     * @example
     * ```typescript
     * const line = bitbybit.text.join({ list: ["apple", "banana"], separator: ", " });
     * ```
     */
    join(inputs: Inputs.Text.TextJoinDto): string {
        return inputs.list.join(inputs.separator);
    }

    /**
     * Turns any value into text, the way JavaScript prints it.
     *
     * Example: 42 -> '42', [1, 2] -> '1,2'
     * @param inputs - The value
     * @returns The value as text
     * @group transform
     * @shortname to string
     * @drawable false
     */
    toString<T>(inputs: Inputs.Text.ToStringDto<T>): string {
        return (inputs.item as { toString(): string }).toString();
    }

    /**
     * Turns every item of a list into text, the way JavaScript prints it.
     *
     * Example: [1, 2.5, true] -> ['1', '2.5', 'true']
     * @param inputs - The list of values
     * @returns One text per item, in order
     * @group transform
     * @shortname to strings
     * @drawable false
     */
    toStringEach<T>(inputs: Inputs.Text.ToStringEachDto<T>): string[] {
        return inputs.list.map(i => (i as { toString(): string }).toString());
    }

    /**
     * Fills numbered placeholders in a text with values: `{0}` takes the first value, `{1}` the
     * second, and so on.
     *
     * A placeholder without a value is left as it is.
     * Example: 'Point: ({0}, {1})' with [10, 5] -> 'Point: (10, 5)'
     * @param inputs - The text with placeholders and the values to fill in
     * @returns The filled-in text
     * @group transform
     * @shortname format
     * @drawable false
     * @example
     * ```typescript
     * const label = bitbybit.text.format({ text: "Point: ({0}, {1})", values: ["10", "5"] });
     * ```
     */
    format(inputs: Inputs.Text.TextFormatDto): string {
        return inputs.text.replace(/{(\d+)}/g, (match, number) => {
            return typeof inputs.values[number] !== "undefined" ? inputs.values[number] : match;
        });
    }

    /**
     * Tells whether a text contains a search text.
     *
     * Example: 'hello world' includes 'world' -> true
     * @param inputs - The text and what to look for
     * @returns True when the search text occurs in it
     * @group query
     * @shortname includes
     * @drawable false
     * @example
     * ```typescript
     * const has = bitbybit.text.includes({ text: "hello world", search: "world" });
     * ```
     */
    includes(inputs: Inputs.Text.TextSearchDto): boolean {
        return inputs.text.includes(inputs.search);
    }

    /**
     * Tells whether a text begins with a search text.
     *
     * Example: 'hello world' starts with 'hello' -> true
     * @param inputs - The text and what to look for at its start
     * @returns True when the text begins with it
     * @group query
     * @shortname starts with
     * @drawable false
     * @example
     * ```typescript
     * const starts = bitbybit.text.startsWith({ text: "hello world", search: "hello" });
     * ```
     */
    startsWith(inputs: Inputs.Text.TextSearchDto): boolean {
        return inputs.text.startsWith(inputs.search);
    }

    /**
     * Tells whether a text ends with a search text.
     *
     * Example: 'hello world' ends with 'world' -> true
     * @param inputs - The text and what to look for at its end
     * @returns True when the text ends with it
     * @group query
     * @shortname ends with
     * @drawable false
     * @example
     * ```typescript
     * const ends = bitbybit.text.endsWith({ text: "hello world", search: "world" });
     * ```
     */
    endsWith(inputs: Inputs.Text.TextSearchDto): boolean {
        return inputs.text.endsWith(inputs.search);
    }

    /**
     * Finds where a search text first occurs, counting characters from 0, or -1 when it does not
     * occur.
     *
     * Example: 'hello world' finding 'world' -> 6
     * @param inputs - The text and what to look for
     * @returns The position of the first occurrence, or -1
     * @group query
     * @shortname index of
     * @drawable false
     * @example
     * ```typescript
     * const at = bitbybit.text.indexOf({ text: "hello world", search: "world" });
     * ```
     */
    indexOf(inputs: Inputs.Text.TextSearchDto): number {
        return inputs.text.indexOf(inputs.search);
    }

    /**
     * Finds where a search text last occurs, counting characters from 0, or -1 when it does not
     * occur.
     *
     * Example: 'hello world hello' finding 'hello' -> 12
     * @param inputs - The text and what to look for
     * @returns The position of the last occurrence, or -1
     * @group query
     * @shortname last index of
     * @drawable false
     * @example
     * ```typescript
     * const at = bitbybit.text.lastIndexOf({ text: "hello world hello", search: "hello" });
     * ```
     */
    lastIndexOf(inputs: Inputs.Text.TextSearchDto): number {
        return inputs.text.lastIndexOf(inputs.search);
    }

    /**
     * Takes the characters from a start position up to, but not including, an end position.
     *
     * A start larger than the end swaps the two, and negative positions count as 0.
     * Example: 'hello world' from 0 to 5 -> 'hello'
     * @param inputs - The text and the start and end positions
     * @returns The characters in that range
     * @group transform
     * @shortname substring
     * @drawable false
     * @example
     * ```typescript
     * const word = bitbybit.text.substring({ text: "hello world", start: 0, end: 5 });
     * ```
     */
    substring(inputs: Inputs.Text.TextSubstringDto): string {
        return inputs.text.substring(inputs.start, inputs.end);
    }

    /**
     * Takes the characters from a start position up to, but not including, an end position.
     *
     * Unlike `substring`, a negative position counts from the end of the text.
     * Example: 'hello world' from 0 to 5 -> 'hello'; from -5 -> 'world'
     * @param inputs - The text and the start and end positions
     * @returns The characters in that range
     * @group transform
     * @shortname slice
     * @drawable false
     * @example
     * ```typescript
     * const tail = bitbybit.text.slice({ text: "hello world", start: 6, end: 11 });
     * ```
     */
    slice(inputs: Inputs.Text.TextSubstringDto): string {
        return inputs.text.slice(inputs.start, inputs.end);
    }

    /**
     * Reads the character at a position, counting from 0.
     *
     * Example: 'hello' at 1 -> 'e'
     * @param inputs - The text and the position
     * @returns The character, or an empty text when the position is outside the text
     * @group query
     * @shortname char at
     * @drawable false
     * @example
     * ```typescript
     * const second = bitbybit.text.charAt({ text: "hello", index: 1 });
     * ```
     */
    charAt(inputs: Inputs.Text.TextIndexDto): string {
        return inputs.text.charAt(inputs.index);
    }

    /**
     * Removes spaces, tabs and line breaks from both ends of a text.
     *
     * Example: ' hello ' -> 'hello'
     * @param inputs - The text
     * @returns The trimmed text
     * @group transform
     * @shortname trim
     * @drawable false
     */
    trim(inputs: Inputs.Text.TextDto): string {
        return inputs.text.trim();
    }

    /**
     * Removes spaces, tabs and line breaks from the start of a text.
     *
     * Example: ' hello ' -> 'hello '
     * @param inputs - The text
     * @returns The text without leading whitespace
     * @group transform
     * @shortname trim start
     * @drawable false
     */
    trimStart(inputs: Inputs.Text.TextDto): string {
        return inputs.text.trimStart();
    }

    /**
     * Removes spaces, tabs and line breaks from the end of a text.
     *
     * Example: ' hello ' -> ' hello'
     * @param inputs - The text
     * @returns The text without trailing whitespace
     * @group transform
     * @shortname trim end
     * @drawable false
     */
    trimEnd(inputs: Inputs.Text.TextDto): string {
        return inputs.text.trimEnd();
    }

    /**
     * Adds a filler text in front until the text reaches a length; a text already that long is left
     * alone.
     *
     * Example: 'x' to length 3 with 'a' -> 'aax'
     * @param inputs - The text, the length to reach and the filler
     * @returns The padded text
     * @group transform
     * @shortname pad start
     * @drawable false
     * @example
     * ```typescript
     * const padded = bitbybit.text.padStart({ text: "7", length: 3, padString: "0" });
     * ```
     */
    padStart(inputs: Inputs.Text.TextPadDto): string {
        return inputs.text.padStart(inputs.length, inputs.padString);
    }

    /**
     * Adds a filler text behind until the text reaches a length; a text already that long is left
     * alone.
     *
     * Example: 'x' to length 3 with 'a' -> 'xaa'
     * @param inputs - The text, the length to reach and the filler
     * @returns The padded text
     * @group transform
     * @shortname pad end
     * @drawable false
     * @example
     * ```typescript
     * const padded = bitbybit.text.padEnd({ text: "x", length: 3, padString: "a" });
     * ```
     */
    padEnd(inputs: Inputs.Text.TextPadDto): string {
        return inputs.text.padEnd(inputs.length, inputs.padString);
    }

    /**
     * Turns every letter into a capital.
     *
     * Example: 'hello' -> 'HELLO'
     * @param inputs - The text
     * @returns The text in capitals
     * @group transform
     * @shortname to upper case
     * @drawable false
     */
    toUpperCase(inputs: Inputs.Text.TextDto): string {
        return inputs.text.toUpperCase();
    }

    /**
     * Turns every letter into lower case.
     *
     * Example: 'HELLO' -> 'hello'
     * @param inputs - The text
     * @returns The text in lower case
     * @group transform
     * @shortname to lower case
     * @drawable false
     */
    toLowerCase(inputs: Inputs.Text.TextDto): string {
        return inputs.text.toLowerCase();
    }

    /**
     * Turns the first character into a capital and leaves the rest as it is.
     *
     * Example: 'hello world' -> 'Hello world'
     * @param inputs - The text
     * @returns The text with its first character capitalized
     * @group transform
     * @shortname capitalize first
     * @drawable false
     */
    toUpperCaseFirst(inputs: Inputs.Text.TextDto): string {
        if (!inputs.text) return inputs.text;
        return inputs.text.charAt(0).toUpperCase() + inputs.text.slice(1);
    }

    /**
     * Turns the first character into lower case and leaves the rest as it is.
     *
     * Example: 'Hello World' -> 'hello World'
     * @param inputs - The text
     * @returns The text with its first character in lower case
     * @group transform
     * @shortname uncapitalize first
     * @drawable false
     */
    toLowerCaseFirst(inputs: Inputs.Text.TextDto): string {
        if (!inputs.text) return inputs.text;
        return inputs.text.charAt(0).toLowerCase() + inputs.text.slice(1);
    }

    /**
     * Repeats a text a number of times, end to end.
     *
     * Example: 'ha' three times -> 'hahaha'
     * @param inputs - The text and how many times to repeat it
     * @returns The repeated text
     * @group transform
     * @shortname repeat
     * @drawable false
     * @example
     * ```typescript
     * const laugh = bitbybit.text.repeat({ text: "ha", count: 3 });
     * ```
     */
    repeat(inputs: Inputs.Text.TextRepeatDto): string {
        return inputs.text.repeat(inputs.count);
    }

    /**
     * Reverses the order of the characters.
     *
     * Example: 'hello' -> 'olleh'
     * @param inputs - The text
     * @returns The reversed text
     * @group transform
     * @shortname reverse
     * @drawable false
     */
    reverse(inputs: Inputs.Text.TextDto): string {
        return inputs.text.split("").reverse().join("");
    }

    /**
     * Counts the characters in a text.
     *
     * Example: 'hello' -> 5
     * @param inputs - The text
     * @returns The number of characters
     * @group query
     * @shortname length
     * @drawable false
     */
    length(inputs: Inputs.Text.TextDto): number {
        return inputs.text.length;
    }

    /**
     * Tells whether a text is empty or holds only whitespace.
     *
     * Example: ' ' -> true, 'a' -> false
     * @param inputs - The text
     * @returns True when there is nothing but whitespace
     * @group query
     * @shortname is empty
     * @drawable false
     */
    isEmpty(inputs: Inputs.Text.TextDto): boolean {
        return !inputs.text || inputs.text.trim().length === 0;
    }

    /**
     * Joins several texts into one with nothing between them.
     *
     * Example: ['hello', ' ', 'world'] -> 'hello world'
     * @param inputs - The texts to join
     * @returns The joined text
     * @group transform
     * @shortname concat
     * @drawable false
     * @example
     * ```typescript
     * const sentence = bitbybit.text.concat({ texts: ["hello", " ", "world"] });
     * ```
     */
    concat(inputs: Inputs.Text.TextConcatDto): string {
        return inputs.texts.join("");
    }

    /**
     * Tells whether a regular expression matches somewhere in a text.
     *
     * Example: 'hello123' against '[0-9]+' -> true
     * @param inputs - The text, the pattern and the flags
     * @returns True when the pattern matches
     * @group regex
     * @shortname test regex
     * @drawable false
     * @example
     * ```typescript
     * const hasDigits = bitbybit.text.regexTest({ text: "hello123", pattern: "[0-9]+", flags: "" });
     * ```
     */
    regexTest(inputs: Inputs.Text.TextRegexDto): boolean {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        return regex.test(inputs.text);
    }

    /**
     * Finds the parts of a text that a regular expression matches.
     *
     * With the `g` flag every match is listed; without it only the first match and its capture
     * groups. No match gives null.
     * Example: 'hello123world456' against '[0-9]+' with 'g' -> ['123', '456']
     * @param inputs - The text, the pattern and the flags
     * @returns The matches, or null when there are none
     * @group regex
     * @shortname regex match
     * @drawable false
     * @example
     * ```typescript
     * const numbers = bitbybit.text.regexMatch({ text: "hello123world456", pattern: "[0-9]+", flags: "g" });
     * ```
     */
    regexMatch(inputs: Inputs.Text.TextRegexDto): string[] | null {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        const result = inputs.text.match(regex);
        return result ? Array.from(result) : null;
    }

    /**
     * Replaces what a regular expression matches with another text.
     *
     * With the `g` flag every match is replaced; without it only the first.
     * Example: 'hello123world456' against '[0-9]+' with 'g', replaced by 'X' -> 'helloXworldX'
     * @param inputs - The text, the pattern, the flags and the replacement
     * @returns The text with the replacements made
     * @group regex
     * @shortname regex replace
     * @drawable false
     * @example
     * ```typescript
     * const clean = bitbybit.text.regexReplace({ text: "hello123world456", pattern: "[0-9]+", flags: "g", replaceWith: "X" });
     * ```
     */
    regexReplace(inputs: Inputs.Text.TextRegexReplaceDto): string {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        return inputs.text.replace(regex, inputs.replaceWith);
    }

    /**
     * Finds where a regular expression first matches, counting characters from 0, or -1 when it
     * does not match.
     *
     * Example: 'hello123' against '[0-9]+' -> 5
     * @param inputs - The text, the pattern and the flags
     * @returns The position of the first match, or -1
     * @group regex
     * @shortname regex search
     * @drawable false
     * @example
     * ```typescript
     * const at = bitbybit.text.regexSearch({ text: "hello123", pattern: "[0-9]+", flags: "" });
     * ```
     */
    regexSearch(inputs: Inputs.Text.TextRegexDto): number {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        return inputs.text.search(regex);
    }

    /**
     * Cuts a text into pieces wherever a regular expression matches; the matches themselves are
     * dropped.
     *
     * Example: 'a1b2c3' split by '[0-9]+' -> ['a', 'b', 'c', '']
     * @param inputs - The text, the pattern and the flags
     * @returns The pieces, in order
     * @group regex
     * @shortname regex split
     * @drawable false
     * @example
     * ```typescript
     * const letters = bitbybit.text.regexSplit({ text: "a1b2c3", pattern: "[0-9]+", flags: "" });
     * ```
     */
    regexSplit(inputs: Inputs.Text.TextRegexDto): string[] {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        return inputs.text.split(regex);
    }

    /**
     * Draws one character as line paths with a simple stroke font.
     *
     * The paths lie flat on the XZ plane, scaled so the character is `height` tall, and are
     * returned with the character's width and height. An unknown character is drawn as a question
     * mark.
     * Example: 'A' at height 10 -> the strokes of an A, 10 units tall
     * @param inputs - The character, its height and its offsets
     * @returns The character's width, height and stroke paths as lists of points
     * @group vector
     * @shortname vector char
     * @drawable false
     * @example
     * ```typescript
     * const letter = bitbybit.text.vectorChar({ char: "A", height: 10, xOffset: 0, yOffset: 0, extrudeOffset: 0 });
     * ```
     */
    vectorChar(inputs: Inputs.Text.VectorCharDto): Models.Text.VectorCharData {
        const {
            xOffset, yOffset, font, input, height, extrudeOffset
        } = this.vectorParamsChar(inputs);
        let code = input.charCodeAt(0);
        if (!code || !font[code]) {
            code = 63;
        }
        const glyph = ([] as (number | undefined)[]).concat(font[code]);
        const ratio = (height - extrudeOffset) / font.height;
        const extrudeYOffset = (extrudeOffset / 2);
        const width = (glyph.shift() as number) * ratio;
        const paths: Inputs.Base.Point3[][] = [];
        let polyline: Inputs.Base.Point3[] = [];
        for (let i = 0, il = glyph.length; i < il; i += 2) {
            const gx = ratio * (glyph[i] as number) + xOffset;
            const gy = ratio * (glyph[i + 1] as number) + yOffset + extrudeYOffset;
            if (glyph[i] !== undefined) {
                polyline.push([gx, 0, gy]);
                continue;
            }
            paths.push(polyline);
            polyline = [];
            i--;
        }
        if (polyline.length) {
            paths.push(polyline);
        }
        return { width, height, paths };
    }

    /**
     * Draws a text, with line breaks, as line paths with a simple stroke font.
     *
     * Each line comes back as its characters with their paths, laid out flat on the XZ plane with
     * the given height, spacing and alignment; `centerOnOrigin` puts the middle of the block at the
     * origin.
     * Example: 'Hello' at height 10 -> five characters with their strokes
     * @param inputs - The text and how to lay it out
     * @returns One entry per line, each with its characters and their stroke paths
     * @group vector
     * @shortname vector text
     * @drawable false
     * @example
     * ```typescript
     * const lines = bitbybit.text.vectorText({
     *     text: "Hello\nWorld",
     *     height: 10,
     *     align: Bit.Inputs.Base.horizontalAlignEnum.center,
     *     centerOnOrigin: true,
     * });
     * ```
     */
    vectorText(inputs: Inputs.Text.VectorTextDto): Models.Text.VectorTextData[] {
        const {
            xOffset, yOffset, height, align, extrudeOffset, lineSpacing, letterSpacing
        } = Object.assign({}, defaultsVectorParams, inputs);

        const text = inputs.text;
        if (typeof text !== "string") throw new Error("text must be a string");

        const extraLetterSpacing = (height * letterSpacing);

        let maxWidth = 0;
        let line: Line = { width: 0, height: 0, chars: [] };
        let lines: Line[] = [];

        const pushLine = () => {
            maxWidth = Math.max(maxWidth, line.width);

            if (line.chars.length) lines.push(line);
            line = { width: 0, height: 0, chars: [] };
        };

        let x = xOffset;
        let y = yOffset;
        let vchar;
        const il = text.length;
        for (let i = 0; i < il; i++) {
            const character = text[i]!;
            if (character === "\n") {
                pushLine();

                x = xOffset;
                y -= height * lineSpacing;
                continue;
            }
            vchar = this.vectorChar({ xOffset: x, yOffset: y, height, extrudeOffset, char: character });

            const width = vchar.width + extraLetterSpacing;
            x += width;

            line.width += width;
            line.height = Math.max(line.height, vchar.height);
            if (character !== " ") {
                line.chars = line.chars.concat(vchar);
            }
        }
        if (line.chars.length) pushLine();

        lines = lines.map((line) => {
            const diff = maxWidth - line.width;
            if (align === Inputs.Base.horizontalAlignEnum.right) {
                return this.translateLine({ x: diff }, line);
            } else if (align === Inputs.Base.horizontalAlignEnum.center) {
                return this.translateLine({ x: diff / 2 }, line);
            } else {
                return line;
            }
        });

        if (inputs.centerOnOrigin) {
            const pointsFlat: Inputs.Base.Point3[] = [];

            lines.forEach((line) => {
                line.chars.forEach((vchar) => {
                    vchar.paths.forEach((path) => {
                        pointsFlat.push(...path);
                    });
                });
            });

            const bbox = this.point.boundingBoxOfPoints({
                points: pointsFlat,
            }) as Required<Inputs.Base.BoundingBox>;

            lines.forEach((line) => {
                line.chars.forEach((vchar) => {
                    vchar.paths = vchar.paths.map((path) => {
                        const pts = this.point.translatePoints({
                            points: path,
                            translation: [
                                -bbox.center[0],
                                -bbox.center[1],
                                -bbox.center[2],
                            ],
                        });
                        return pts;
                    });
                    return vchar;
                });
            });
        }

        return lines;
    }

    private vectorParamsChar(inputs: Inputs.Text.VectorCharDto): typeof defaultsVectorParams {
        const params = Object.assign({}, defaultsVectorParams, inputs);
        params.input = inputs.char || params.char;
        return params;
    }

    private translateLine(options: { x?: number, y?: number }, line: Line): Line {
        const { x, y } = Object.assign({ x: 0, y: 0 }, options);
        line.chars = line.chars.map((vchar) => {
            vchar.paths = vchar.paths.map((path) => {
                const pts = this.point.translatePoints({
                    points: path,
                    translation: [x, 0, y],
                });
                return pts;
            });
            return vchar;
        });
        return line;
    }
}
