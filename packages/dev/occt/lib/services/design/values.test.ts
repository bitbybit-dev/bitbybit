import { describe, it, expect } from "vitest";
import { DesignProblem, pointer } from "./problems";
import { countOf, directionOf, formatNumber, numberOf, parameterValues, parsed, pointOf, propertyValue, templatePieces, truthOf } from "./values";

const problemOf = (run: () => unknown): { path: string; message: string } => {
    try {
        run();
    } catch (error) {
        if (error instanceof DesignProblem) {
            return { path: error.path, message: error.message };
        }
        throw error;
    }
    throw new Error("nothing was thrown");
};

const valuesOf = (parameters: unknown, configurations?: unknown, configuration?: string, overrides?: Record<string, unknown>): Record<string, unknown> =>
    Object.fromEntries(parameterValues(parameters, configurations, { configuration, overrides }));

describe("design values", () => {
    describe("pointer", () => {
        it("should escape the two characters a JSON pointer reserves", () => {
            // Act
            const path = pointer("/parameters", "a/b~c", 3);

            // Assert
            expect(path).toBe("/parameters/a~1b~0c/3");
        });
    });

    describe("parameterValues", () => {
        it("should evaluate each expression after the parameters it reads, whatever the order they are declared in", () => {
            // Act
            const values = valuesOf({ area: "width * depth", depth: "width / 2", width: 10 });

            // Assert
            expect(values).toEqual({ configuration: "", area: 50, depth: 5, width: 10 });
        });

        it("should give only the configuration for a document without parameters", () => {
            // Act
            const values = valuesOf(undefined);

            // Assert
            expect(values).toEqual({ configuration: "" });
        });

        it("should read booleans as 1 and 0, choices and text as they are, and expressions over them", () => {
            // Act
            const values = valuesOf({
                holes: true,
                plain: { value: false },
                finish: { type: "choice", value: "anodized", options: [{ value: "raw" }, { value: "anodized", label: { en: "Anodized", de: "Eloxiert" } }] },
                engraving: { type: "text", value: "width * 2" },
                coated: "finish == 'anodized' && !plain",
                label: "if(holes, 'H', 'P')",
                width: { value: 10, unit: "mm", step: 5, group: "size", description: "The width", extras: { note: 1 }, extensions: { "acme.costing": { rate: 2 } } },
            });

            // Assert
            expect(values).toEqual({ configuration: "", holes: 1, plain: 0, finish: "anodized", engraving: "width * 2", coated: 1, label: "H", width: 10 });
        });

        it("should replace values by the chosen configuration's and then by overrides, each read as the parameter's own", () => {
            // Arrange
            const parameters = { width: { value: 10, min: 5, max: 100 }, depth: "width / 2", holes: true };
            const configurations = [{ id: "small", values: { width: 20 } }, { id: "large", values: { width: 80, depth: "width / 4", holes: false } }];

            // Act
            const large = valuesOf(parameters, configurations, "large");
            const overridden = valuesOf(parameters, configurations, "large", { width: 40, holes: "width > 50" });
            const plain = valuesOf(parameters, configurations, undefined, { depth: 1 });

            // Assert
            expect(large).toEqual({ configuration: "large", width: 80, depth: 20, holes: 0 });
            expect(overridden).toEqual({ configuration: "large", width: 40, depth: 10, holes: 0 });
            expect(plain).toEqual({ configuration: "", width: 10, depth: 1, holes: 1 });
        });

        it("should let expressions read which configuration is chosen", () => {
            // Act
            const values = valuesOf({ size: "if(configuration == 'large', 80, 20)" }, [{ id: "large", values: {} }], "large");

            // Assert
            expect(values["size"]).toBe(80);
        });

        it("should refuse parameters it cannot read, at their path", () => {
            // Act
            const problems = [
                problemOf(() => valuesOf([])),
                problemOf(() => valuesOf({ "2x": 1 })),
                problemOf(() => valuesOf({ configuration: 1 })),
                problemOf(() => valuesOf({ width: [1] })),
                problemOf(() => valuesOf({ width: { value: 1, colour: "red" } })),
                problemOf(() => valuesOf({ width: { value: 1, type: "integer" } })),
                problemOf(() => valuesOf({ width: { value: true, type: "boolean", min: 0 } })),
                problemOf(() => valuesOf({ width: { value: 1, min: "0" } })),
                problemOf(() => valuesOf({ width: { value: 1, min: 5, max: 2 } })),
                problemOf(() => valuesOf({ width: { value: 1, options: [{ value: "a" }] } })),
                problemOf(() => valuesOf({ finish: { type: "choice", value: "a", options: [] } })),
                problemOf(() => valuesOf({ finish: { type: "choice", value: "a", options: ["a"] } })),
                problemOf(() => valuesOf({ finish: { type: "choice", value: "a", options: [{ value: "a", note: 1 }] } })),
                problemOf(() => valuesOf({ finish: { type: "choice", value: "a", options: [{ value: "a" }, { value: "a" }] } })),
                problemOf(() => valuesOf({ finish: { type: "choice", value: "b", options: [{ value: "a" }] } })),
                problemOf(() => valuesOf({ width: { value: 1, unit: 3 } })),
                problemOf(() => valuesOf({ width: { value: 1, label: { english: "Width" } } })),
                problemOf(() => valuesOf({ width: { value: 1, label: {} } })),
                problemOf(() => valuesOf({ name: { type: "text", value: 3 } })),
                problemOf(() => valuesOf({ holes: { type: "boolean", value: [1] } })),
                problemOf(() => valuesOf({ width: { value: true, type: "number" } })),
                problemOf(() => valuesOf({ width: { value: 1, extensions: { costing: {} } } })),
                problemOf(() => valuesOf({ width: { value: 1, extensions: { "acme.costing": 1 } } })),
                problemOf(() => valuesOf({ width: { value: 1, extensions: [] } })),
            ];

            // Assert
            expect(problems).toEqual([
                { path: "/parameters", message: "parameters is an object of named values" },
                { path: "/parameters/2x", message: "\"2x\" is not a parameter name: use letters, digits and _, not starting with a digit" },
                { path: "/parameters/configuration", message: "\"configuration\" is reserved: pi, tau, e, true, false, inf, nan, if, configuration cannot name parameters" },
                { path: "/parameters/width", message: "a parameter is a number, a boolean, an expression or { value, type, ... }" },
                { path: "/parameters/width/colour", message: "\"colour\" is not a property here: use value, type, unit, min, max, step, options, label, description, group, extras, extensions" },
                { path: "/parameters/width/type", message: "one of number, boolean, choice, text is expected" },
                { path: "/parameters/width/min", message: "min is for number parameters" },
                { path: "/parameters/width/min", message: "min is a finite number" },
                { path: "/parameters/width/max", message: "the maximum 2 is below the minimum 5" },
                { path: "/parameters/width/options", message: "options are for choice parameters" },
                { path: "/parameters/finish/options", message: "options is a list of { value, label? }" },
                { path: "/parameters/finish/options/0", message: "an option is { value, label? }" },
                { path: "/parameters/finish/options/0/note", message: "\"note\" is not a property here: use value, label" },
                { path: "/parameters/finish/options", message: "\"a\" is an option twice" },
                { path: "/parameters/finish", message: "\"b\" is not one of the options: a" },
                { path: "/parameters/width/unit", message: "unit is text" },
                { path: "/parameters/width/label/english", message: "\"english\" is not a locale code with text, such as \"en\" or \"pt-BR\"" },
                { path: "/parameters/width/label", message: "a label is text, or text by locale code such as { \"en\": \"Width\" }" },
                { path: "/parameters/name", message: "the value is text" },
                { path: "/parameters/holes", message: "true, false, a number or an expression is expected" },
                { path: "/parameters/width", message: "a number or an expression is expected" },
                { path: "/parameters/width/extensions/costing", message: "\"costing\" is not a namespaced name such as \"acme.costing\"" },
                { path: "/parameters/width/extensions/acme.costing", message: "an extension is an object" },
                { path: "/parameters/width/extensions", message: "extensions is an object of namespaced names" },
            ]);
        });

        it("should refuse values outside their limits, of the wrong kind, unknown names and cycles", () => {
            // Arrange
            const limited = { width: { value: 10, min: 5, max: 50 } };

            // Act
            const problems = [
                problemOf(() => valuesOf(limited, undefined, undefined, { width: 60 })),
                problemOf(() => valuesOf(limited, undefined, undefined, { width: 1 })),
                problemOf(() => valuesOf(limited, [{ id: "big", values: { width: 70 } }], "big")),
                problemOf(() => valuesOf(limited, [{ id: "big", values: { depth: 1 } }], "big")),
                problemOf(() => valuesOf(limited, [{ id: "big", values: [] }], "big")),
                problemOf(() => valuesOf(limited, [], "big")),
                problemOf(() => valuesOf(limited, undefined, undefined, { depth: 2 })),
                problemOf(() => valuesOf(limited, undefined, undefined, { width: Number.NaN })),
                problemOf(() => valuesOf({ width: { value: "'wide'" } })),
                problemOf(() => valuesOf({ width: "depth + 1" })),
                problemOf(() => valuesOf({ a: "b + 1", b: "a + 1" })),
                problemOf(() => valuesOf({ width: "1 / 0" })),
                problemOf(() => valuesOf({ width: "1 +" })),
            ];

            // Assert
            expect(problems).toEqual([
                { path: "/parameters/width", message: "\"width\" is 60, above its maximum 50" },
                { path: "/parameters/width", message: "\"width\" is 1, below its minimum 5" },
                { path: "/configurations/0/values/width", message: "\"width\" is 70, above its maximum 50" },
                { path: "/configurations/0/values/depth", message: "\"depth\" is not a parameter of this document" },
                { path: "/configurations/0/values", message: "values is an object of parameter values" },
                { path: "/configurations", message: "\"big\" is not a configuration of this document" },
                { path: "/parameters/depth", message: "\"depth\" is not a parameter of this document" },
                { path: "/parameters/width", message: "the value is a finite number" },
                { path: "/parameters/width", message: "\"width\" is a number parameter and its expression gives text" },
                { path: "/parameters/width", message: "\"depth\" is not a parameter" },
                { path: "/parameters/a", message: "\"a\" depends on itself" },
                { path: "/parameters/width", message: "\"/\" gives Infinity, not a finite number" },
                { path: "/parameters/width", message: "the expression ends too soon (at character 4 of \"1 +\")" },
            ]);
        });
    });

    describe("numbers, points, switches and counts", () => {
        const parameters = new Map<string, number | string>([["size", 4], ["finish", "raw"]]);

        it("should refuse a count above its most, and a document with more parameters than the limit", () => {
            // Arrange
            const many = Object.fromEntries(Array.from({ length: 1001 }, (_, index) => [`p${index}`, index]));

            // Act
            const tooMany = problemOf(() => countOf("10^9", parameters, "/features/2/count", 2, 1000));
            const atMost = countOf(1000, parameters, "/features/2/count", 2, 1000);
            const parametersProblem = problemOf(() => parameterValues(many, undefined, {}));

            // Assert
            expect(tooMany).toEqual({ path: "/features/2/count", message: "a count of at most 1000 is expected, not 1000000000" });
            expect(atMost).toBe(1000);
            expect(parametersProblem).toEqual({ path: "/parameters", message: "a document declares at most 1000 parameters" });
        });

        it("should read numbers as they are and strings as expressions over the parameters", () => {
            // Act
            const values = [numberOf(3, parameters, "/x"), numberOf("size * 2", parameters, "/x"), ...pointOf([1, "size", "-size"], parameters, "/p"), countOf("size - 1", parameters, "/c", 2)];
            const switches = [truthOf(true, parameters, "/s"), truthOf("finish == 'raw'", parameters, "/s"), truthOf(0, parameters, "/s")];

            // Assert
            expect(values).toEqual([3, 8, 1, 4, -4, 3]);
            expect(switches).toEqual([true, true, false]);
        });

        it("should refuse what is not a number, a point, a direction or a count, at its path", () => {
            // Act
            const problems = [
                problemOf(() => numberOf(Number.NaN, parameters, "/x")),
                problemOf(() => numberOf(true, parameters, "/x")),
                problemOf(() => numberOf("other", parameters, "/x")),
                problemOf(() => numberOf("finish", parameters, "/x")),
                problemOf(() => pointOf([1, 2], parameters, "/p")),
                problemOf(() => pointOf([1, 2, "nope"], parameters, "/p")),
                problemOf(() => directionOf([0, "size - 4", 0], parameters, "/d")),
                problemOf(() => countOf(2.5, parameters, "/c", 1)),
                problemOf(() => countOf("size - 3", parameters, "/c", 2)),
            ];

            // Assert
            expect(problems).toEqual([
                { path: "/x", message: "the value is a finite number" },
                { path: "/x", message: "a number or an expression is expected" },
                { path: "/x", message: "\"other\" is not a parameter" },
                { path: "/x", message: "a number is expected, and the expression gives text" },
                { path: "/p", message: "a point or vector is three numbers or expressions" },
                { path: "/p/2", message: "\"nope\" is not a parameter" },
                { path: "/d", message: "the direction has no length" },
                { path: "/c", message: "a whole number of at least 1 is expected, not 2.5" },
                { path: "/c", message: "a whole number of at least 2 is expected, not 1" },
            ]);
        });

        it("should parse an expression into its tree", () => {
            // Act
            const tree = parsed("size", "/x");

            // Assert
            expect(tree).toEqual({ kind: "name", name: "size" });
        });
    });

    describe("properties", () => {
        const parameters = new Map<string, number | string>([["width", 40], ["finish", "raw"], ["third", 1 / 3]]);

        it("should fill templates with expression values, write braces from doubled ones and keep other values", () => {
            // Act
            const values = [
                propertyValue("BRK-{width}x{width / 2}-{finish}", parameters, "/p"),
                propertyValue("{{literal}} {third * 3} {0.1 + 0.2}", parameters, "/p"),
                propertyValue(12.5, parameters, "/p"),
                propertyValue(false, parameters, "/p"),
                propertyValue({ expr: "width * 2" }, parameters, "/p"),
                propertyValue("", parameters, "/p"),
            ];

            // Assert
            expect(values).toEqual(["BRK-40x20-raw", "{literal} 1 0.3", 12.5, false, 80, ""]);
        });

        it("should refuse templates with unmatched braces and values that are not properties", () => {
            // Act
            const problems = [
                problemOf(() => propertyValue("a {width", parameters, "/p")),
                problemOf(() => propertyValue("a } b", parameters, "/p")),
                problemOf(() => propertyValue("{nope}", parameters, "/p")),
                problemOf(() => propertyValue([1], parameters, "/p")),
                problemOf(() => propertyValue({ expr: "finish" }, parameters, "/p")),
                problemOf(() => propertyValue(Number.POSITIVE_INFINITY, parameters, "/p")),
            ];

            // Assert
            expect(problems).toEqual([
                { path: "/p", message: "the { at character 3 has no closing }" },
                { path: "/p", message: "the } at character 3 has no opening {: write }} for a brace" },
                { path: "/p", message: "\"nope\" is not a parameter" },
                { path: "/p", message: "a property is text, a number, a boolean or { \"expr\": \"...\" }" },
                { path: "/p/expr", message: "a number is expected, and the expression gives text" },
                { path: "/p", message: "the value is a finite number" },
            ]);
        });

        it("should split a template into its text and expressions", () => {
            // Act
            const pieces = templatePieces("a{x}{{b}}{y}", "/p");

            // Assert
            expect(pieces).toEqual([{ text: "a" }, { expression: "x" }, { text: "{b}" }, { expression: "y" }]);
        });

        it("should write numbers with at most twelve significant digits", () => {
            // Act
            const written = [formatNumber(0.1 + 0.2), formatNumber(1 / 3), formatNumber(1e21), formatNumber(-0)];

            // Assert
            expect(written).toEqual(["0.3", "0.333333333333", "1e+21", "0"]);
        });
    });
});
