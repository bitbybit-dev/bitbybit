import { describe, it, expect, beforeAll } from "vitest";
import { InputIssue, resolveInputs, validateInputs, withDefaults } from "@bitbybit-dev/base";
import createBitbybitOcct, { TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
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
    ["io.convertStepToGltf", "pass a mesh angle of a half turn", { stepData: "ISO-10303-21;", meshAngle: Math.PI }, []],
    ["io.convertStepToGltfWithDraco", "pass a mesh angle of a half turn", { stepData: "ISO-10303-21;", meshAngle: Math.PI }, []],
    ["io.convertStepToGltfAdvanced", "pass a mesh angle of a half turn", { stepData: "ISO-10303-21;", meshAngle: Math.PI }, []],
    ["io.convertStepToGltfAdvancedWithDraco", "pass a mesh angle of a half turn", { stepData: "ISO-10303-21;", meshAngle: Math.PI }, []],
    ["io.convertStepToGltf", "report a mesh angle beyond a half turn", { stepData: "ISO-10303-21;", meshAngle: 3.2 }, [{ property: "meshAngle", code: "maximum", params: { limit: Math.PI, exclusive: false, actual: 3.2 }, message: `must be at most ${Math.PI}` }]],
    ["shapes.wire.interpolatePoints", "pass tangents that leave out the tangent at one point", { points: [[0, 0, 0], [1, 1, 0], [2, 0, 0]], tangents: [[1, 0, 0], undefined, [1, 0, 0]] }, []],
    ["shapes.wire.interpolatePoints", "report a tangent of two coordinates beside one left out", { points: [[0, 0, 0], [1, 1, 0], [2, 0, 0]], tangents: [undefined, [1, 0], [1, 0, 0]] }, [{ property: "tangents", code: "arity", params: { index: 1, expected: 3, actual: 2 }, message: "item 1 must have 3 numbers, not 2" }]],
];

describe("what the generated OCCT constraints refuse", () => {
    it.each(constraintRows)("%s should %s", (path, _what, inputs, issues) => {
        // Act
        const found = issuesOf(path, inputs);

        // Assert
        expect(found).toEqual(issues);
    });
});

type Fixtures = { box: TopoDS_Shape; sphere: TopoDS_Shape; face: TopoDS_Face; edge: TopoDS_Edge; outline: TopoDS_Wire; zigzag: TopoDS_Wire; path: TopoDS_Wire };
type ZeroRow = [path: string, property: string, inputsOf: (shapes: Fixtures) => object];

const callAt = (root: object, path: string, inputs: object): unknown => {
    const segments = path.split(".");
    const owner = methodAt(root, segments.slice(0, -1).join("."));
    const method = typeof owner === "object" && owner !== null ? Reflect.get(owner, segments[segments.length - 1] ?? "") : undefined;
    if (typeof method !== "function") throw new Error(`no method at ${path}`);
    return Reflect.apply(method, owner, [inputs]);
};

const none = (): object => ({});

const zeroRows: ZeroRow[] = [
    ["shapes.wire.createSquareWire", "size", none],
    ["shapes.wire.createRectangleWire", "width", none],
    ["shapes.wire.createRectangleWire", "length", none],
    ["shapes.wire.createLPolygonWire", "widthFirst", none],
    ["shapes.wire.createLPolygonWire", "lengthFirst", none],
    ["shapes.wire.createLPolygonWire", "widthSecond", none],
    ["shapes.wire.createLPolygonWire", "lengthSecond", none],
    ["shapes.wire.createIBeamProfileWire", "width", none],
    ["shapes.wire.createIBeamProfileWire", "flangeThickness", none],
    ["shapes.wire.createHBeamProfileWire", "height", none],
    ["shapes.wire.createHBeamProfileWire", "flangeThickness", none],
    ["shapes.wire.createTBeamProfileWire", "width", none],
    ["shapes.wire.createTBeamProfileWire", "webThickness", none],
    ["shapes.wire.createTBeamProfileWire", "flangeThickness", none],
    ["shapes.wire.createUBeamProfileWire", "width", none],
    ["shapes.wire.createUBeamProfileWire", "height", none],
    ["shapes.wire.createUBeamProfileWire", "webThickness", none],
    ["shapes.wire.createUBeamProfileWire", "flangeThickness", none],
    ["shapes.wire.createParallelogramWire", "width", none],
    ["shapes.wire.createParallelogramWire", "height", none],
    ["shapes.wire.createHeartWire", "sizeApprox", none],
    ["shapes.wire.createNGonWire", "radius", none],
    ["shapes.wire.textWires", "height", none],
    ["dimensions.simpleLinearLengthDimension", "labelSize", () => ({ start: [0, 0, 0], end: [5, 0, 0], direction: [0, 0, 1] })],
    ["dimensions.simpleAngularDimension", "labelSize", none],
    ["dimensions.pinWithLabel", "labelSize", none],
    ["fillets.filletEdges", "radius", ({ box }) => ({ shape: box })],
    ["fillets.fillet2d", "radius", ({ outline }) => ({ shape: outline })],
    ["fillets.fillet2dShapes", "radius", ({ outline }) => ({ shapes: [outline] })],
    ["fillets.filletEdgesListOneRadius", "radius", ({ box, edge }) => ({ shape: box, edges: [edge] })],
    ["fillets.fillet3DWire", "radius", ({ zigzag }) => ({ shape: zigzag, direction: [0, 5, 0] })],
    ["fillets.fillet3DWires", "radius", ({ zigzag }) => ({ shapes: [zigzag], direction: [0, 5, 0] })],
    ["fillets.chamferEdges", "distance", ({ box }) => ({ shape: box })],
    ["fillets.chamferEdgeTwoDistances", "distance1", ({ box, edge, face }) => ({ shape: box, edge, face })],
    ["fillets.chamferEdgeTwoDistances", "distance2", ({ box, edge, face }) => ({ shape: box, edge, face })],
    ["fillets.chamferEdgesTwoDistances", "distance1", ({ box, edge, face }) => ({ shape: box, edges: [edge], faces: [face] })],
    ["fillets.chamferEdgesTwoDistances", "distance2", ({ box, edge, face }) => ({ shape: box, edges: [edge], faces: [face] })],
    ["fillets.chamferEdgeDistAngle", "distance", ({ box, edge, face }) => ({ shape: box, edge, face })],
    ["fillets.chamferEdgesDistAngle", "distance", ({ box, edge, face }) => ({ shape: box, edges: [edge], faces: [face] })],
    ["fillets.chamfer2dVertices", "distance", ({ outline }) => ({ shape: outline })],
    ["operations.pipeWireCylindrical", "radius", ({ path }) => ({ shape: path })],
    ["operations.pipeWiresCylindrical", "radius", ({ path }) => ({ shapes: [path] })],
    ["operations.pipePolylineWireNGon", "radius", ({ path }) => ({ shape: path })],
    ["booleans.meshMeshIntersectionWires", "precision1", ({ box, sphere }) => ({ shape1: box, shape2: sphere })],
    ["booleans.meshMeshIntersectionWires", "precision2", ({ box, sphere }) => ({ shape1: box, shape2: sphere })],
];

describe("a value of 0 the OCCT kernel cannot build with", () => {
    let kernel: OCCTService;
    let shapes: Fixtures;

    beforeAll(async () => {
        const occ = await createBitbybitOcct();
        kernel = withDefaults(new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ)), occtDtoRegistry);
        const box = kernel.shapes.solid.createBox({ width: 2, length: 2, height: 2 });
        const face = kernel.shapes.face.getFaces({ shape: box })[0]!;
        shapes = {
            box,
            sphere: kernel.shapes.solid.createSphere({ radius: 1.2 }),
            face,
            edge: kernel.shapes.edge.getEdges({ shape: face })[0]!,
            outline: kernel.shapes.wire.createRectangleWire({ width: 4, length: 2 }),
            zigzag: kernel.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [2, 0, 1], [4, 0, -1], [6, 0, 0]] }),
            path: kernel.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [0, 5, 0], [3, 8, 0]] }),
        };
    });

    it.each(zeroRows)("%s should report a %s of 0, which the kernel refuses", (path, property, inputsOf) => {
        // Arrange
        const inputs = { ...inputsOf(shapes), [property]: 0 };

        // Act
        const issues = issuesOf(path, inputs);
        const build = (): unknown => callAt(kernel, path, inputs);

        // Assert
        expect(issues).toEqual([{ property, code: "minimum", params: { limit: 0, exclusive: true, actual: 0 }, message: "must be above 0" }]);
        expect(build).toThrow();
    });

    it.each(zeroRows)("%s should build with a small %s above 0", (path, property, inputsOf) => {
        // Arrange
        const inputs = { ...inputsOf(shapes), [property]: 0.05 };

        // Act
        const issues = issuesOf(path, inputs);
        const built = callAt(kernel, path, inputs);

        // Assert
        expect(issues).toEqual([]);
        expect(built).toBeDefined();
    });
});
