import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import type { DtoConstraints, NumberBounds } from "./constraints";
import { constraintKinds as k } from "./constraints";
import type { InputIssue, InputIssueReport } from "./input-validation";
import { checkStructure, prepareKernelCall, reportInputIssues, ruleBook, setInputIssueSink, unknownProperties, validateInputs } from "./input-validation";
import { custom, defineRules, lessThan } from "./input-rules";
import type { DtoRegistry } from "./resolve-dto";

class BoxDto {
    width?: number | undefined = 1;
    center?: [number, number, number] | undefined = [0, 0, 0];
}

const BOX: DtoConstraints = { width: k.number, center: k.point3 };
const HEX_MESSAGE = "must be a hex color such as #ff0000";

describe("checkStructure", () => {
    it("should pass inputs whose every property is of its kind", () => {
        // Act
        const issues = checkStructure({ width: k.number, flag: k.boolean, name: k.string, colour: k.color, corner: k.point2, up: k.vector3, side: k.vector2, points: k.list(k.point3), mode: k.oneOf(["a", "b"]), shape: k.opaque }, {
            width: 2, flag: true, name: "box", colour: "#ff0000", corner: [0, 1], up: [0, 1, 0], side: [1, 0], points: [[0, 0, 0], [1, 1, 1]], mode: "b", shape: { hash: 1 },
        });

        // Assert
        expect(issues).toEqual([]);
    });

    it.each([
        ["a number given as text", k.number, "2", "type", "must be a number"],
        ["a number that is NaN", k.number, NaN, "not-a-number", "is not a number (NaN)"],
        ["a flag given as a number", k.boolean, 1, "type", "must be true or false"],
        ["text given as a number", k.string, 1, "type", "must be text"],
        ["a color that is not hex", k.color, "red", "color", HEX_MESSAGE],
        ["a color that is not text", k.color, 5, "color", HEX_MESSAGE],
        ["a point that is not a list", k.point3, "0,0,0", "type", "must be a list of 3 numbers"],
        ["a point with two coordinates", k.point3, [0, 0], "arity", "must have 3 numbers, not 2"],
        ["a point with a coordinate that is not a number", k.point3, [0, "1", 0], "type", "must be a list of 3 numbers"],
        ["a point with a NaN coordinate", k.vector3, [0, NaN, 0], "type", "must be a list of 3 numbers"],
        ["a flat point with three coordinates", k.point2, [0, 0, 0], "arity", "must have 2 numbers, not 3"],
        ["a flat vector with three coordinates", k.vector2, [0, 0, 0], "arity", "must have 2 numbers, not 3"],
        ["a vector with two coordinates", k.vector3, [0, 0], "arity", "must have 3 numbers, not 2"],
        ["a point of either kind with four coordinates", k.point, [0, 0, 0, 0], "arity", "must have 2 or 3 numbers, not 4"],
        ["a point of either kind with one coordinate", k.point, [0], "arity", "must have 2 or 3 numbers, not 1"],
        ["a point of either kind with no coordinates", k.point, [], "arity", "must have 2 or 3 numbers, not 0"],
        ["a point of either kind that is not a list", k.point, 5, "type", "must be a list of 2 or 3 numbers"],
        ["a list that is not one", k.list(k.number), 3, "type", "must be a list"],
        ["a list given as an object", k.list(k.number), { 0: 1, length: 1 }, "type", "must be a list"],
        ["a value its enum does not list", k.oneOf(["a", "b"]), "c", "enum", "must be one of a, b"],
        ["a value of another type than its enum's", k.oneOf(["1", "2"]), 1, "enum", "must be one of 1, 2"],
    ])("should report %s", (_what, constraint, value, code, message) => {
        // Act
        const issues = checkStructure({ value: constraint }, { value });

        // Assert
        expect(issues.map((found) => [found.property, found.code, found.message])).toEqual([["value", code, message]]);
    });

    it.each(["#ff0000", "#FF00AA", "#AbCdEf", "#000000"])("should take %s as a hex color", (colour) => {
        expect(checkStructure({ colour: k.color }, { colour })).toEqual([]);
    });

    it.each([
        ["one without the hash", "ff0000"],
        ["one of three digits", "#f00"],
        ["one of four digits", "#f00a"],
        ["one of eight digits", "#ff000080"],
        ["one of five digits", "#ff00f"],
        ["one of seven digits", "#ff0000f"],
        ["one of nine digits", "#ff0000ff0"],
        ["one with a letter that is not hex", "#gg0000"],
        ["one with text before it", "x#ff0000"],
        ["one with text after it", "#ff0000x"],
        ["one with a space after it", "#ff0000 "],
        ["a list holding one", ["#ff0000"]],
    ])("should report %s as not a hex color", (_what, colour) => {
        expect(checkStructure({ colour: k.color }, { colour })).toEqual([{ property: "colour", code: "color", message: HEX_MESSAGE }]);
    });

    it.each<[string, NumberBounds, number, string, string, number, boolean]>([
        ["below an inclusive minimum", { min: 0 }, -1, "minimum", "must be at least 0", 0, false],
        ["on an exclusive minimum", { min: 0, exclusiveMin: true }, 0, "minimum", "must be above 0", 0, true],
        ["above an inclusive maximum", { max: 1 }, 2, "maximum", "must be at most 1", 1, false],
        ["on an exclusive maximum", { max: 90, exclusiveMax: true }, 90, "maximum", "must be below 90", 90, true],
        ["below the minimum of a range", { min: 2, max: 5 }, 1, "minimum", "must be at least 2", 2, false],
        ["above the maximum of a range", { min: 2, max: 5 }, 6, "maximum", "must be at most 5", 5, false],
        ["that is infinite above a maximum", { max: 1 }, Infinity, "maximum", "must be at most 1", 1, false],
        ["that is infinite below a minimum", { min: 0 }, -Infinity, "minimum", "must be at least 0", 0, false],
    ])("should report a number %s", (_what, bounds, value, code, message, limit, exclusive) => {
        // Act
        const issues = checkStructure({ value: k.between(k.number, bounds) }, { value });

        // Assert
        expect(issues).toEqual([{ property: "value", code, message, params: { limit, exclusive, actual: value } }]);
    });

    it("should pass numbers within their bounds, the inclusive limits included, and the items of a bounded list", () => {
        // Act
        const issues = checkStructure({ a: k.between(k.number, { min: 0, max: 1 }), b: k.between(k.number, { min: 0, max: 1 }), c: k.between(k.number, { min: 0, exclusiveMin: true }), list: k.list(k.between(k.number, { min: 0 })) }, { a: 0, b: 1, c: 0.1, list: [0, 2] });

        // Assert
        expect(issues).toEqual([]);
    });

    it("should pass a number just inside an exclusive maximum", () => {
        expect(checkStructure({ angle: k.between(k.number, { max: 90, exclusiveMax: true }) }, { angle: 89.99 })).toEqual([]);
    });

    it("should pass an infinite number when no bound limits it", () => {
        expect(checkStructure({ value: k.number, above: k.between(k.number, { min: 0 }) }, { value: -Infinity, above: Infinity })).toEqual([]);
    });

    it("should report the item of a bounded list that falls outside", () => {
        // Act
        const [found] = checkStructure({ list: k.list(k.between(k.number, { min: 0 })) }, { list: [1, -1] });

        // Assert
        expect(found?.message).toBe("item 1 must be at least 0");
    });

    it("should take a point of either kind with two or three coordinates", () => {
        // Act
        const issues = checkStructure({ flat: k.point, spatial: k.point }, { flat: [1, 2], spatial: [1, 2, 3] });

        // Assert
        expect(issues).toEqual([]);
    });

    it("should say that a point of either kind takes two or three coordinates", () => {
        // Act
        const issues = checkStructure({ corner: k.point }, { corner: [0, 0, 0, 0] });

        // Assert
        expect(issues).toEqual([{ property: "corner", code: "arity", message: "must have 2 or 3 numbers, not 4", params: { expected: [2, 3], actual: 4 } }]);
    });

    it("should report a point with a coordinate that is not a number without params", () => {
        // Act
        const issues = checkStructure({ center: k.point3 }, { center: [0, "1", 0] });

        // Assert
        expect(issues).toEqual([{ property: "center", code: "type", message: "must be a list of 3 numbers" }]);
    });

    it("should report a required property left out, and take null for left out", () => {
        // Act
        const issues = checkStructure({ shape: k.required(k.opaque), other: k.required(k.number), optional: k.number, optionalNull: k.number }, { other: null, optionalNull: null });

        // Assert
        expect(issues).toEqual([{ property: "shape", code: "required", message: "is required" }, { property: "other", code: "required", message: "is required" }]);
    });

    it("should name the item of a list that fails, and where it is", () => {
        // Act
        const issues = checkStructure({ points: k.list(k.point3) }, { points: [[0, 0, 0], [1, 1]] });

        // Assert
        expect(issues).toEqual([{ property: "points", code: "arity", message: "item 1 must have 3 numbers, not 2", params: { expected: 3, actual: 2, index: 1 } }]);
    });

    it("should report only the first item of a list that fails, with its index as the only param", () => {
        // Act
        const issues = checkStructure({ sizes: k.list(k.number) }, { sizes: [1, 2, "3", "4"] });

        // Assert
        expect(issues).toEqual([{ property: "sizes", code: "type", message: "item 2 must be a number", params: { index: 2 } }]);
    });

    it("should report an item of a list that is left out", () => {
        // Act
        const issues = checkStructure({ sizes: k.list(k.number) }, { sizes: [1, null] });

        // Assert
        expect(issues).toEqual([{ property: "sizes", code: "required", message: "item 1 is required", params: { index: 1 } }]);
    });

    it("should let a list whose items are optional hold items that are left out, and still check the others", () => {
        // Act
        const free = checkStructure({ tangents: k.list(k.optional(k.vector3)) }, { tangents: [[1, 0, 0], undefined, null, [0, 1, 0]] });
        const wrong = checkStructure({ tangents: k.list(k.optional(k.vector3)) }, { tangents: [undefined, [1, 0]] });

        // Assert
        expect(free).toEqual([]);
        expect(wrong).toEqual([{ property: "tangents", code: "arity", message: "item 1 must have 3 numbers, not 2", params: { index: 1, expected: 3, actual: 2 } }]);
    });

    it("should take a typed array as a list and not look into it", () => {
        // Act
        const issues = checkStructure({ values: k.list(k.number), points: k.list(k.point3), plain: { kind: "list" } }, { values: new Float32Array([1, 2]), points: new Float64Array([1, 2]), plain: [1, "2"] });

        // Assert
        expect(issues).toEqual([]);
    });

    it("should not look into a list whose items have no constraint", () => {
        expect(checkStructure({ anything: { kind: "list" } }, { anything: [undefined, null] })).toEqual([]);
    });

    it("should report the required properties of inputs that are not an object", () => {
        // Act
        const issues = checkStructure({ width: k.required(k.number) }, 5);

        // Assert
        expect(issues.map((found) => found.code)).toEqual(["required"]);
    });

    it("should report the required properties of inputs that are null", () => {
        expect(checkStructure({ width: k.required(k.number) }, null)).toEqual([{ property: "width", code: "required", message: "is required" }]);
    });

    it("should not read the properties of a list given in place of the inputs", () => {
        // Act
        const issues = checkStructure({ width: k.required(k.number), length: k.required(k.number) }, [1, 2]);

        // Assert
        expect(issues.map((found) => [found.property, found.code])).toEqual([["width", "required"], ["length", "required"]]);
    });

    it("should say which values an enum allows", () => {
        // Act
        const [found] = checkStructure({ mode: k.oneOf(["a", "b"]) }, { mode: "c" });

        // Assert
        expect(found?.message).toBe("must be one of a, b");
        expect(found?.params).toEqual({ allowed: ["a", "b"] });
    });

    it("should report an enum without values as allowing nothing", () => {
        // Act
        const [found] = checkStructure({ mode: { kind: "oneOf" } }, { mode: "a" });

        // Assert
        expect(found?.message).toBe("must be one of ");
    });
});

describe("validateInputs", () => {
    const registry: DtoRegistry = {
        "shapes.box": { dto: BoxDto, constraints: BOX },
        "shapes.plain": { dto: BoxDto },
        "shapes.nothing": {},
    };
    const rules = ruleBook(defineRules<BoxDto>(BoxDto, [custom("width", (inputs) => (inputs.width ?? 0) < 10, "must be less than 10")]));

    it("should check the properties and then the rules of the operation's DTO", () => {
        // Act
        const issues = validateInputs(registry, "shapes.box", { width: 12, center: [0, 0, 0] }, rules);

        // Assert
        expect(issues).toEqual([{ property: "width", code: "custom", message: "must be less than 10" }]);
    });

    it("should find nothing when the properties and the rules hold", () => {
        // Act
        const issues = validateInputs(registry, "shapes.box", { width: 2, center: [0, 0, 0] }, rules);

        // Assert
        expect(issues).toEqual([]);
    });

    it("should not run a rule over a property that already failed its own check", () => {
        // Act
        const issues = validateInputs(registry, "shapes.box", { width: "wide", center: [0, 0, 0] }, rules);

        // Assert
        expect(issues.map((found) => found.code)).toEqual(["type"]);
    });

    it("should not run a rule when any one of the properties it reads failed its own check", () => {
        // Arrange
        const check = vi.fn(() => undefined);
        const book = ruleBook(defineRules<BoxDto>(BoxDto, [{ reads: ["width", "center"], check }]));

        // Act
        const issues = validateInputs(registry, "shapes.box", { width: 2, center: [0, 0] }, book);

        // Assert
        expect(issues.map((found) => found.code)).toEqual(["arity"]);
        expect(check).not.toHaveBeenCalled();
    });

    it("should still run a rule whose properties passed when another property failed, reporting it after the property", () => {
        // Act
        const issues = validateInputs(registry, "shapes.box", { width: 12, center: [0, 0] }, rules);

        // Assert
        expect(issues.map((found) => [found.property, found.code])).toEqual([["center", "arity"], ["width", "custom"]]);
    });

    it("should hand a rule the inputs it was given", () => {
        // Arrange
        const check = vi.fn(() => undefined);
        const book = ruleBook(defineRules<BoxDto>(BoxDto, [{ reads: ["width"], check }]));
        const inputs = { width: 2, center: [0, 0, 0] };

        // Act
        validateInputs(registry, "shapes.box", inputs, book);

        // Assert
        expect(check).toHaveBeenCalledWith(inputs);
    });

    it("should check only the properties when the kernel has no rules for the DTO", () => {
        // Act
        const withoutBook = validateInputs(registry, "shapes.box", { width: 12, center: [0, 0] });
        const withOtherBook = validateInputs(registry, "shapes.box", { width: 12, center: [0, 0] }, ruleBook());

        // Assert
        expect(withoutBook.map((found) => found.code)).toEqual(["arity"]);
        expect(withOtherBook.map((found) => found.code)).toEqual(["arity"]);
    });

    it("should find nothing to check for an operation it does not list, or lists without constraints", () => {
        // Act
        const unlisted = validateInputs(registry, "shapes.missing", { width: "wide" }, rules);
        const unconstrained = validateInputs(registry, "shapes.plain", { width: "wide" }, rules);
        const inherited = validateInputs(registry, "toString", { width: "wide" }, rules);

        // Assert
        expect(unlisted).toEqual([]);
        expect(unconstrained).toEqual([]);
        expect(inherited).toEqual([]);
    });

    it("should merge the rules two entries give the same DTO", () => {
        // Act
        const book = ruleBook(defineRules<BoxDto>(BoxDto, [custom("width", () => false, "first")]), defineRules<BoxDto>(BoxDto, [custom("center", () => false, "second")]));

        // Assert
        expect(book.get(BoxDto)?.map((rule) => rule.reads)).toEqual([["width"], ["center"]]);
    });

    it("should apply the rules written for a parent to the DTOs that extend it", () => {
        // Arrange
        abstract class SizedBaseDto { size?: number | undefined = 1; }
        class SizedBoxDto extends SizedBaseDto { name?: string | undefined = "box"; }
        const book = ruleBook(defineRules<SizedBoxDto>(SizedBaseDto, [custom("size", (inputs) => (inputs.size ?? 0) > 0, "must be above 0")]), defineRules<SizedBoxDto>(SizedBoxDto, [custom("name", (inputs) => inputs.name !== "", "must not be empty")]));
        const sized: DtoRegistry = { "shapes.sized": { dto: SizedBoxDto, constraints: { size: k.number, name: k.string } } };

        // Act
        const issues = validateInputs(sized, "shapes.sized", { size: 0, name: "" }, book);

        // Assert
        expect(issues.map((found) => found.message)).toEqual(["must not be empty", "must be above 0"]);
    });

    it("should apply the rules of every ancestor, the nearest first", () => {
        // Arrange
        abstract class ShapeBaseDto { size?: number | undefined = 1; }
        abstract class NamedShapeDto extends ShapeBaseDto { name?: string | undefined = "shape"; }
        class NamedBoxDto extends NamedShapeDto { width?: number | undefined = 1; }
        const book = ruleBook(
            defineRules<NamedBoxDto>(ShapeBaseDto, [custom("size", () => false, "from the base")]),
            defineRules<NamedBoxDto>(NamedShapeDto, [custom("name", () => false, "from the parent")]),
            defineRules<NamedBoxDto>(NamedBoxDto, [custom("width", () => false, "from the class")]),
        );
        const named: DtoRegistry = { "shapes.named": { dto: NamedBoxDto, constraints: { size: k.number, name: k.string, width: k.number } } };

        // Act
        const issues = validateInputs(named, "shapes.named", { size: 1, name: "box", width: 1 }, book);

        // Assert
        expect(issues.map((found) => found.message)).toEqual(["from the class", "from the parent", "from the base"]);
    });

    it("should not apply the rules of a sibling DTO", () => {
        // Arrange
        abstract class SharedDto { size?: number | undefined = 1; }
        class FirstDto extends SharedDto {}
        class SecondDto extends SharedDto {}
        const book = ruleBook(defineRules<SecondDto>(SecondDto, [custom("size", () => false, "second only")]));
        const siblings: DtoRegistry = { "shapes.first": { dto: FirstDto, constraints: { size: k.number } } };

        // Act
        const issues = validateInputs(siblings, "shapes.first", { size: 1 }, book);

        // Assert
        expect(issues).toEqual([]);
    });

    it("should skip the rules when the operation takes no DTO", () => {
        // Act
        const issues = validateInputs({ "shapes.free": { constraints: BOX } }, "shapes.free", { width: 12, center: [0, 0, 0] }, rules);

        // Assert
        expect(issues).toEqual([]);
    });
});

describe("unknownProperties", () => {
    const registry: DtoRegistry = { "shapes.box": { dto: BoxDto, constraints: BOX }, "shapes.plain": { dto: BoxDto } };

    it("should name the properties the operation's DTO does not have", () => {
        // Act
        const unknown = unknownProperties(registry, "shapes.box", { widht: 2, center: [0, 0, 0], hieght: 1 });

        // Assert
        expect(unknown).toEqual(["widht", "hieght"]);
    });

    it("should name a property that shares its name with a member every object inherits", () => {
        // Act
        const unknown = unknownProperties(registry, "shapes.box", { width: 2, valueOf: 1, constructor: 2 });

        // Assert
        expect(unknown).toEqual(["valueOf", "constructor"]);
    });

    it("should name none when there is nothing to compare with", () => {
        // Act
        const unlisted = unknownProperties(registry, "shapes.missing", { widht: 2 });
        const unconstrained = unknownProperties(registry, "shapes.plain", { widht: 2 });
        const notAnObject = unknownProperties(registry, "shapes.box", 5);

        // Assert
        expect([unlisted, unconstrained, notAnObject]).toEqual([[], [], []]);
    });

    it("should name none for inputs that are null or a list", () => {
        // Act
        const nothing = unknownProperties(registry, "shapes.box", null);
        const list = unknownProperties(registry, "shapes.box", [1, 2]);

        // Assert
        expect([nothing, list]).toEqual([[], []]);
    });
});

describe("reportInputIssues", () => {
    const WIDTH_TYPE: InputIssue = { property: "width", code: "type", message: "must be a number" };
    let reports: InputIssueReport[];

    const record = (): void => {
        reports = [];
        setInputIssueSink((report) => reports.push(report));
    };
    const reported = (): string[] => reports.map((report) => `${report.kernel} ${report.path} ${report.issue.property} ${report.issue.code}`);

    beforeEach(() => {
        record();
    });

    afterEach(() => {
        setInputIssueSink();
        vi.restoreAllMocks();
    });

    it("should hand each distinct issue to the sink once", () => {
        // Act
        reportInputIssues("OCCT", "shapes.box", [WIDTH_TYPE]);
        reportInputIssues("OCCT", "shapes.box", [WIDTH_TYPE], ["widht"]);

        // Assert
        expect(reported()).toEqual([
            "OCCT shapes.box width type",
            "OCCT shapes.box widht unknown-property",
        ]);
    });

    it("should hand the sink the kernel, the path and the issue itself", () => {
        // Act
        reportInputIssues("OCCT", "shapes.box", [WIDTH_TYPE]);

        // Assert
        expect(reports).toStrictEqual([{ kernel: "OCCT", path: "shapes.box", issue: WIDTH_TYPE }]);
        expect(reports[0]?.issue).toBe(WIDTH_TYPE);
    });

    it("should report a property the operation does not know as an issue of its own, after the others", () => {
        // Act
        reportInputIssues("OCCT", "shapes.box", [WIDTH_TYPE], ["widht"]);

        // Assert
        expect(reports.map((report) => report.issue)).toStrictEqual([WIDTH_TYPE, { property: "widht", code: "unknown-property", message: "is not an input of this operation and is ignored" }]);
    });

    it.each([
        ["another kernel", "JSCAD", "shapes.box", WIDTH_TYPE],
        ["another path", "OCCT", "shapes.cube", WIDTH_TYPE],
        ["another property", "OCCT", "shapes.box", { ...WIDTH_TYPE, property: "height" }],
        ["another code", "OCCT", "shapes.box", { ...WIDTH_TYPE, code: "not-a-number" }],
    ])("should report again an issue that differs only in %s", (_what, kernel, path, issue) => {
        // Arrange
        reportInputIssues("OCCT", "shapes.box", [WIDTH_TYPE]);

        // Act
        reportInputIssues(kernel, path, [issue]);

        // Assert
        expect(reports).toHaveLength(2);
        expect(reports[1]).toStrictEqual({ kernel, path, issue });
    });

    it("should not report again an issue that differs only in its message", () => {
        // Arrange
        reportInputIssues("OCCT", "shapes.box", [{ property: "sizes", code: "type", message: "item 1 must be a number", params: { index: 1 } }]);

        // Act
        reportInputIssues("OCCT", "shapes.box", [{ property: "sizes", code: "type", message: "item 2 must be a number", params: { index: 2 } }]);

        // Assert
        expect(reports.map((report) => report.issue.message)).toEqual(["item 1 must be a number"]);
    });

    it("should report an issue again once the sink is set anew", () => {
        // Arrange
        reportInputIssues("OCCT", "shapes.box", [WIDTH_TYPE]);
        const first = reports;
        record();

        // Act
        reportInputIssues("OCCT", "shapes.box", [WIDTH_TYPE]);

        // Assert
        expect(first).toHaveLength(1);
        expect(reported()).toEqual(["OCCT shapes.box width type"]);
    });

    it("should warn on the console when no sink is set", () => {
        // Arrange
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        setInputIssueSink();

        // Act
        reportInputIssues("JSCAD", "shapes.cube", [{ property: "size", code: "type", message: "must be a number" }]);

        // Assert
        expect(warn).toHaveBeenCalledWith("JSCAD shapes.cube: size must be a number");
    });

    it("should go back to the console, and stop handing issues to the old sink, when the sink is reset", () => {
        // Arrange
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        setInputIssueSink();

        // Act
        reportInputIssues("OCCT", "shapes.box", [WIDTH_TYPE]);

        // Assert
        expect(reports).toEqual([]);
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it("should report two rules on one property that give the same code each once, whatever values they fire on", () => {
        // Arrange
        const offset = (inputs: BoxDto): number => inputs.center?.[0] ?? 0;
        const book = ruleBook(defineRules<BoxDto>(BoxDto, [lessThan("width", (inputs) => offset(inputs) + 5, undefined, ["center"]), lessThan("width", (inputs) => offset(inputs) + 3, undefined, ["center"])]));
        const registry: DtoRegistry = { "shapes.box": { dto: BoxDto, constraints: BOX } };

        // Act
        reportInputIssues("OCCT", "shapes.box", validateInputs(registry, "shapes.box", { width: 10, center: [0, 0, 0] }, book));
        reportInputIssues("OCCT", "shapes.box", validateInputs(registry, "shapes.box", { width: 12, center: [1, 0, 0] }, book));

        // Assert
        expect(reports.map((report) => report.issue.message)).toEqual(["must be less than 5", "must be less than 3"]);
    });

    it("should remember the last thousand issues, and report one again once it has fallen out", () => {
        // Arrange
        const issueOn = (index: number): InputIssue => ({ property: `p${index}`, code: "type", message: "must be a number" });
        reportInputIssues("OCCT", "shapes.box", Array.from({ length: 1001 }, (_, index) => issueOn(index)));

        // Act
        reportInputIssues("OCCT", "shapes.box", [issueOn(1000), issueOn(1), issueOn(0)]);

        // Assert
        expect(reports).toHaveLength(1002);
        expect(reports[1001]?.issue.property).toBe("p0");
    });
});

describe("prepareKernelCall", () => {
    const registry: DtoRegistry = { "shapes.box": { dto: BoxDto, constraints: BOX } };
    const rules = ruleBook(defineRules<BoxDto>(BoxDto, [custom("width", (inputs) => (inputs.width ?? 0) < 10, "must be less than 10")]));
    let reports: InputIssueReport[];

    beforeEach(() => {
        reports = [];
        setInputIssueSink((report) => reports.push(report));
    });

    afterEach(() => {
        setInputIssueSink();
    });

    it("should lay the inputs over the defaults of the operation's DTO and leave the caller's as they were", () => {
        // Arrange
        const given = { width: 2 };

        // Act
        const call = prepareKernelCall("OCCT", registry, "shapes.box", given, rules);

        // Assert
        expect(call.inputs).toEqual({ width: 2, center: [0, 0, 0] });
        expect(given).toStrictEqual({ width: 2 });
    });

    it("should report nothing until it is asked to", () => {
        // Act
        prepareKernelCall("OCCT", registry, "shapes.box", { width: 12 }, rules);

        // Assert
        expect(reports).toEqual([]);
    });

    it("should report the issues of the resolved inputs, the rules' included, and every name the operation does not know", () => {
        // Arrange
        const call = prepareKernelCall("OCCT", registry, "shapes.box", { width: 12, center: [0, 0], widht: undefined }, rules);

        // Act
        call.reportIssues();

        // Assert
        expect(reports.map((report) => `${report.kernel} ${report.path} ${report.issue.property} ${report.issue.code}`)).toEqual([
            "OCCT shapes.box center arity",
            "OCCT shapes.box width custom",
            "OCCT shapes.box widht unknown-property",
        ]);
    });

    it("should not throw when the sink throws", () => {
        // Arrange
        const refusing = vi.fn(() => {
            throw new Error("the sink refused");
        });
        setInputIssueSink(refusing);
        const call = prepareKernelCall("OCCT", registry, "shapes.box", { width: 12 }, rules);

        // Act
        const report = (): void => call.reportIssues();

        // Assert
        expect(report).not.toThrow();
        expect(refusing).toHaveBeenCalledTimes(1);
    });

    it("should not throw when a rule throws", () => {
        // Arrange
        const throwing = ruleBook(defineRules<BoxDto>(BoxDto, [{ reads: ["width"], check: () => { throw new Error("the rule broke"); } }]));
        const call = prepareKernelCall("OCCT", registry, "shapes.box", { width: 2 }, throwing);

        // Act
        const report = (): void => call.reportIssues();

        // Assert
        expect(report).not.toThrow();
        expect(reports).toEqual([]);
    });
});
