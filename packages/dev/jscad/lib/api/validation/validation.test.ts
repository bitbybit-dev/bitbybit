import { describe, it, expect } from "vitest";
import { InputIssue, resolveInputs, validateInputs } from "@bitbybit-dev/base";
import { jscadDtoRegistry } from "../dto-registry";
import { jscadDtoRules } from "./index";

const issuesOf = (path: string, inputs: object): InputIssue[] => validateInputs(jscadDtoRegistry, path, resolveInputs(jscadDtoRegistry, path, inputs), jscadDtoRules);

type Row = [path: string, what: string, inputs: object, issues: InputIssue[]];

const tooRoundForTheBox = (limit: number): InputIssue => ({ property: "roundRadius", code: "less-than", params: { limit }, message: "must be less than half of the smallest side" });
const tooRoundForTheHeight = (limit: number): InputIssue => ({ property: "roundRadius", code: "less-than", params: { limit }, message: "must be less than half of the height" });
const tooRoundForTheRadius: InputIssue = { property: "roundRadius", code: "custom", message: "must not be greater than radius" };

const roundedCuboids: [path: string, placement: object][] = [
    ["shapes.roundedCuboid", {}],
    ["shapes.roundedCuboidsOnCenterPoints", { centers: [[0, 0, 0]] }],
];

const roundedCylinders: [path: string, placement: object][] = [
    ["shapes.roundedCylinder", {}],
    ["shapes.roundedCylindersOnCenterPoints", { centers: [[0, 0, 0]] }],
];

const cuboidRows: Row[] = roundedCuboids.flatMap(([path, placement]): Row[] => [
    [path, "pass the default rounding", { ...placement }, []],
    [path, "pass a rounding just under half of the smallest side", { ...placement, width: 2, length: 3, height: 4, roundRadius: 0.999 }, []],
    [path, "report a rounding of exactly half of the smallest side", { ...placement, width: 2, length: 3, height: 4, roundRadius: 1 }, [tooRoundForTheBox(1)]],
    [path, "report a rounding measured against the length when it is the smallest side", { ...placement, width: 4, length: 2, height: 3, roundRadius: 1.5 }, [tooRoundForTheBox(1)]],
    [path, "report a rounding measured against the height when it is the smallest side", { ...placement, width: 4, length: 3, height: 2, roundRadius: 1.5 }, [tooRoundForTheBox(1)]],
    [path, "report a rounding measured against the sides the call left at their defaults", { ...placement, roundRadius: 0.5 }, [tooRoundForTheBox(0.5)]],
    [path, "not measure the rounding against a side that is not a number", { ...placement, width: Number.NaN, roundRadius: 5 }, [{ property: "width", code: "not-a-number", message: "is not a number (NaN)" }]],
    [path, "not measure the rounding against a side below its bound", { ...placement, height: -1, roundRadius: 0.1 }, [{ property: "height", code: "minimum", params: { limit: 0, exclusive: false, actual: -1 }, message: "must be at least 0" }]],
    [path, "not measure a rounding that is not a number", { ...placement, roundRadius: Number.NaN }, [{ property: "roundRadius", code: "not-a-number", message: "is not a number (NaN)" }]],
]);

const cylinderRows: Row[] = roundedCylinders.flatMap(([path, placement]): Row[] => [
    [path, "pass the default rounding", { ...placement }, []],
    [path, "pass a rounding just under half of the height and the radius", { ...placement, height: 2, radius: 1, roundRadius: 0.999 }, []],
    [path, "report a rounding of exactly half of the height", { ...placement, height: 2, radius: 5, roundRadius: 1 }, [tooRoundForTheHeight(1)]],
    [path, "pass a rounding exactly as large as the radius, which makes a capsule", { ...placement, height: 10, radius: 1, roundRadius: 1 }, []],
    [path, "report a rounding larger than the radius", { ...placement, height: 10, radius: 1, roundRadius: 1.001 }, [tooRoundForTheRadius]],
    [path, "report a rounding too large for both, the height first", { ...placement, height: 2, radius: 1, roundRadius: 1.5 }, [tooRoundForTheHeight(1), tooRoundForTheRadius]],
    [path, "report a rounding measured against the height the call left at its default", { ...placement, radius: 5, roundRadius: 0.5 }, [tooRoundForTheHeight(0.5)]],
    [path, "not measure the rounding against a height that is not a number", { ...placement, height: Number.NaN, radius: 5, roundRadius: 3 }, [{ property: "height", code: "not-a-number", message: "is not a number (NaN)" }]],
    [path, "not measure the rounding against a radius below its bound", { ...placement, height: 10, radius: -1, roundRadius: 3 }, [{ property: "radius", code: "minimum", params: { limit: 0, exclusive: false, actual: -1 }, message: "must be at least 0" }]],
]);

describe("the JSCAD input rules", () => {
    describe("a rounded box, whose rule sits on the parent both box operations share", () => {
        it.each(cuboidRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });

    describe("a rounded cylinder, whose rules sit on the parent both cylinder operations share", () => {
        it.each(cylinderRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });
});
