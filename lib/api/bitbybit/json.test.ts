import { Context } from "../context";
import { JSONBitByBit } from "./json";
import { JSONPath } from "jsonpath-plus";

describe("JSON unit tests", () => {
    let json: JSONBitByBit;

    beforeAll(async () => {
        const context = new Context();
        context.jsonpath = JSONPath;
        json = new JSONBitByBit(context);
    });

    it("should stringify", async () => {
        const result = json.stringify({ json: { a: 1 } });
        expect(result).toEqual("{\"a\":1}");
    });

    it("should parse", async () => {
        const result = json.parse({ text: "{\"a\":1}" });
        expect(result).toEqual({ a: 1 });
    });

    it("should query", async () => {
        const result = json.query({ json: { a: 1 }, query: "$.a" });
        expect(result).toEqual([1]);
    });

    it("should set value on the objects found by the path", async () => {
        const result = json.setValue({ json: { a: 1 }, path: "$", value: 2, prop: "a" });
        expect(result).toEqual({ a: 2 });
    });

    it("should set value in deeper level", async () => {
        const result = json.setValue({ json: { a: 1, b: { c: 2 } }, path: "$.b", value: 3, prop: "c" });
        expect(result).toEqual({ a: 1, b: { c: 3 } });
    });

    it("should set value in the array by using prop as an index", async () => {
        const result = json.setValue({ json: { a: [1, 2, 3], b: { c: 2 } }, path: "$.a", value: 3, prop: "1" });
        expect(result).toEqual({ a: [1, 3, 3], b: { c: 2 } });
    });

    it("should find paths", async () => {
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

    it("should find authors", async () => {
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

