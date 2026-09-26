import { describe, it, expect, afterEach, vi } from "vitest";
import { constraintKinds as k, DtoConstraints } from "./constraints";
import { checkStructure, InputIssueReport, reportInputIssues, ruleBook, setInputIssueSink, unknownProperties, validateInputs } from "./input-validation";
import { custom, defineRules } from "./input-rules";
import { DtoRegistry } from "./resolve-dto";

class BoxDto {
    width?: number | undefined = 1;
    center?: [number, number, number] | undefined = [0, 0, 0];
}

const BOX: DtoConstraints = { width: k.number, center: k.point3 };

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
        ["a number given as text", k.number, "2", "type"],
        ["a number that is NaN", k.number, NaN, "not-a-number"],
        ["a flag given as a number", k.boolean, 1, "type"],
        ["text given as a number", k.string, 1, "type"],
        ["a color that is not hex", k.color, "red", "color"],
        ["a color that is not text", k.color, 5, "color"],
        ["a point that is not a list", k.point3, "0,0,0", "type"],
        ["a point with two coordinates", k.point3, [0, 0], "arity"],
        ["a point with a coordinate that is not a number", k.point3, [0, "1", 0], "type"],
        ["a point with a NaN coordinate", k.vector3, [0, NaN, 0], "type"],
        ["a list that is not one", k.list(k.number), 3, "type"],
        ["a value its enum does not list", k.oneOf(["a", "b"]), "c", "enum"],
    ])("should report %s", (_what, constraint, value, code) => {
        // Act
        const issues = checkStructure({ value: constraint }, { value });

        // Assert
        expect(issues.map((found) => [found.property, found.code])).toEqual([["value", code]]);
    });

    it("should report a required property left out, and take null for left out", () => {
        // Act
        const issues = checkStructure({ shape: k.required(k.opaque), other: k.required(k.number), optional: k.number }, { other: null });

        // Assert
        expect(issues.map((found) => found.code)).toEqual(["required", "required"]);
    });

    it("should name the item of a list that fails, and where it is", () => {
        // Act
        const issues = checkStructure({ points: k.list(k.point3) }, { points: [[0, 0, 0], [1, 1]] });

        // Assert
        expect(issues).toEqual([{ property: "points", code: "arity", message: "item 1 must have 3 numbers, not 2", params: { expected: 3, actual: 2, index: 1 } }]);
    });

    it("should take a typed array as a list and not look into it", () => {
        // Act
        const issues = checkStructure({ values: k.list(k.number), plain: { kind: "list" } }, { values: new Float32Array([1, 2]), plain: [1, "2"] });

        // Assert
        expect(issues).toEqual([]);
    });

    it("should report the required properties of inputs that are not an object", () => {
        // Act
        const issues = checkStructure({ width: k.required(k.number) }, 5);

        // Assert
        expect(issues.map((found) => found.code)).toEqual(["required"]);
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

        // Assert
        expect(unlisted).toEqual([]);
        expect(unconstrained).toEqual([]);
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
        const unknown = unknownProperties(registry, "shapes.box", { widht: 2, center: [0, 0, 0] });

        // Assert
        expect(unknown).toEqual(["widht"]);
    });

    it("should name none when there is nothing to compare with", () => {
        // Act
        const unlisted = unknownProperties(registry, "shapes.missing", { widht: 2 });
        const unconstrained = unknownProperties(registry, "shapes.plain", { widht: 2 });
        const notAnObject = unknownProperties(registry, "shapes.box", 5);

        // Assert
        expect([unlisted, unconstrained, notAnObject]).toEqual([[], [], []]);
    });
});

describe("reportInputIssues", () => {
    afterEach(() => {
        setInputIssueSink();
    });

    it("should hand each distinct issue to the sink once", () => {
        // Arrange
        const reports: InputIssueReport[] = [];
        setInputIssueSink((report) => reports.push(report));
        const issue = { property: "width", code: "type", message: "must be a number" };

        // Act
        reportInputIssues("OCCT", "shapes.box", [issue]);
        reportInputIssues("OCCT", "shapes.box", [issue], ["widht"]);

        // Assert
        expect(reports.map((report) => `${report.kernel} ${report.path} ${report.issue.property} ${report.issue.code}`)).toEqual([
            "OCCT shapes.box width type",
            "OCCT shapes.box widht unknown-property",
        ]);
    });

    it("should warn on the console when no sink is set", () => {
        // Arrange
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        setInputIssueSink();

        // Act
        reportInputIssues("JSCAD", "shapes.cube", [{ property: "size", code: "type", message: "must be a number" }]);

        // Assert
        expect(warn).toHaveBeenCalledWith("JSCAD shapes.cube: size must be a number");
        warn.mockRestore();
    });
});
