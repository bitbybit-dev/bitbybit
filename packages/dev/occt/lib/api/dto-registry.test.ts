import { describe, it, expect, beforeAll } from "vitest";
import { InputIssue, resolveInputs, validateInputs, withDefaults } from "@bitbybit-dev/base";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { OCCTService } from "../occ-service";
import { VectorHelperService } from "./vector-helper.service";
import { ShapesHelperService } from "./shapes-helper.service";
import { occtDtoRegistry } from "./dto-registry";
import { occtDtoRules } from "./validation";
import * as Inputs from "./inputs";

const methodAt = (root: object, path: string): unknown => path.split(".").reduce<unknown>((owner, segment) => (owner === null || owner === undefined ? undefined : Reflect.get(owner, segment)), root);

describe("the OCCT operation registry", () => {
    let service: OCCTService;

    beforeAll(async () => {
        const occ = await createBitbybitOcct();
        service = new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
    });

    it("should name a kernel method for every listed path", () => {
        // Act
        const missing = Object.keys(occtDtoRegistry).filter((path) => typeof methodAt(service, path) !== "function");

        // Assert
        expect(missing).toEqual([]);
    });

    it("should list only DTO classes that construct with no arguments", () => {
        // Act
        const built = Object.values(occtDtoRegistry).flatMap((entry) => (entry.dto ? [new entry.dto()] : []));

        // Assert
        expect(built.every((dto) => typeof dto === "object")).toBe(true);
    });

    it("should resolve a call that leaves defaults out to the fully spelled DTO", () => {
        // Act
        const resolved = resolveInputs(occtDtoRegistry, "shapes.solid.createBox", { width: 4 });

        // Assert
        expect(resolved).toEqual({ ...new Inputs.OCCT.BoxDto(), width: 4 });
    });

    it("should let a kernel used in the same thread build from a call that leaves defaults out", () => {
        // Arrange
        const kernel = withDefaults(service, occtDtoRegistry);

        // Act
        const box = kernel.shapes.solid.createBox({ width: 4 });
        const volume = kernel.shapes.solid.getSolidVolume({ shape: box });

        // Assert
        expect(volume).toBeCloseTo(4 * 2 * 3);
    });
    it("should find nothing wrong with the defaults of the DTO each operation takes", () => {
        // Act
        const issues = Object.entries(occtDtoRegistry).flatMap(([path, entry]) => (entry.dto ? validateInputs(occtDtoRegistry, path, new entry.dto(), occtDtoRules) : [])
            .filter((found) => found.code !== "required")
            .map((found) => `${path} ${found.property} ${found.code}`));

        // Assert
        expect(issues).toEqual([]);
    });
});

const S = { hash: 1, type: "occ-shape" };
const issuesOf = (path: string, inputs: object): InputIssue[] => validateInputs(occtDtoRegistry, path, resolveInputs(occtDtoRegistry, path, inputs), occtDtoRules);
const notAHexColor: InputIssue = { property: "color", code: "color", message: "must be a hex color such as #ff0000" };

const constraintRows: [path: string, what: string, inputs: object, issues: InputIssue[]][] = [
    ["shapes.wire.createBezierWeights", "report the points and weights it requires when the call leaves them out", {}, [
        { property: "points", code: "required", message: "is required" },
        { property: "weights", code: "required", message: "is required" },
    ]],
    ["shapes.solid.createBox", "report a width that is not a number", { width: Number.NaN }, [{ property: "width", code: "not-a-number", message: "is not a number (NaN)" }]],
    ["shapes.solid.createBox", "report a width below its exclusive minimum", { width: -1 }, [{ property: "width", code: "minimum", params: { limit: 0, exclusive: true, actual: -1 }, message: "must be above 0" }]],
    ["shapes.solid.createBox", "report a width exactly at its exclusive minimum", { width: 0 }, [{ property: "width", code: "minimum", params: { limit: 0, exclusive: true, actual: 0 }, message: "must be above 0" }]],
    ["shapes.solid.createBox", "pass a width just above its exclusive minimum", { width: 1e-9 }, []],
    ["shapes.solid.createBox", "report a center of two coordinates where three are needed", { center: [0, 0] }, [{ property: "center", code: "arity", params: { expected: 3, actual: 2 }, message: "must have 3 numbers, not 2" }]],
    ["shapes.solid.createBox", "report a flag that is not true or false", { originOnCenter: "yes" }, [{ property: "originOnCenter", code: "type", message: "must be true or false" }]],
    ["shapes.wire.createCircleWire", "pass a radius exactly at its inclusive minimum", { radius: 0 }, []],
    ["shapes.wire.createCircleWire", "report a radius below its inclusive minimum", { radius: -0.5 }, [{ property: "radius", code: "minimum", params: { limit: 0, exclusive: false, actual: -0.5 }, message: "must be at least 0" }]],
    ["shapes.wire.createCircleWire", "report a direction holding something other than numbers", { direction: [0, Number.NaN, 1] }, [{ property: "direction", code: "type", message: "must be a list of 3 numbers" }]],
    ["fillets.chamferEdgeDistAngle", "report an angle exactly at its exclusive maximum", { shape: S, edge: S, face: S, angle: 90 }, [{ property: "angle", code: "maximum", params: { limit: 90, exclusive: true, actual: 90 }, message: "must be below 90" }]],
    ["fillets.chamferEdgeDistAngle", "pass an angle just below its exclusive maximum", { shape: S, edge: S, face: S, angle: 89.999 }, []],
    ["shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges", "report a wire type it does not know", { shapes: [S, S], wireType: "spline" }, [{ property: "wireType", code: "enum", params: { allowed: ["polyline", "interpolated"] }, message: "must be one of polyline, interpolated" }]],
    ["shapes.wire.createBezierWeights", "report the point of a list that has two coordinates", { points: [[0, 0, 0], [1, 0]], weights: [1, 1] }, [{ property: "points", code: "arity", params: { expected: 3, actual: 2, index: 1 }, message: "item 1 must have 3 numbers, not 2" }]],
    ["shapes.wire.createBezierWeights", "report the weight of a list that is not a number", { points: [[0, 0, 0], [1, 0, 0]], weights: [1, "2"] }, [{ property: "weights", code: "type", params: { index: 1 }, message: "item 1 must be a number" }]],
    ["io.dxfPathsWithLayer", "report a color given by name", { paths: [S], color: "red" }, [notAHexColor]],
    ["io.dxfPathsWithLayer", "report a hex color of five digits", { paths: [S], color: "#ff000" }, [notAHexColor]],
    ["io.dxfPathsWithLayer", "report a hex color without its hash", { paths: [S], color: "ff0000" }, [notAHexColor]],
    ["io.dxfPathsWithLayer", "pass a hex color of six digits", { paths: [S], color: "#ff0000" }, []],
    ["io.dxfPathsWithLayer", "pass a hex color in upper case", { paths: [S], color: "#FF0000" }, []],
];

describe("what the generated OCCT constraints refuse", () => {
    it.each(constraintRows)("%s should %s", (path, _what, inputs, issues) => {
        // Act
        const found = issuesOf(path, inputs);

        // Assert
        expect(found).toEqual(issues);
    });
});
