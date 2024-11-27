/* eslint-disable @typescript-eslint/no-namespace */


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
}
