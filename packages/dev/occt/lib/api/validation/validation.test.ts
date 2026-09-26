import { describe, it, expect } from "vitest";
import { resolveInputs, validateInputs } from "@bitbybit-dev/base";
import { occtDtoRegistry } from "../dto-registry";
import { occtDtoRules } from "./index";

const S = { hash: 1, type: "occ-shape" };
const P = (x: number): number[] => [x, 0, 0];

const issuesOf = (path: string, inputs: object) => validateInputs(occtDtoRegistry, path, resolveInputs(occtDtoRegistry, path, inputs), occtDtoRules);

const profile = { extrusionLengthFront: 1, extrusionLengthBack: 0 };
const flat = { extrusionLengthFront: 0, extrusionLengthBack: 0 };

const rows: [string, object, object, string, string][] = [
    ["fillets.filletEdges", { shape: S, radiusList: [1, 2], indexes: [1, 2] }, { shape: S, radiusList: [1], indexes: [1, 2] }, "radiusList", "same-length"],
    ["fillets.fillet2d", { shape: S, radiusList: [1], indexes: [1] }, { shape: S, radiusList: [1, 2], indexes: [1] }, "radiusList", "same-length"],
    ["fillets.fillet2dShapes", { shapes: [S], radiusList: [1], indexes: [1] }, { shapes: [S], radiusList: [1, 2], indexes: [1] }, "radiusList", "same-length"],
    ["fillets.fillet3DWire", { shape: S, radiusList: [1], indexes: [1] }, { shape: S, radiusList: [1, 2], indexes: [1] }, "radiusList", "same-length"],
    ["fillets.fillet3DWires", { shapes: [S], radiusList: [1], indexes: [1] }, { shapes: [S], radiusList: [1, 2], indexes: [1] }, "radiusList", "same-length"],
    ["fillets.chamferEdges", { shape: S, distanceList: [1], indexes: [1] }, { shape: S, distanceList: [1, 2], indexes: [1] }, "distanceList", "same-length"],
    ["fillets.filletEdgesList", { shape: S, edges: [S, S], radiusList: [1, 2] }, { shape: S, edges: [S, S], radiusList: [1] }, "radiusList", "same-length"],
    ["fillets.filletEdgeVariableRadius", { shape: S, edge: S, radiusList: [1, 2], paramsU: [0, 1] }, { shape: S, edge: S, radiusList: [1, 2], paramsU: [0] }, "radiusList", "same-length"],
    ["fillets.filletEdgesSameVariableRadius", { shape: S, edges: [S], radiusList: [1, 2], paramsU: [0, 1] }, { shape: S, edges: [S], radiusList: [1, 2], paramsU: [0] }, "radiusList", "same-length"],
    ["fillets.filletEdgesVariableRadius", { shape: S, edges: [S], radiusLists: [[1]], paramsULists: [[0]] }, { shape: S, edges: [S], radiusLists: [[1], [2]], paramsULists: [[0]] }, "radiusLists", "same-length"],
    ["fillets.chamferEdgesList", { shape: S, edges: [S], distanceList: [1] }, { shape: S, edges: [S], distanceList: [1, 2] }, "distanceList", "same-length"],
    ["fillets.chamferEdgesTwoDistances", { shape: S, edges: [S], faces: [S] }, { shape: S, edges: [S], faces: [S, S] }, "faces", "same-length"],
    ["fillets.chamferEdgesTwoDistancesLists", { shape: S, edges: [S], faces: [S], distances1: [1], distances2: [1] }, { shape: S, edges: [S], faces: [S], distances1: [1, 2], distances2: [1] }, "distances1", "same-length"],
    ["fillets.chamferEdgesDistsAngles", { shape: S, edges: [S], faces: [S], distances: [1], angles: [45] }, { shape: S, edges: [S], faces: [S], distances: [1], angles: [45, 45] }, "angles", "same-length"],
    ["fillets.chamferEdgesDistAngle", { shape: S, edges: [S], faces: [S] }, { shape: S, edges: [S], faces: [S, S] }, "faces", "same-length"],
    ["transforms.transformShapes", { shapes: [S], translations: [P(0)], rotationAxes: [P(1)], rotationAngles: [0], scaleFactors: [1] }, { shapes: [S], translations: [], rotationAxes: [P(1)], rotationAngles: [0], scaleFactors: [1] }, "translations", "same-length"],
    ["transforms.rotateShapes", { shapes: [S], axes: [P(1)], angles: [0] }, { shapes: [S], axes: [P(1)], angles: [0, 1] }, "angles", "same-length"],
    ["transforms.rotateAroundCenterShapes", { shapes: [S], axes: [P(1)], angles: [0], centers: [P(0)] }, { shapes: [S], axes: [], angles: [0], centers: [P(0)] }, "axes", "same-length"],
    ["transforms.alignShapes", { shapes: [S], fromOrigins: [P(0)], fromDirections: [P(1)], toOrigins: [P(0)], toDirections: [P(1)] }, { shapes: [S], fromOrigins: [P(0)], fromDirections: [P(1)], toOrigins: [P(0)], toDirections: [] }, "toDirections", "same-length"],
    ["transforms.alignAndTranslateShapes", { shapes: [S], centers: [P(0)], directions: [P(1)] }, { shapes: [S], centers: [P(0)], directions: [] }, "directions", "same-length"],
    ["transforms.translateShapes", { shapes: [S], translations: [P(1)] }, { shapes: [S], translations: [] }, "translations", "same-length"],
    ["transforms.scaleShapes", { shapes: [S], factors: [1] }, { shapes: [S], factors: [] }, "factors", "same-length"],
    ["transforms.scale3dShapes", { shapes: [S], scales: [[1, 1, 1]], centers: [P(0)] }, { shapes: [S], scales: [[1, 1, 1]], centers: [] }, "centers", "same-length"],
    ["transforms.mirrorShapes", { shapes: [S], directions: [P(1)], origins: [P(0)] }, { shapes: [S], directions: [P(1)], origins: [] }, "origins", "same-length"],
    ["transforms.mirrorAlongNormalShapes", { shapes: [S], normals: [P(1)], origins: [P(0)] }, { shapes: [S], normals: [], origins: [P(0)] }, "normals", "same-length"],
    ["shapes.wire.createLineWireWithExtensions", { start: P(0), end: P(1) }, { start: P(1), end: P(1) }, "end", "distinct"],
    ["shapes.wire.createBezierWeights", { points: [P(0), P(1), P(2)], weights: [1, 1, 1] }, { points: [P(0), P(1), P(2)], weights: [1, 1] }, "weights", "custom"],
    ["shapes.wire.createBezierWeights", { points: [P(0), P(1), P(2)], weights: [1, 1, 1, 1], closed: true }, { points: [P(0), P(1), P(2)], weights: [1, 1, 1], closed: true }, "weights", "custom"],
    ["shapes.wire.createBezierWeights", { points: [P(0), P(1), P(2)], weights: [1, 1, 1], closed: true, periodic: true }, { points: [P(0), P(1), P(2)], weights: [1, 1, 1, 1], closed: true, periodic: true }, "weights", "custom"],
    ["shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges", { shapes: [S, S] }, { shapes: [S] }, "shapes", "custom"],
    ["shapes.wire.createWiresBetweenSubdividedPointsOfWiresAndEdges", { shapes: [S, S] }, { shapes: [S] }, "shapes", "custom"],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", { listsOfCircles: [[S], [S, S]], combination: "allWithAll" }, { listsOfCircles: [[S], [S, S]], combination: "inOrder" }, "listsOfCircles", "custom"],
    ["shapes.solid.createTorus", { majorRadius: 2, minorRadius: 1 }, { majorRadius: 2, minorRadius: 3 }, "minorRadius", "less-than"],
    ["operations.slice", { shape: S, step: 1 }, { shape: S, step: 0 }, "step", "custom"],
    ["operations.sliceInStepPattern", { shape: S, steps: [0, 1] }, { shape: S, steps: [0] }, "steps", "at-least-one"],
    ["shapes.solid.createIBeamProfileSolid", profile, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createHBeamProfileSolid", profile, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createTBeamProfileSolid", profile, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createUBeamProfileSolid", profile, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createStarSolid", { extrusionLengthFront: 0, extrusionLengthBack: 1 }, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createNGonSolid", profile, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createParallelogramSolid", profile, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createHeartSolid", profile, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createChristmasTreeSolid", profile, flat, "extrusionLengthFront", "custom"],
    ["shapes.solid.createLPolygonSolid", profile, flat, "extrusionLengthFront", "custom"],
];

describe("the OCCT input rules", () => {
    it.each(rows)("%s should pass inputs that satisfy its rule", (path, fine, _wrong, _property, code) => {
        // Act
        const issues = issuesOf(path, fine).filter((found) => found.code === code);

        // Assert
        expect(issues).toEqual([]);
    });

    it.each(rows)("%s should report the property that breaks its rule", (path, _fine, wrong, property, code) => {
        // Act
        const issues = issuesOf(path, wrong);

        // Assert
        expect(issues).toContainEqual(expect.objectContaining({ property, code }));
    });

    it("should not compare a fillet's radius list with its indexes when either is empty", () => {
        // Act
        const issues = issuesOf("fillets.filletEdges", { shape: S, radiusList: [], indexes: [1, 2] });

        // Assert
        expect(issues).toEqual([]);
    });
});
