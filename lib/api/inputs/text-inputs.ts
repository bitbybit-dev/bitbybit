

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
         * @default a,b,c
         */
        text: string = 'a,b,c';
        /**
         * Text to split by
         * @default ,
         */
        separator: string = ','
    }
    export class TextReplaceDto {
        /**
         * Text to replace
         * @default a-c
         */
        text: string = 'a-c';
        /**
         * Text to search for
         * @default -
         */
        search: string = '-';
        /**
         * Text to replace found occurences
         * @default b
         */
        replaceWith: string = 'b';
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
        separator: string = ',';
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
