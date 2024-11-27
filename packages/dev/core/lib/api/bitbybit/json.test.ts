import { ContextBase } from "../context";
import { JSONBitByBit } from "./json";
import { JSONPath } from "jsonpath-plus";

describe("JSON unit tests", () => {
    let json: JSONBitByBit;
    let context: ContextBase;
    beforeAll(() => {
        context = new ContextBase();
        context.jsonpath = JSONPath;
        context.promptPrintSave = jest.fn();
        context.promptPrint = jest.fn();
        json = new JSONBitByBit(context);
    });

    it("should stringify", () => {
        const result = json.stringify({ json: { a: 1 } });
        expect(result).toEqual("{\"a\":1}");
    });

    it("should parse", () => {
        const result = json.parse({ text: "{\"a\":1}" });
        expect(result).toEqual({ a: 1 });
    });

    it("should query", () => {
        const result = json.query({ json: { a: 1 }, query: "$.a" });
        expect(result).toEqual([1]);
    });

    it("should set value on the objects found by the path", () => {
        const result = json.setValue({ json: { a: 1 }, path: "$", value: 2, prop: "a" });
        expect(result).toEqual({ a: 2 });
    });

    it("should set value in deeper level", () => {
        const result = json.setValue({ json: { a: 1, b: { c: 2 } }, path: "$.b", value: 3, prop: "c" });
        expect(result).toEqual({ a: 1, b: { c: 3 } });
    });

    it("should set value in the array by using prop as an index", () => {
        const result = json.setValue({ json: { a: [1, 2, 3], b: { c: 2 } }, path: "$.a", value: 3, prop: "1" });
        expect(result).toEqual({ a: [1, 3, 3], b: { c: 2 } });
    });

    it("should throw if provided json is not an object", () => {
        expect(() => json.setValue({ json: 1, path: "$", value: 2, prop: "a" })).toThrowError("Json must be an object");
    });

    it("should create empty json", () => {
        const res = json.createEmpty();
        expect(res).toEqual({});
    });

    it("should find paths", () => {
        const result = json.paths({ json: getMockJSON(), query: "$..author" });
        expect(result).toEqual(
            [
                "$['store']['book'][0]['author']",
                "$['store']['book'][1]['author']",
                "$['store']['book'][2]['author']",
                "$['store']['book'][3]['author']",
            ]
        );
    });

    it("should not preview and save undefined json", () => {
        json.previewAndSaveJson({ json: undefined });
        expect(context.promptPrintSave).not.toHaveBeenCalled();
    });

    it("should not preview undefined json", () => {
        json.previewJson({ json: undefined });
        expect(context.promptPrint).not.toHaveBeenCalled();
    });

    it("should preview and save json", () => {
        json.previewAndSaveJson({ json: { a: 1 } });
        expect(context.promptPrintSave).toBeCalledWith({ text: { a: 1 }, isJson: true, hidden: false });
    });

    it("should preview json", () => {
        json.previewJson({ json: { a: 1 } });
        expect(context.promptPrint).toBeCalledWith({ text: { a: 1 }, isJson: true, hidden: false });
    });

    it("should set value on prop", () => {
        const result = json.setValueOnProp({ json: { a: 1 }, property: "b", value: 2 });
        expect(result).toEqual({ a: 1, b: 2 });
    });

    it("should get json from array by first prop match", () => {
        const result = json.getJsonFromArrayByFirstPropMatch({
            jsonArray: [{ a: 1 }, { a: 2 }, { a: 3 }],
            property: "a",
            match: 2
        });
        expect(result).toEqual({ a: 2 });
    });

    it("should get value on prop", () => {
        const result = json.getValueOnProp({ json: { a: 1, b: 3 }, property: "a" });
        expect(result).toEqual(1);
    });

    it("should get value on prop even if json is circular", () => {
        const circ = { a: 2 } as any;
        circ.circ = circ;
        const result = json.getValueOnProp({ json: circ, property: "a" });
        expect(result).toEqual(2);
    });

    it("should set values on paths", () => {
        const j = getMockJSON();
        const result = json.setValuesOnPaths({ json: j, paths: ["$.store", "$.store"], values: ["testValue", "categoryValue"], props: ["book", "bicycle"] });
        expect(result).toEqual({
            "store": {
                "book": "testValue",
                "bicycle": "categoryValue"
            }
        });
    });

    it("should find authors", () => {
        const j = getMockJSON();
        const result = json.query({ json: j, query: "$..author" });

        expect(result).toEqual(
            [
                "Nigel Rees",
                "Evelyn Waugh",
                "Herman Melville",
                "J. R. R. Tolkien",
            ]
        );
    });

    const getMockJSON = () => {
        return {
            "store": {
                "book": [
                    {
                        "category": "reference",
                        "author": "Nigel Rees",
                        "title": "Sayings of the Century",
                        "price": 8.95
                    }, {
                        "category": "fiction",
                        "author": "Evelyn Waugh",
                        "title": "Sword of Honour",
                        "price": 12.99
                    }, {
                        "category": "fiction",
                        "author": "Herman Melville",
                        "title": "Moby Dick",
                        "isbn": "0-553-21311-3",
                        "price": 8.99
                    }, {
                        "category": "fiction",
                        "author": "J. R. R. Tolkien",
                        "title": "The Lord of the Rings",
                        "isbn": "0-395-19395-8",
                        "price": 22.99
                    }
                ],
                "bicycle": {
                    "color": "red",
                    "price": 19.95
                }
            }
        };
    };

});

