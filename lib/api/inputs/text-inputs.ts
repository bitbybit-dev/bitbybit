/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
export namespace Text {

    export class TextDto {
        /**
         * The text
         * @default Hello World
         */
        text = "Hello World";
    }

    export class TextSplitDto {
        /**
         * Text to split
         * @default a,b,c
         */
        text = "a,b,c";
        /**
         * Text to split by
         * @default ,
         */
        separator = ","
    }
    export class TextReplaceDto {
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
        /**
         * Item to stringify
         * @default undefined
         */
        item: T;
    }
    export class ToStringEachDto<T> {
        /**
         * Item to stringify
         * @default undefined
         */
        list: T[];
    }
}
