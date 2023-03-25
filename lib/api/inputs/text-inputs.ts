

// tslint:disable-next-line: no-namespace
export namespace Text {

    export class TextDto {
        /**
         * The text
         * @default Hello World
         */
        text: string = 'Hello World';
    }

    export class TextSplitDto {
        /**
         * Text to split
         * @default undefined
         */
        text: string;
        /**
         * Text to split by
         * @default ,
         */
        separator: string = ','
    }
    export class TextReplaceDto {
        /**
         * Text to replace
         * @default undefined
         */
        text: string;
        /**
         * Text to search for
         * @default undefined
         */
        search: string;
        /**
         * Text to replace found occurences
         * @default undefined
         */
        replaceWith: string;
    }
    export class TextJoinDto {
        /**
         * Text to join
         * @default undefined
         */
        list: string[];
        /**
         * Text to join by
         * @default undefined
         */
        separator: string;
    }
    export class ToStringDto {
        /**
         * Item to stringify
         * @default undefined
         */
        item: any;
    }
    export class ToStringEachDto {
        /**
         * Item to stringify
         * @default undefined
         */
        list: any[];
    }
}
