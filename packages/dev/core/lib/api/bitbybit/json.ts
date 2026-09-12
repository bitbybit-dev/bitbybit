import { ContextBase } from "../context";
import * as Inputs from "../inputs";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const asJsonInput = (value: unknown): null | boolean | number | string | object => {
    if (value === null || typeof value === "object" || typeof value === "string"
        || typeof value === "number" || typeof value === "boolean") {
        return value;
    }
    return null;
};

/**
 * Reading and changing values inside JSON data. A path such as `$.parts[0].name` follows the
 * JSONPath syntax: `$` is the root, `.name` steps into a property, `[0]` into a list entry and
 * `..name` searches at any depth. The methods here query, set and list by path, work on single
 * properties and preview data through the application; every change comes back as a changed copy,
 * the input stays as it is.
 */
export class JSONBitByBit {

    constructor(private readonly context: ContextBase) { }

    /**
     * Turns any JSON-compatible value into its JSON text, on one line without indentation, as
     * `JSON.stringify` does.
     * @param inputs - The value to write as text
     * @returns The JSON text
     * @group transform
     * @shortname stringify
     * @drawable false
     * @example
     * ```typescript
     * const text = bitbybit.json.stringify({ json: { width: 10, points: [[0, 0, 0], [1, 1, 1]] } });
     * ```
     */
    stringify(inputs: Inputs.JSON.StringifyDto): string {
        return JSON.stringify(inputs.json);
    }

    /**
     * Turns JSON text into the value it describes, as `JSON.parse` does; text that is not valid
     * JSON throws an error.
     * @param inputs - The JSON text
     * @returns The parsed value
     * @group transform
     * @shortname parse
     * @drawable false
     * @example
     * ```typescript
     * const points = bitbybit.json.parse({ text: "[[0, 0, 0], [1, 1, 1]]" });
     * ```
     */
    parse(inputs: Inputs.JSON.ParseDto): any {
        return JSON.parse(inputs.text);
    }

    /**
     * Finds every value in the JSON that a JSONPath expression matches and gives them as a list,
     * even when there is only one.
     *
     * `$.parts[*].name` lists all part names and `$..radius` every radius at any depth; JSONPath
     * filters in square brackets narrow the matches by a condition.
     * @param inputs - The JSON and the JSONPath expression
     * @returns The matching values as a list
     * @group jsonpath
     * @shortname query
     * @drawable false
     * @example
     * ```typescript
     * const names = bitbybit.json.query({ json: model, query: "$.parts[*].name" });
     * ```
     */
    query(inputs: Inputs.JSON.QueryDto): any {
        return this.context.jsonpath({ path: inputs.query, json: asJsonInput(inputs.json) });
    }

    /**
     * Sets one top-level property of a JSON object to a value, giving a changed copy; the input
     * stays as it is and a property that did not exist is added.
     * @param inputs - The JSON object, the property name and the value
     * @returns The changed copy
     * @group props
     * @shortname set value on property
     * @drawable false
     * @example
     * ```typescript
     * const updated = bitbybit.json.setValueOnProp({ json: settings, property: "width", value: 20 });
     * ```
     */
    setValueOnProp(inputs: Inputs.JSON.SetValueOnPropDto): any {
        const clonedJson = { ...structuredClone(inputs.json) as Record<string, unknown> };
        clonedJson[inputs.property] = inputs.value;
        return clonedJson;
    }

    /**
     * Finds the first object in a list whose property equals the given value, comparing with strict
     * equality, and gives it back; nothing matching gives undefined.
     *
     * For anything beyond one property, use `query` with a filter.
     * @param inputs - The list of objects, the property name and the value to match
     * @returns The first matching object, or undefined
     * @group props
     * @shortname get json from array by prop match
     * @drawable false
     * @example
     * ```typescript
     * const part = bitbybit.json.getJsonFromArrayByFirstPropMatch({ jsonArray: parts, property: "name", match: "lid" });
     * ```
     */
    getJsonFromArrayByFirstPropMatch(inputs: Inputs.JSON.GetJsonFromArrayByFirstPropMatchDto): any {
        return inputs.jsonArray.find(j => isRecord(j) && j[inputs.property] === inputs.match);
    }

    /**
     * Reads one top-level property of a JSON object; a missing property gives undefined.
     * @param inputs - The JSON object and the property name
     * @returns The property's value
     * @group props
     * @shortname get value on property
     * @drawable false
     * @example
     * ```typescript
     * const width = bitbybit.json.getValueOnProp({ json: settings, property: "width" });
     * ```
     */
    getValueOnProp(inputs: Inputs.JSON.GetValueOnPropDto): any {
        try {
            const clonedJson = { ...structuredClone(inputs.json) as Record<string, unknown> };
            return clonedJson[inputs.property];
        } catch {
            return (inputs.json as Record<string, unknown>)[inputs.property];
        }
    }

    /**
     * Sets property `prop` to `value` on every object a JSONPath expression reaches, giving a
     * changed copy of the JSON.
     *
     * `path` points at the parent objects, `prop` names the property on them: `path: "$.parts[*]",
     * prop: "visible"` changes every part. A value that is not an object throws an error.
     * @param inputs - The JSON, the path to the parent objects, the property name and the value
     * @returns The changed copy
     * @group jsonpath
     * @shortname set value on path
     * @drawable false
     * @example
     * ```typescript
     * const hidden = bitbybit.json.setValue({ json: model, path: "$.parts[*]", prop: "visible", value: false });
     * ```
     */
    setValue(inputs: Inputs.JSON.SetValueDto): any {
        if (inputs.json instanceof Object) {
            const clonedJson = { ...structuredClone(inputs.json) };

            const callback = (payload: Record<string, unknown>) => {
                payload[inputs.prop] = inputs.value;
                return payload;
            };
            this.context.jsonpath({
                path: inputs.path,
                json: clonedJson,
                callback
            });
            return clonedJson;
        }
        else {
            throw new Error("Json must be an object");
        }
    }

    /**
     * Applies several `setValue` changes in one go: entry `i` of `paths`, `props` and `values` is
     * one change, applied in order to a copy of the JSON.
     * @param inputs - The JSON and the matching lists of paths, property names and values
     * @returns The changed copy
     * @group jsonpath
     * @shortname set values on paths
     * @drawable false
     * @example
     * ```typescript
     * const updated = bitbybit.json.setValuesOnPaths({ json: model, paths: ["$", "$.parts[0]"], props: ["name", "visible"], values: ["Assembly", false] });
     * ```
     */
    setValuesOnPaths(inputs: Inputs.JSON.SetValuesOnPathsDto): any {
        let clonedJson = { ...structuredClone(inputs.json) as Record<string, unknown> };
        inputs.paths.forEach((path, index) => {
            clonedJson = this.setValue({ json: clonedJson, path, value: inputs.values[index], prop: inputs.props[index]! });
        });
        return clonedJson;
    }

    /**
     * Lists the paths of every value a JSONPath expression matches, each as a full path from the
     * root such as `$['parts'][0]['name']`, instead of the values themselves.
     * @param inputs - The JSON and the JSONPath expression
     * @returns The paths of the matches, as a list of strings
     * @group jsonpath
     * @shortname paths
     * @drawable false
     * @example
     * ```typescript
     * const where = bitbybit.json.paths({ json: model, query: "$..radius" });
     * ```
     */
    paths(inputs: Inputs.JSON.PathsDto): any {
        const paths = this.context.jsonpath({ json: asJsonInput(inputs.json), path: inputs.query, resultType: "path" });
        return paths;
    }

    /**
     * Gives a new empty object with no properties, a starting point for `setValueOnProp` and
     * `setValue`.
     * @returns An empty object
     * @group create
     * @shortname empty
     * @drawable false
     * @example
     * ```typescript
     * const settings = bitbybit.json.createEmpty();
     * const withWidth = bitbybit.json.setValueOnProp({ json: settings, property: "width", value: 10 });
     * ```
     */
    createEmpty(): any {
        return {};
    }

    /**
     * Hands the JSON to the running application to show it and offer to save it as a file; the
     * application decides how the preview looks, and nothing happens when the value is empty.
     * @param inputs - The JSON to show
     * @returns Nothing
     * @group preview
     * @shortname json preview and save
     * @drawable false
     * @example
     * ```typescript
     * bitbybit.json.previewAndSaveJson({ json: model });
     * ```
     */
    previewAndSaveJson(inputs: Inputs.JSON.JsonDto) {
        if (inputs.json) {
            this.context.promptPrintSave({ text: inputs.json, isJson: true, hidden: false });
        }
    }

    /**
     * Hands the JSON to the running application to show it; the application decides how the preview
     * looks, and nothing happens when the value is empty.
     * @param inputs - The JSON to show
     * @returns Nothing
     * @group preview
     * @shortname json preview
     * @drawable false
     * @example
     * ```typescript
     * bitbybit.json.previewJson({ json: model });
     * ```
     */
    previewJson(inputs: Inputs.JSON.JsonDto) {
        if (inputs.json) {
            this.context.promptPrint({ text: inputs.json, isJson: true, hidden: false });
        }
    }
}
