import { Context } from "../context";
import * as Inputs from "../inputs/inputs";

/**
 * Contains various json path methods.
 * <div>
 *  <img src="../assets/images/blockly-images/math/math.svg" alt="Blockly Image"/>
 * </div>
 */
export class JSONBitByBit {

    constructor(private readonly context: Context) { }

    /**
     * Stringifies the input value
     * @param inputs a value to be stringified
     * @returns string
     * @group transform
     * @shortname stringify
     * @drawable false
     */
    stringify(inputs: Inputs.JSON.StringifyDto): string {
        return JSON.stringify(inputs.json);
    }

    /**
     * Parses the input value
     * @param inputs a value to be parsed
     * @returns any
     * @group transform
     * @shortname parse
     * @drawable false
     */
    parse(inputs: Inputs.JSON.ParseDto): any {
        return JSON.parse(inputs.text);
    }

    /**
     * Queries the input value
     * @param inputs a value to be queried
     * @returns any
     * @group jsonpath
     * @shortname query
     * @drawable false
     */
    query(inputs: Inputs.JSON.QueryDto): any {
        return this.context.jsonpath({ path: inputs.query, json: inputs.json });
    }

    /**
     * Sets value on given property of the given json
     * @param inputs a value to be added, json and a property name
     * @returns any
     * @group props
     * @shortname set value on property
     * @drawable false
     */
    setValueOnProp(inputs: Inputs.JSON.SetValueOnPropDto): any {
        // must be an object
        const clonedJson = { ...structuredClone(inputs.json) };
        clonedJson[inputs.property] = inputs.value;
        return clonedJson;
    }

    /**
     * Gets json from array by first property match. This is very simplistic search and only returns the first match.
     * If you need more complex search, you can use jsonpath query with filters.
     * @param inputs an array of json objects, a property name and a value to match
     * @returns any
     * @group props
     * @shortname get json from array by prop match
     * @drawable false
     */
    getJsonFromArrayByFirstPropMatch(inputs: Inputs.JSON.GetJsonFromArrayByFirstPropMatchDto): any {
        return inputs.jsonArray.find(j => j[inputs.property] === inputs.match);
    }

    /**
     * Gets value of the property in the given json
     * @param inputs a value to be added, json and a property name
     * @returns any
     * @group props
     * @shortname get value on property
     * @drawable false
     */
    getValueOnProp(inputs: Inputs.JSON.GetValueOnPropDto): any {
        // must be an object
        try {
            const clonedJson = { ...structuredClone(inputs.json) };
            return clonedJson[inputs.property];
        } catch (e) {
            return inputs.json[inputs.property];
        }
    }

    /**
     * Sets value to the json by providing a path
     * @param inputs a value to be added, json and a path
     * @returns any
     * @group jsonpath
     * @shortname set value on path
     * @drawable false
     */
    setValue(inputs: Inputs.JSON.SetValueDto): any {
        // must be an object
        if (inputs.json instanceof Object) {
            const clonedJson = { ...structuredClone(inputs.json) };

            const callback = (payload) => {
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
     * Sets multiple values to the json by providing paths
     * @param inputs a value to be added, json and a path
     * @returns any
     * @group jsonpath
     * @shortname set values on paths
     * @drawable false
     */
    setValuesOnPaths(inputs: Inputs.JSON.SetValuesOnPathsDto): any {
        // must be an object
        let clonedJson = { ...structuredClone(inputs.json) };
        inputs.paths.forEach((path, index) => {
            clonedJson = this.setValue({ json: clonedJson, path, value: inputs.values[index], prop: inputs.props[index] });
        });
        return clonedJson;
    }

    /**
     * Find paths to elements in object matching path expression
     * @param inputs a json value and a query
     * @returns any
     * @group jsonpath
     * @shortname paths
     * @drawable false
     */
    paths(inputs: Inputs.JSON.PathsDto): any {
        const paths = this.context.jsonpath({ json: inputs.json, path: inputs.query, resultType: "path" });
        return paths;
    }

    /**
     * Creates an empty JavaScript object
     * @returns any
     * @group create
     * @shortname empty
     * @drawable false
     */
    createEmpty(): any {
        return {};
    }

    /**
     * Previews json and gives option to save it
     * @returns any
     * @group preview
     * @shortname json preview and save
     * @drawable false
     */
    previewAndSaveJson(inputs: Inputs.JSON.JsonDto) {
        if (inputs.json) {
            this.context.promptPrintSave({ text: inputs.json, isJson: true, hidden: false });
        }
    }

    /**
     * Previews json
     * @returns any
     * @group preview
     * @shortname json preview
     * @drawable false
     */
    previewJson(inputs: Inputs.JSON.JsonDto) {
        if (inputs.json) {
            this.context.promptPrint({ text: inputs.json, isJson: true, hidden: false });
        }
    }
}
