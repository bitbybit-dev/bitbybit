/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for JSON handling: the value or text to act on, the path to query or edit, and the
 * formatting options used when stringifying.
 */
export namespace JSON {

    /**
     * Feeds `json.stringify` with the value to write as JSON text.
     */
    export class StringifyDto {
        constructor(json?: unknown) {
            if (json !== undefined) { this.json = json; }
        }
        /**
         * Any JSON-compatible value: an object, a list, a number, text, a boolean or null
         * @default undefined
         */
        json: unknown;
    }
    /**
     * Feeds `json.parse` with the JSON text to turn back into a value.
     */
    export class ParseDto {
        constructor(text?: string) {
            if (text !== undefined) { this.text = text; }
        }
        /**
         * Valid JSON text, such as `[0, 0, 0]` or an object in braces; anything else throws an
         * error
         * @default "[0, 0, 0]"
         */
        text = "[0, 0, 0]";
    }
    /**
     * Feeds `json.query` with the JSON to search and the JSONPath expression that selects values in
     * it.
     */
    export class QueryDto {
        constructor(json?: unknown, query?: string) {
            if (json !== undefined) { this.json = json; }
            if (query !== undefined) { this.query = query; }
        }
        /**
         * The object or list to search; it is read, never changed
         * @default undefined
         */
        json: unknown;
        /**
         * A JSONPath expression starting at the root `$`, such as `$.parts[*].name` or `$..radius`
         * @default undefined
         */
        query!: string;
    }

    /**
     * Feeds `json.setValueOnProp`: the object to copy and change, the top-level property to set and
     * the value it gets.
     */
    export class SetValueOnPropDto {
        constructor(json?: unknown, value?: unknown, property?: string) {
            if (json !== undefined) { this.json = json; }
            if (value !== undefined) { this.value = value; }
            if (property !== undefined) { this.property = property; }
        }
        /**
         * The object to change; it stays as it is and a changed copy comes back
         * @default undefined
         */
        json: unknown;
        /**
         * What the property is set to; any JSON-compatible value
         * @default undefined
         */
        value: unknown;
        /**
         * Name of the top-level property to set; a property that does not exist yet is added
         * @default propName
         */
        property = "propName";
    }

    /**
     * Feeds `json.getJsonFromArrayByFirstPropMatch`: the list of objects to search, the property to
     * look at and the value it must equal.
     */
    export class GetJsonFromArrayByFirstPropMatchDto {
        constructor(jsonArray?: unknown[], property?: string, match?: unknown) {
            if (jsonArray !== undefined) { this.jsonArray = jsonArray; }
            if (property !== undefined) { this.property = property; }
            if (match !== undefined) { this.match = match; }
        }
        /**
         * The list of objects searched in order; the first match is the result
         * @default undefined
         */
        jsonArray!: unknown[];
        /**
         * Name of the property compared on every object
         * @default propName
         */
        property = "propName";
        /**
         * The value the property must equal exactly, same type included
         * @default undefined
         */
        match: unknown;
    }

    /**
     * Feeds `json.getValueOnProp` with the object to read and the top-level property to read from
     * it.
     */
    export class GetValueOnPropDto {
        constructor(json?: unknown, property?: string) {
            if (json !== undefined) { this.json = json; }
            if (property !== undefined) { this.property = property; }
        }
        /**
         * The object to read; it is not changed
         * @default undefined
         */
        json: unknown;
        /**
         * Name of the top-level property whose value comes back; a missing one gives undefined
         * @default propName
         */
        property = "propName";
    }

    /**
     * Feeds `json.setValue`: the JSON to copy and change, the JSONPath to the objects to change,
     * the property to set on each and the value it gets.
     */
    export class SetValueDto {
        constructor(json?: unknown, value?: unknown, path?: string, prop?: string) {
            if (json !== undefined) { this.json = json; }
            if (value !== undefined) { this.value = value; }
            if (path !== undefined) { this.path = path; }
            if (prop !== undefined) { this.prop = prop; }
        }
        /**
         * The object to change; it stays as it is and a changed copy comes back. A value that is
         * not an object throws an error
         * @default undefined
         */
        json: unknown;
        /**
         * What the property is set to on every matched object; any JSON-compatible value
         * @default undefined
         */
        value: unknown;
        /**
         * A JSONPath expression selecting the parent objects, such as `$.parts[*]`; the property is
         * set on each of them
         * @default $.pathToParent
         */
        path = "$.pathToParent";
        /**
         * Name of the property set on every object the path reaches
         * @default propertyName
         */
        prop = "propertyName";
    }

    /**
     * Feeds `json.setValuesOnPaths`: the JSON to copy and change and three lists of the same
     * length, where entry `i` of `paths`, `props` and `values` is one change.
     */
    export class SetValuesOnPathsDto {
        constructor(json?: unknown, values?: unknown[], paths?: string[], props?: string[]) {
            if (json !== undefined) { this.json = json; }
            if (values !== undefined) { this.values = values; }
            if (paths !== undefined) { this.paths = paths; }
            if (props !== undefined) { this.props = props; }
        }
        /**
         * The object to change; it stays as it is and a changed copy comes back
         * @default undefined
         */
        json: unknown;
        /**
         * The values to set, one per change, in the same order as `paths` and `props`
         * @default undefined
         */
        values!: unknown[];
        /**
         * One JSONPath expression per change, each selecting the parent objects, such as
         * `$.parts[*]`
         * @default undefined
         */
        paths!: string[];
        /**
         * One property name per change, set on every object its path reaches
         * @default undefined
         */
        props!: string[];
    }
    /**
     * Feeds `json.paths` with the JSON to search and the JSONPath expression whose matches are
     * reported as paths.
     */
    export class PathsDto {
        constructor(json?: unknown, query?: string) {
            if (json !== undefined) { this.json = json; }
            if (query !== undefined) { this.query = query; }
        }
        /**
         * The object or list to search; it is read, never changed
         * @default undefined
         */
        json: unknown;
        /**
         * A JSONPath expression starting at the root `$`; the result lists where its matches sit,
         * not their values
         * @default undefined
         */
        query!: string;
    }

    /**
     * Feeds `json.previewJson` and `json.previewAndSaveJson` with the value to show; an empty value
     * shows nothing.
     */
    export class JsonDto {
        constructor(json?: unknown) {
            if (json !== undefined) { this.json = json; }
        }
        /**
         * The value to show, normally an object or a list; nothing happens when it is empty
         * @default undefined
         */
        json: unknown;
    }
}
