/* eslint-disable @typescript-eslint/no-namespace */

import { Base } from "./base-inputs";


export namespace Text {

    export class TextDto {
        constructor(text?: string) {
            if (text !== undefined) { this.text = text; }
        }
        /**
         * The text
         * @default Hello World
         */
        text = "Hello World";
    }

    export class TextSplitDto {
        constructor(text?: string, separator?: string) {
            if (text !== undefined) { this.text = text; }
            if (separator !== undefined) { this.separator = separator; }
        }
        /**
         * Text to split
         * @default a,b,c
         */
        text = "a,b,c";
        /**
         * Text to split by
         * @default ,
         */
        separator = ",";
    }
    export class TextReplaceDto {
        constructor(text?: string, search?: string, replaceWith?: string) {
            if (text !== undefined) { this.text = text; }
            if (search !== undefined) { this.search = search; }
            if (replaceWith !== undefined) { this.replaceWith = replaceWith; }
        }
        /**
         * Text to replace
         * @default a-c
         */
        text = "a-c";
        /**
         * Text to search for
         * @default -
         */
        search = "-";
        /**
         * Text to replace found occurences
         * @default b
         */
        replaceWith = "b";
    }
    export class TextJoinDto {
        constructor(list?: string[], separator?: string) {
            if (list !== undefined) { this.list = list; }
            if (separator !== undefined) { this.separator = separator; }
        }
        /**
         * Text to join
         * @default undefined
         */
        list: string[];
        /**
         * Text to join by
         * @default ,
         */
        separator = ",";
    }
    export class ToStringDto<T> {
        constructor(item?: T) {
            if (item !== undefined) { this.item = item; }
        }
        /**
         * Item to stringify
         * @default undefined
         */
        item: T;
    }
    export class ToStringEachDto<T> {
        constructor(list?: T[]) {
            if (list !== undefined) { this.list = list; }
        }
        /**
         * Item to stringify
         * @default undefined
         */
        list: T[];
    }

    export class TextFormatDto {
        constructor(text?: string, values?: string[]) {
            if (text !== undefined) { this.text = text; }
            if (values !== undefined) { this.values = values; }
        }
        /**
         * Text to format
         * @default Hello {0}
         */
        text = "Hello {0}";
        /**
         * Values to format
         * @default ["World"]
         */
        values = ["World"];
    }

    export class TextSearchDto {
        constructor(text?: string, search?: string) {
            if (text !== undefined) { this.text = text; }
            if (search !== undefined) { this.search = search; }
        }
        /**
         * Text to search in
         * @default hello world
         */
        text = "hello world";
        /**
         * Text to search for
         * @default world
         */
        search = "world";
    }

    export class TextSubstringDto {
        constructor(text?: string, start?: number, end?: number) {
            if (text !== undefined) { this.text = text; }
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Text to extract from
         * @default hello world
         */
        text = "hello world";
        /**
         * Start index
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        start = 0;
        /**
         * End index
         * @default 5
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        end?: number = 5;
    }

    export class TextIndexDto {
        constructor(text?: string, index?: number) {
            if (text !== undefined) { this.text = text; }
            if (index !== undefined) { this.index = index; }
        }
        /**
         * Text to get character from
         * @default hello
         */
        text = "hello";
        /**
         * Index of character
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
    }

    export class TextPadDto {
        constructor(text?: string, length?: number, padString?: string) {
            if (text !== undefined) { this.text = text; }
            if (length !== undefined) { this.length = length; }
            if (padString !== undefined) { this.padString = padString; }
        }
        /**
         * Text to pad
         * @default 5
         */
        text = "5";
        /**
         * Target length
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        length = 3;
        /**
         * String to pad with
         * @default 0
         */
        padString = "0";
    }

    export class TextRepeatDto {
        constructor(text?: string, count?: number) {
            if (text !== undefined) { this.text = text; }
            if (count !== undefined) { this.count = count; }
        }
        /**
         * Text to repeat
         * @default ha
         */
        text = "ha";
        /**
         * Number of repetitions
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        count = 3;
    }

    export class TextConcatDto {
        constructor(texts?: string[]) {
            if (texts !== undefined) { this.texts = texts; }
        }
        /**
         * Texts to concatenate
         * @default ["hello", " ", "world"]
         */
        texts = ["hello", " ", "world"];
    }

    export class TextRegexDto {
        constructor(text?: string, pattern?: string, flags?: string) {
            if (text !== undefined) { this.text = text; }
            if (pattern !== undefined) { this.pattern = pattern; }
            if (flags !== undefined) { this.flags = flags; }
        }
        /**
         * Text to search in
         * @default hello123world
         */
        text = "hello123world";
        /**
         * Regular expression pattern
         * @default [0-9]+
         */
        pattern = "[0-9]+";
        /**
         * Regular expression flags (g, i, m, s, u, y)
         * @default g
         */
        flags = "g";
    }

    export class TextRegexReplaceDto {
        constructor(text?: string, pattern?: string, flags?: string, replaceWith?: string) {
            if (text !== undefined) { this.text = text; }
            if (pattern !== undefined) { this.pattern = pattern; }
            if (flags !== undefined) { this.flags = flags; }
            if (replaceWith !== undefined) { this.replaceWith = replaceWith; }
        }
        /**
         * Text to search in
         * @default hello123world456
         */
        text = "hello123world456";
        /**
         * Regular expression pattern
         * @default [0-9]+
         */
        pattern = "[0-9]+";
        /**
         * Regular expression flags (g, i, m, s, u, y)
         * @default g
         */
        flags = "g";
        /**
         * Text to replace matches with
         * @default X
         */
        replaceWith = "X";
    }

    export class VectorCharDto {
        constructor(char?: string, xOffset?: number, yOffset?: number, height?: number, extrudeOffset?: number) {
            if (char !== undefined) { this.char = char; }
            if (xOffset !== undefined) { this.xOffset = xOffset; }
            if (yOffset !== undefined) { this.yOffset = yOffset; }
            if (height !== undefined) { this.height = height; }
            if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
        }
        /**
         * The text
         * @default A
         */
        char = "A";
        /**
         * The x offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset? = 0;
        /**
         * The y offset
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset? = 0;
        /**
         * The height of the text
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        height? = 1;
        /**
         * The extrude offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset? = 0;
    }
    
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
         * The text
         * @default Hello World
         */
        text?: string;
        /**
         * The x offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset? = 0;
        /**
         * The y offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset? = 0;
        /**
         * The height of the text
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        height? = 1;
        /**
         * The line spacing
         * @default 1.4
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing? = 1.4;
        /**
         * The letter spacing offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing? = 0;
        /**
         * The extrude offset
         * @default left
         */
        align?: Base.horizontalAlignEnum;
        /**
         * The extrude offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset? = 0;
        /**
         * Will center text on 0, 0, 0
         * @default false
         */
        centerOnOrigin? = false;
    }

}
