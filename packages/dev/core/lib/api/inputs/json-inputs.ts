/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for JSON handling: the value or text to act on, the path to query or edit, and the
 * formatting options used when stringifying.
 */
export namespace JSON {

    export class StringifyDto {
        constructor(json?: unknown) {
            if (json !== undefined) { this.json = json; }
        }
        /**
         * Stringify value
         * @default undefined
         */
        json: unknown;
    }
    export class ParseDto {
        constructor(text?: string) {
            if (text !== undefined) { this.text = text; }
        }
        /**
         * Stringify value
         * @default "[0, 0, 0]"
         */
        text = "[0, 0, 0]";
    }
    export class QueryDto {
        constructor(json?: unknown, query?: string) {
            if (json !== undefined) { this.json = json; }
            if (query !== undefined) { this.query = query; }
        }
        /**
         * query json structure
         * @default undefined
         */
        json: unknown;
        /**
         * query path
         * @default undefined
         */
        query!: string;
    }

    export class SetValueOnPropDto {
        constructor(json?: unknown, value?: unknown, property?: string) {
            if (json !== undefined) { this.json = json; }
            if (value !== undefined) { this.value = value; }
            if (property !== undefined) { this.property = property; }
        }
        /**
        * query json structure
        * @default undefined
        */
        json: unknown;
        /**
         * value to be set
         * @default undefined
         */
        value: unknown;
        /**
         * query json structure
         * @default propName
         */
        property = "propName";
    }

    export class GetJsonFromArrayByFirstPropMatchDto {
        constructor(jsonArray?: unknown[], property?: string, match?: unknown) {
            if (jsonArray !== undefined) { this.jsonArray = jsonArray; }
            if (property !== undefined) { this.property = property; }
            if (match !== undefined) { this.match = match; }
        }
        /**
         * Array
         * @default undefined
         */
        jsonArray!: unknown[];
        /**
         * property to check
         * @default propName
         */
        property = "propName";
        /**
         * Value to match for the property
         * @default undefined
         */
        match: unknown;
    }

    export class GetValueOnPropDto {
        constructor(json?: unknown, property?: string) {
            if (json !== undefined) { this.json = json; }
            if (property !== undefined) { this.property = property; }
        }
        /**
        * query json structure
        * @default undefined
        */
        json: unknown;
        /**
         * query json structure
         * @default propName
         */
        property = "propName";
    }

    export class SetValueDto {
        constructor(json?: unknown, value?: unknown, path?: string, prop?: string) {
            if (json !== undefined) { this.json = json; }
            if (value !== undefined) { this.value = value; }
            if (path !== undefined) { this.path = path; }
            if (prop !== undefined) { this.prop = prop; }
        }
        /**
        * query json structure
        * @default undefined
        */
        json: unknown;
        /**
         * value to be set
         * @default undefined
         */
        value: unknown;
        /**
         * query to json structure elements on which given prop has to be updated
         * @default $.pathToParent
         */
        path = "$.pathToParent";
        /**
         * property to update
         * @default propertyName
         */
        prop = "propertyName";
    }

    export class SetValuesOnPathsDto {
        constructor(json?: unknown, values?: unknown[], paths?: string[], props?: string[]) {
            if (json !== undefined) { this.json = json; }
            if (values !== undefined) { this.values = values; }
            if (paths !== undefined) { this.paths = paths; }
            if (props !== undefined) { this.props = props; }
        }
        /**
        * query json structure
        * @default undefined
        */
        json: unknown;
        /**
         * values to be set
         * @default undefined
         */
        values!: unknown[];
        /**
         * query json structures
         * @default undefined
         */
        paths!: string[];
        /**
         * properties to update
         * @default undefined
         */
        props!: string[];
    }
    export class PathsDto {
        constructor(json?: unknown, query?: string) {
            if (json !== undefined) { this.json = json; }
            if (query !== undefined) { this.query = query; }
        }
        /**
         * query json structure
         * @default undefined
         */
        json: unknown;
        /**
         * query path 
         * @default undefined
         */
        query!: string;
    }

    export class JsonDto {
        constructor(json?: unknown) {
            if (json !== undefined) { this.json = json; }
        }
        /**
         * json value
         * @default undefined
         */
        json: unknown;
    }
}
