/* eslint-disable @typescript-eslint/no-namespace */
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
         * @default undefined
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
         * value to be set
         * @default undefined
         */
        value: any;
        /**
         * query json structure
         * @default undefined
         */
        path: string;
    }

    export class SetValuesOnPathsDto {
        /**
        * query json structure
        * @default undefined
        */
        json: any;
        /**
         * values to be set
         * @default undefined
         */
        values: any[];
        /**
         * query json structures
         * @default undefined
         */
        paths: string[];
    }
    export class PathsDto {
        /**
         * query json structure
         * @default undefined
         */
        json: any;
        /**
         * query path 
         * @default undefined
         */
        query: string;
    }

    export class JsonDto {
        /**
         * json value
         * @default undefined
         */
        json: any;
    }
}
