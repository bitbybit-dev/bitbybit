/* eslint-disable @typescript-eslint/no-namespace */

import { Base } from "./base-inputs";


/**


 * Parameters for string handling: the text to act on plus the separator, index, pattern, replacement,


 * padding or format an operation needs. Used for labels, tags, engraved 3D text and for assembling the


 * data a script hands back out.


 */
export namespace Text {

    /**
     * One text for the single-text methods of `text`: `trim`, `toUpperCase`, `reverse`, `length`,
     * `isEmpty` and the rest.
     */
    export class TextDto {
        constructor(text?: string) {
            if (text !== undefined) { this.text = text; }
        }
        /**
         * The text the method works on; it is not changed, a new text is returned.
         * @default Hello World
         */
        text = "Hello World";
    }

    /**
     * A text and a separator for `text.split`.
     */
    export class TextSplitDto {
        constructor(text?: string, separator?: string) {
            if (text !== undefined) { this.text = text; }
            if (separator !== undefined) { this.separator = separator; }
        }
        /**
         * The text to cut into pieces.
         * @default a,b,c
         */
        text = "a,b,c";
        /**
         * The text that marks a cut; it is dropped from the pieces.
         * @default ,
         */
        separator = ",";
    }
    /**
     * A text, what to look for in it and what to put in its place, for `text.replaceAll`.
     */
    export class TextReplaceDto {
        constructor(text?: string, search?: string, replaceWith?: string) {
            if (text !== undefined) { this.text = text; }
            if (search !== undefined) { this.search = search; }
            if (replaceWith !== undefined) { this.replaceWith = replaceWith; }
        }
        /**
         * The text to make the replacements in.
         * @default a-c
         */
        text = "a-c";
        /**
         * The text to look for; every occurrence is replaced.
         * @default -
         */
        search = "-";
        /**
         * The text that takes the place of each occurrence.
         * @default b
         */
        replaceWith = "b";
    }
    /**
     * Texts and a separator for `text.join`, which writes them one after another.
     */
    export class TextJoinDto {
        constructor(list?: string[], separator?: string) {
            if (list !== undefined) { this.list = list; }
            if (separator !== undefined) { this.separator = separator; }
        }
        /**
         * The texts to join, in order.
         * @default undefined
         */
        list!: string[];
        /**
         * The text placed between neighbors; an empty text joins them directly.
         * @default ,
         */
        separator = ",";
    }
    /**
     * Any value for `text.toString`, which turns it into text the way JavaScript prints it.
     */
    export class ToStringDto<T> {
        constructor(item?: T) {
            if (item !== undefined) { this.item = item; }
        }
        /**
         * The value to turn into text.
         * @default undefined
         */
        item!: T;
    }
    /**
     * A list of values for `text.toStringEach`, which turns each into text the way JavaScript
     * prints it.
     */
    export class ToStringEachDto<T> {
        constructor(list?: T[]) {
            if (list !== undefined) { this.list = list; }
        }
        /**
         * The values to turn into text, one by one.
         * @default undefined
         */
        list!: T[];
    }

    /**
     * A text with numbered placeholders and the values for `text.format` to fill in.
     */
    export class TextFormatDto {
        constructor(text?: string, values?: string[]) {
            if (text !== undefined) { this.text = text; }
            if (values !== undefined) { this.values = values; }
        }
        /**
         * The text with placeholders such as `{0}` and `{1}`.
         * @default Hello {0}
         */
        text = "Hello {0}";
        /**
         * The values, in placeholder order: the first fills `{0}`, the second `{1}`.
         * @default ["World"]
         */
        values = ["World"];
    }

    /**
     * A text and something to look for in it, for `text.includes`, `text.startsWith`,
     * `text.endsWith`, `text.indexOf` and `text.lastIndexOf`.
     */
    export class TextSearchDto {
        constructor(text?: string, search?: string) {
            if (text !== undefined) { this.text = text; }
            if (search !== undefined) { this.search = search; }
        }
        /**
         * The text to look in.
         * @default hello world
         */
        text = "hello world";
        /**
         * The text to look for, matched exactly, including case.
         * @default world
         */
        search = "world";
    }

    /**
     * A text and a range of positions for `text.substring` and `text.slice`.
     */
    export class TextSubstringDto {
        constructor(text?: string, start?: number, end?: number) {
            if (text !== undefined) { this.text = text; }
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * The text to take characters from.
         * @default hello world
         */
        text = "hello world";
        /**
         * Position of the first character to take, counting from 0.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        start = 0;
        /**
         * Position just after the last character to take; leave it out to take everything to the
         * end.
         * @default 5
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        end?: number | undefined = 5;
    }

    /**
     * A text and a position for `text.charAt`.
     */
    export class TextIndexDto {
        constructor(text?: string, index?: number) {
            if (text !== undefined) { this.text = text; }
            if (index !== undefined) { this.index = index; }
        }
        /**
         * The text to read a character from.
         * @default hello
         */
        text = "hello";
        /**
         * Position of the character, counting from 0.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
    }

    /**
     * A text, a length and a filler for `text.padStart` and `text.padEnd`.
     */
    export class TextPadDto {
        constructor(text?: string, length?: number, padString?: string) {
            if (text !== undefined) { this.text = text; }
            if (length !== undefined) { this.length = length; }
            if (padString !== undefined) { this.padString = padString; }
        }
        /**
         * The text to lengthen.
         * @default x
         */
        text = "x";
        /**
         * The length to reach; a text already that long stays as it is.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        length = 3;
        /**
         * The filler repeated until the length is reached; the last repeat is cut short if needed.
         * @default a
         */
        padString = "a";
    }

    /**
     * A text and a count for `text.repeat`.
     */
    export class TextRepeatDto {
        constructor(text?: string, count?: number) {
            if (text !== undefined) { this.text = text; }
            if (count !== undefined) { this.count = count; }
        }
        /**
         * The text that is written out again and again.
         * @default ha
         */
        text = "ha";
        /**
         * How many times the text appears in the result.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        count = 3;
    }

    /**
     * Texts for `text.concat`, joined with nothing between them.
     */
    export class TextConcatDto {
        constructor(texts?: string[]) {
            if (texts !== undefined) { this.texts = texts; }
        }
        /**
         * The texts to join, in order.
         * @default ["hello", " ", "world"]
         */
        texts = ["hello", " ", "world"];
    }

    /**
     * A text and a regular expression for `text.regexTest`, `text.regexMatch`, `text.regexSearch`
     * and `text.regexSplit`.
     */
    export class TextRegexDto {
        constructor(text?: string, pattern?: string, flags?: string) {
            if (text !== undefined) { this.text = text; }
            if (pattern !== undefined) { this.pattern = pattern; }
            if (flags !== undefined) { this.flags = flags; }
        }
        /**
         * The text the pattern is applied to.
         * @default hello123world
         */
        text = "hello123world";
        /**
         * The regular expression, written as it would be between the slashes in JavaScript, such as
         * `[0-9]+`.
         * @default [0-9]+
         */
        pattern = "[0-9]+";
        /**
         * The regular expression flags: `g` for every match, `i` to ignore case, `m` for
         * line-by-line anchors, and `s`, `u`, `y` as in JavaScript.
         * @default g
         */
        flags = "g";
    }

    /**
     * A text, a regular expression and a replacement for `text.regexReplace`.
     */
    export class TextRegexReplaceDto {
        constructor(text?: string, pattern?: string, flags?: string, replaceWith?: string) {
            if (text !== undefined) { this.text = text; }
            if (pattern !== undefined) { this.pattern = pattern; }
            if (flags !== undefined) { this.flags = flags; }
            if (replaceWith !== undefined) { this.replaceWith = replaceWith; }
        }
        /**
         * The text to make the replacements in.
         * @default hello123world456
         */
        text = "hello123world456";
        /**
         * The regular expression, written as it would be between the slashes in JavaScript, such as
         * `[0-9]+`.
         * @default [0-9]+
         */
        pattern = "[0-9]+";
        /**
         * The regular expression flags: `g` replaces every match instead of the first, `i` ignores
         * case, and `m`, `s`, `u`, `y` work as in JavaScript.
         * @default g
         */
        flags = "g";
        /**
         * The text that takes the place of each match; `$1` and the like refer to capture groups,
         * as in JavaScript.
         * @default X
         */
        replaceWith = "X";
    }

    /**
     * One character and its size and placement for `text.vectorChar`, which draws it as stroke
     * paths on the XZ plane.
     */
    export class VectorCharDto {
        constructor(char?: string, xOffset?: number, yOffset?: number, height?: number, extrudeOffset?: number) {
            if (char !== undefined) { this.char = char; }
            if (xOffset !== undefined) { this.xOffset = xOffset; }
            if (yOffset !== undefined) { this.yOffset = yOffset; }
            if (height !== undefined) { this.height = height; }
            if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
        }
        /**
         * The character to draw; only its first character is used, and an unknown one is drawn as a
         * question mark.
         * @default A
         */
        char = "A";
        /**
         * How far to shift the strokes along X, in model units.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset?: number | undefined = 0;
        /**
         * How far to shift the strokes along the second axis of the character plane, in model
         * units.
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset?: number | undefined = 0;
        /**
         * The height of a capital letter, in model units; the strokes are scaled to it.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        height?: number | undefined = 1;
        /**
         * A margin, in model units, taken off the height and split above and below, so an extruded
         * character keeps its full size.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset?: number | undefined = 0;
    }
    
    /**
     * A text and its layout for `text.vectorText`, which draws it line by line as stroke paths on
     * the XZ plane.
     */
    export class VectorTextDto {
        constructor(text?: string, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: Base.horizontalAlignEnum, extrudeOffset?: number, centerOnOrigin?: boolean) {
            if (text !== undefined) { this.text = text; }
            if (xOffset !== undefined) { this.xOffset = xOffset; }
            if (yOffset !== undefined) { this.yOffset = yOffset; }
            if (height !== undefined) { this.height = height; }
            if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
            if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
            if (align !== undefined) { this.align = align; }
            if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
            if (centerOnOrigin !== undefined) { this.centerOnOrigin = centerOnOrigin; }
        }
        /**
         * The text to draw; a line break starts a new line.
         * @default Hello World
         */
        text?: string | undefined;
        /**
         * How far to shift the whole block along X, in model units.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset?: number | undefined = 0;
        /**
         * How far to shift the whole block along the second axis of the text plane, in model units.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset?: number | undefined = 0;
        /**
         * The height of a capital letter, in model units.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        height?: number | undefined = 1;
        /**
         * The distance between lines as a multiple of the height; 1.4 leaves a little air between
         * them.
         * @default 1.4
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing?: number | undefined = 1.4;
        /**
         * Extra space between characters as a multiple of the height; 0 uses the font's own
         * spacing.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing?: number | undefined = 0;
        /**
         * How lines of different length line up: at their left edge, their center or their right
         * edge.
         * @default left
         */
        align?: Base.horizontalAlignEnum | undefined;
        /**
         * A margin, in model units, taken off the height and split above and below each character,
         * so extruded text keeps its full size.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset?: number | undefined = 0;
        /**
         * When true, the middle of the whole text block is moved to the origin.
         * @default false
         */
        centerOnOrigin?: boolean | undefined = false;
    }

}
