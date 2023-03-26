

// tslint:disable-next-line: no-namespace
export namespace JSON {

    export class StringifyDto {
        /**
         * Stringify value
         * @default undefined
         */
        json: any;
    }
    export class ParseDto {
        /**
         * Stringify value
         * @default undefined
         */
        text: string;
    }
    export class QueryDto {
        /**
         * query json structure
         * @default undefined
         */
        json: any;
        /**
         * query path
         * @default
         */
        query: string;
    }
    export class SetValueDto {
        /**
        * query json structure
        * @default undefined
        */
        json: any;
        /**
         * query json structure
         * @default undefined
         */
        value: any;
        /**
         * query json structure
         * @default
         */
        path: string;
    }
    export class PathsDto {
        /**
         * query json structure
         * @default undefined
         */
        json: any;
        /**
         * query path
         * @default
         */
        query: string;
    }
}
