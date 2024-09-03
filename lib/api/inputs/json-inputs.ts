/* eslint-disable @typescript-eslint/no-namespace */
export namespace JSON {

    export class StringifyDto {
        constructor(json?: any) {
            if (json !== undefined) { this.json = json; }
        }
        /**
         * Stringify value
         * @default undefined
         */
        json: any;
    }
    export class ParseDto {
        constructor(text?: string) {
            if (text !== undefined) { this.text = text; }
        }
        /**
         * Stringify value
         * @default undefined
         */
        text: string;
    }
    export class QueryDto {
        constructor(json?: any, query?: string) {
            if (json !== undefined) { this.json = json; }
            if (query !== undefined) { this.query = query; }
        }
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

    export class SetValueOnPropDto {
        constructor(json?: any, value?: any, property?: string) {
            if (json !== undefined) { this.json = json; }
            if (value !== undefined) { this.value = value; }
            if (property !== undefined) { this.property = property; }
        }
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
         * @default propName
         */
        property = "propName";
    }

    export class GetValueOnPropDto {
        constructor(json?: any, property?: string) {
            if (json !== undefined) { this.json = json; }
            if (property !== undefined) { this.property = property; }
        }
        /**
        * query json structure
        * @default undefined
        */
        json: any;
        /**
         * query json structure
         * @default propName
         */
        property = "propName";
    }

    export class SetValueDto {
        constructor(json?: any, value?: any, path?: string) {
            if (json !== undefined) { this.json = json; }
            if (value !== undefined) { this.value = value; }
            if (path !== undefined) { this.path = path; }
        }
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
         * @default $.propertyName
         */
        path = "$.propertyName";
    }

    export class SetValuesOnPathsDto {
        constructor(json?: any, values?: any[], paths?: string[]) {
            if (json !== undefined) { this.json = json; }
            if (values !== undefined) { this.values = values; }
            if (paths !== undefined) { this.paths = paths; }
        }
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
        constructor(json?: any, query?: string) {
            if (json !== undefined) { this.json = json; }
            if (query !== undefined) { this.query = query; }
        }
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
        constructor(json?: any) {
            if (json !== undefined) { this.json = json; }
        }
        /**
         * json value
         * @default undefined
         */
        json: any;
    }
}
