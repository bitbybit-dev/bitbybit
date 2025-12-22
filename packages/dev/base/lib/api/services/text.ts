import * as Inputs from "../inputs";
import * as Models from "../models";
import { defaultsVectorParams } from "../models/simplex";
import { Point } from "./point";

/**
 * Contains various text methods.
 */
export class TextBitByBit {
    constructor(private readonly point: Point) {
    }

    /**
     * Creates and returns a text string (pass-through for text input).
     * Example: text='Hello World' → 'Hello World'
     * @param inputs a text
     * @returns text
     * @group create
     * @shortname text
     * @drawable false
     */
    create(inputs: Inputs.Text.TextDto): string {
        return inputs.text;
    }

    /**
    * Splits text into multiple pieces using a separator string.
    * Example: text='apple,banana,cherry', separator=',' → ['apple', 'banana', 'cherry']
    * @param inputs a text
    * @returns text
    * @group transform
    * @shortname split
    * @drawable false
    */
    split(inputs: Inputs.Text.TextSplitDto): string[] {
        return inputs.text.split(inputs.separator);
    }

    /**
    * Replaces all occurrences of a search string with a replacement string.
    * Example: text='hello hello', search='hello', replaceWith='hi' → 'hi hi'
    * @param inputs a text
    * @returns text
    * @group transform
    * @shortname replaceAll
    * @drawable false
    */
    replaceAll(inputs: Inputs.Text.TextReplaceDto): string {
        return inputs.text.split(inputs.search).join(inputs.replaceWith);
    }

    /**
    * Joins multiple items into a single text string using a separator.
    * Example: list=['apple', 'banana', 'cherry'], separator=', ' → 'apple, banana, cherry'
    * @param inputs a list of items
    * @returns text
    * @group transform
    * @shortname join
    * @drawable false
    */
    join(inputs: Inputs.Text.TextJoinDto): string {
        return inputs.list.join(inputs.separator);
    }

    /**
    * Transform any item to text
    * @param inputs any item
    * @returns text
    * @group transform
    * @shortname to string
    * @drawable false
    */
    toString<T>(inputs: Inputs.Text.ToStringDto<T>): string {
        return inputs.item.toString();
    }

    /**
    * Transform each item in list to text
    * @param inputs list of items
    * @returns texts
    * @group transform
    * @shortname to strings
    * @drawable false
    */
    toStringEach<T>(inputs: Inputs.Text.ToStringEachDto<T>): string[] {
        return inputs.list.map(i => i.toString());
    }

    /**
     * Formats text with placeholder values using {0}, {1}, etc. syntax.
     * Example: text='Point: ({0}, {1})', values=[10, 5] → 'Point: (10, 5)'
     * @param inputs a text and values
     * @returns formatted text
     * @group transform
     * @shortname format
     * @drawable false
     */
    format(inputs: Inputs.Text.TextFormatDto): string {
        return inputs.text.replace(/{(\d+)}/g, (match, number) => {
            return typeof inputs.values[number] !== "undefined" ? inputs.values[number] : match;
        });
    }

    /**
     * Checks if text contains a search string.
     * Example: text='hello world', search='world' → true
     * @param inputs a text and search string
     * @returns boolean
     * @group query
     * @shortname includes
     * @drawable false
     */
    includes(inputs: Inputs.Text.TextSearchDto): boolean {
        return inputs.text.includes(inputs.search);
    }

    /**
     * Checks if text starts with a search string.
     * Example: text='hello world', search='hello' → true
     * @param inputs a text and search string
     * @returns boolean
     * @group query
     * @shortname starts with
     * @drawable false
     */
    startsWith(inputs: Inputs.Text.TextSearchDto): boolean {
        return inputs.text.startsWith(inputs.search);
    }

    /**
     * Checks if text ends with a search string.
     * Example: text='hello world', search='world' → true
     * @param inputs a text and search string
     * @returns boolean
     * @group query
     * @shortname ends with
     * @drawable false
     */
    endsWith(inputs: Inputs.Text.TextSearchDto): boolean {
        return inputs.text.endsWith(inputs.search);
    }

    /**
     * Returns the index of the first occurrence of a search string.
     * Example: text='hello world', search='world' → 6
     * @param inputs a text and search string
     * @returns index or -1 if not found
     * @group query
     * @shortname index of
     * @drawable false
     */
    indexOf(inputs: Inputs.Text.TextSearchDto): number {
        return inputs.text.indexOf(inputs.search);
    }

    /**
     * Returns the index of the last occurrence of a search string.
     * Example: text='hello world hello', search='hello' → 12
     * @param inputs a text and search string
     * @returns index or -1 if not found
     * @group query
     * @shortname last index of
     * @drawable false
     */
    lastIndexOf(inputs: Inputs.Text.TextSearchDto): number {
        return inputs.text.lastIndexOf(inputs.search);
    }

    /**
     * Extracts a section of text between two indices.
     * Example: text='hello world', start=0, end=5 → 'hello'
     * @param inputs a text, start and end indices
     * @returns extracted text
     * @group transform
     * @shortname substring
     * @drawable false
     */
    substring(inputs: Inputs.Text.TextSubstringDto): string {
        return inputs.text.substring(inputs.start, inputs.end);
    }

    /**
     * Extracts a section of text and returns a new string.
     * Example: text='hello world', start=0, end=5 → 'hello'
     * @param inputs a text, start and end indices
     * @returns extracted text
     * @group transform
     * @shortname slice
     * @drawable false
     */
    slice(inputs: Inputs.Text.TextSubstringDto): string {
        return inputs.text.slice(inputs.start, inputs.end);
    }

    /**
     * Returns the character at the specified index.
     * Example: text='hello', index=1 → 'e'
     * @param inputs a text and index
     * @returns character
     * @group query
     * @shortname char at
     * @drawable false
     */
    charAt(inputs: Inputs.Text.TextIndexDto): string {
        return inputs.text.charAt(inputs.index);
    }

    /**
     * Removes whitespace from both ends of text.
     * Example: text='  hello  ' → 'hello'
     * @param inputs a text
     * @returns trimmed text
     * @group transform
     * @shortname trim
     * @drawable false
     */
    trim(inputs: Inputs.Text.TextDto): string {
        return inputs.text.trim();
    }

    /**
     * Removes whitespace from the start of text.
     * Example: text='  hello  ' → 'hello  '
     * @param inputs a text
     * @returns trimmed text
     * @group transform
     * @shortname trim start
     * @drawable false
     */
    trimStart(inputs: Inputs.Text.TextDto): string {
        return inputs.text.trimStart();
    }

    /**
     * Removes whitespace from the end of text.
     * Example: text='  hello  ' → '  hello'
     * @param inputs a text
     * @returns trimmed text
     * @group transform
     * @shortname trim end
     * @drawable false
     */
    trimEnd(inputs: Inputs.Text.TextDto): string {
        return inputs.text.trimEnd();
    }

    /**
     * Pads text from the start to reach target length.
     * Example: text='5', length=3, padString='0' → '005'
     * @param inputs a text, target length and pad string
     * @returns padded text
     * @group transform
     * @shortname pad start
     * @drawable false
     */
    padStart(inputs: Inputs.Text.TextPadDto): string {
        return inputs.text.padStart(inputs.length, inputs.padString);
    }

    /**
     * Pads text from the end to reach target length.
     * Example: text='5', length=3, padString='0' → '500'
     * @param inputs a text, target length and pad string
     * @returns padded text
     * @group transform
     * @shortname pad end
     * @drawable false
     */
    padEnd(inputs: Inputs.Text.TextPadDto): string {
        return inputs.text.padEnd(inputs.length, inputs.padString);
    }

    /**
     * Converts text to uppercase.
     * Example: text='hello' → 'HELLO'
     * @param inputs a text
     * @returns uppercase text
     * @group transform
     * @shortname to upper case
     * @drawable false
     */
    toUpperCase(inputs: Inputs.Text.TextDto): string {
        return inputs.text.toUpperCase();
    }

    /**
     * Converts text to lowercase.
     * Example: text='HELLO' → 'hello'
     * @param inputs a text
     * @returns lowercase text
     * @group transform
     * @shortname to lower case
     * @drawable false
     */
    toLowerCase(inputs: Inputs.Text.TextDto): string {
        return inputs.text.toLowerCase();
    }

    /**
     * Capitalizes the first character of text.
     * Example: text='hello world' → 'Hello world'
     * @param inputs a text
     * @returns text with first character uppercase
     * @group transform
     * @shortname capitalize first
     * @drawable false
     */
    toUpperCaseFirst(inputs: Inputs.Text.TextDto): string {
        if (!inputs.text) return inputs.text;
        return inputs.text.charAt(0).toUpperCase() + inputs.text.slice(1);
    }

    /**
     * Lowercases the first character of text.
     * Example: text='Hello World' → 'hello World'
     * @param inputs a text
     * @returns text with first character lowercase
     * @group transform
     * @shortname uncapitalize first
     * @drawable false
     */
    toLowerCaseFirst(inputs: Inputs.Text.TextDto): string {
        if (!inputs.text) return inputs.text;
        return inputs.text.charAt(0).toLowerCase() + inputs.text.slice(1);
    }

    /**
     * Repeats text a specified number of times.
     * Example: text='ha', count=3 → 'hahaha'
     * @param inputs a text and count
     * @returns repeated text
     * @group transform
     * @shortname repeat
     * @drawable false
     */
    repeat(inputs: Inputs.Text.TextRepeatDto): string {
        return inputs.text.repeat(inputs.count);
    }

    /**
     * Reverses the characters in text.
     * Example: text='hello' → 'olleh'
     * @param inputs a text
     * @returns reversed text
     * @group transform
     * @shortname reverse
     * @drawable false
     */
    reverse(inputs: Inputs.Text.TextDto): string {
        return inputs.text.split("").reverse().join("");
    }

    /**
     * Returns the length of text.
     * Example: text='hello' → 5
     * @param inputs a text
     * @returns length
     * @group query
     * @shortname length
     * @drawable false
     */
    length(inputs: Inputs.Text.TextDto): number {
        return inputs.text.length;
    }

    /**
     * Checks if text is empty or only whitespace.
     * Example: text='   ' → true
     * @param inputs a text
     * @returns boolean
     * @group query
     * @shortname is empty
     * @drawable false
     */
    isEmpty(inputs: Inputs.Text.TextDto): boolean {
        return !inputs.text || inputs.text.trim().length === 0;
    }

    /**
     * Concatenates multiple text strings.
     * Example: texts=['hello', ' ', 'world'] → 'hello world'
     * @param inputs array of texts
     * @returns concatenated text
     * @group transform
     * @shortname concat
     * @drawable false
     */
    concat(inputs: Inputs.Text.TextConcatDto): string {
        return inputs.texts.join("");
    }

    /**
     * Tests if text matches a regular expression pattern.
     * Example: text='hello123', pattern='[0-9]+' → true
     * @param inputs a text and regex pattern
     * @returns boolean
     * @group regex
     * @shortname test regex
     * @drawable false
     */
    regexTest(inputs: Inputs.Text.TextRegexDto): boolean {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        return regex.test(inputs.text);
    }

    /**
     * Matches text against a regular expression and returns matches.
     * Example: text='hello123world456', pattern='[0-9]+', flags='g' → ['123', '456']
     * @param inputs a text and regex pattern
     * @returns array of matches or null
     * @group regex
     * @shortname regex match
     * @drawable false
     */
    regexMatch(inputs: Inputs.Text.TextRegexDto): string[] | null {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        const result = inputs.text.match(regex);
        return result ? Array.from(result) : null;
    }

    /**
     * Replaces text matching a regular expression pattern.
     * Example: text='hello123world456', pattern='[0-9]+', flags='g', replaceWith='X' → 'helloXworldX'
     * @param inputs a text, regex pattern, and replacement
     * @returns text with replacements
     * @group regex
     * @shortname regex replace
     * @drawable false
     */
    regexReplace(inputs: Inputs.Text.TextRegexReplaceDto): string {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        return inputs.text.replace(regex, inputs.replaceWith);
    }

    /**
     * Searches text for a regular expression pattern and returns the index.
     * Example: text='hello123', pattern='[0-9]+' → 5
     * @param inputs a text and regex pattern
     * @returns index or -1 if not found
     * @group regex
     * @shortname regex search
     * @drawable false
     */
    regexSearch(inputs: Inputs.Text.TextRegexDto): number {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        return inputs.text.search(regex);
    }

    /**
     * Splits text using a regular expression pattern.
     * Example: text='a1b2c3', pattern='[0-9]+' → ['a', 'b', 'c']
     * @param inputs a text and regex pattern
     * @returns array of split strings
     * @group regex
     * @shortname regex split
     * @drawable false
     */
    regexSplit(inputs: Inputs.Text.TextRegexDto): string[] {
        const regex = new RegExp(inputs.pattern, inputs.flags);
        return inputs.text.split(regex);
    }

    /**
     * Converts a character to vector paths (polylines) with width and height data for rendering.
     * Uses simplex stroke font to generate 2D line segments representing the character shape.
     * Example: char='A', height=10 → {width:8, height:10, paths:[[points forming A shape]]}
     * @param inputs a text
     * @returns width, height and segments as json
     * @group vector
     * @shortname vector char
     * @drawable false
     */
    vectorChar(inputs: Inputs.Text.VectorCharDto): Models.Text.VectorCharData {
        const {
            xOffset, yOffset, font, input, height, extrudeOffset
        } = this.vectorParamsChar(inputs);
        let code = input.charCodeAt(0);
        if (!code || !font[code]) {
            code = 63;
        }
        const glyph = [].concat(font[code]);
        const ratio = (height - extrudeOffset) / font.height;
        const extrudeYOffset = (extrudeOffset / 2);
        const width = glyph.shift() * ratio;
        const paths: Inputs.Base.Point3[][] = [];
        let polyline = [];
        for (let i = 0, il = glyph.length; i < il; i += 2) {
            const gx = ratio * glyph[i] + xOffset;
            const gy = ratio * glyph[i + 1] + yOffset + extrudeYOffset;
            if (glyph[i] !== undefined) {
                polyline.push([gx, 0, gy]);
                continue;
            }
            paths.push(polyline as Inputs.Base.Point3[]);
            polyline = [];
            i--;
        }
        if (polyline.length) {
            paths.push(polyline as Inputs.Base.Point3[]);
        }
        return { width, height, paths };
    }

    /**
     * Converts multi-line text to vector paths (polylines) with alignment and spacing controls.
     * Supports line breaks, letter spacing, line spacing, horizontal alignment, and origin centering.
     * Example: text='Hello\nWorld', height=10, align=center → [{line1 chars}, {line2 chars}]
     * @param inputs a text as string
     * @returns segments
     * @group vector
     * @shortname vector text
     * @drawable false
     */
    vectorText(inputs: Inputs.Text.VectorTextDto): Models.Text.VectorTextData[] {
        const {
            xOffset, yOffset, height, align, extrudeOffset, lineSpacing, letterSpacing
        } = Object.assign({}, defaultsVectorParams, inputs);

        const text = inputs.text;
        if (typeof text !== "string") throw new Error("text must be a string");

        // NOTE: Just like CSS letter-spacing, the spacing could be positive or negative
        const extraLetterSpacing = (height * letterSpacing);

        // manage the list of lines
        let maxWidth = 0; // keep track of max width for final alignment
        type Line = { width: number, height: number, chars: Models.Text.VectorCharData[] };
        let line: Line = { width: 0, height: 0, chars: [] };
        let lines: Line[] = [];

        const pushLine = () => {
            maxWidth = Math.max(maxWidth, line.width);

            if (line.chars.length) lines.push(line);
            line = { width: 0, height: 0, chars: [] };
        };

        // convert the text into a list of vector lines
        let x = xOffset;
        let y = yOffset;
        let vchar;
        const il = text.length;
        for (let i = 0; i < il; i++) {
            const character = text[i];
            if (character === "\n") {
                pushLine();

                // reset x and y for a new line
                x = xOffset;
                y -= height * lineSpacing;
                continue;
            }
            // convert the character
            vchar = this.vectorChar({ xOffset: x, yOffset: y, height, extrudeOffset, char: character });

            const width = vchar.width + extraLetterSpacing;
            x += width;

            // update current line
            line.width += width;
            line.height = Math.max(line.height, vchar.height);
            if (character !== " ") {
                line.chars = line.chars.concat(vchar);
            }
        }
        if (line.chars.length) pushLine();

        // align all lines as requested
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

            // flatten the lines into a single array of points
            lines.forEach((line) => {
                line.chars.forEach((vchar) => {
                    vchar.paths.forEach((path) => {
                        pointsFlat.push(...path);
                    });
                });
            });

            const bbox = this.point.boundingBoxOfPoints({
                points: pointsFlat,
            });

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

    private translateLine(options, line) {
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
