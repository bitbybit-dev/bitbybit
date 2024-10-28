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
         * @default "[0, 0, 0]"
         */
        text = "[0, 0, 0]";
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

    export class GetJsonFromArrayByFirstPropMatchDto {
        constructor(jsonArray?: any[], property?: string, match?: any) {
            if (jsonArray !== undefined) { this.jsonArray = jsonArray; }
            if (property !== undefined) { this.property = property; }
            if (match !== undefined) { this.match = match; }
        }
        /**
         * Array
         * @default undefined
         */
        jsonArray: any[];
        /**
         * property to check
         * @default propName
         */
        property = "propName";
        /**
         * Value to match for the property
         * @default undefined
         */
        match: any;
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
        constructor(json?: any, value?: any, path?: string, prop?: string) {
            if (json !== undefined) { this.json = json; }
            if (value !== undefined) { this.value = value; }
            if (path !== undefined) { this.path = path; }
            if (prop !== undefined) { this.prop = prop; }
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
        constructor(json?: any, values?: any[], paths?: string[], props?: []) {
            if (json !== undefined) { this.json = json; }
            if (values !== undefined) { this.values = values; }
            if (paths !== undefined) { this.paths = paths; }
            if (props !== undefined) { this.props = props; }
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
        /**
         * properties to update
         * @default undefined
         */
        props: string[];
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
