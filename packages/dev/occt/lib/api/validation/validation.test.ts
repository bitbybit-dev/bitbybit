import { describe, it, expect } from "vitest";
import type { InputIssue } from "@bitbybit-dev/base";
import { resolveInputs, validateInputs } from "@bitbybit-dev/base";
import { occtDtoRegistry } from "../dto-registry";
import { occtDtoRules } from "./index";

const S = { hash: 1, type: "occ-shape" };
const P = (x: number): number[] => [x, 0, 0];

const issuesOf = (path: string, inputs: object): InputIssue[] => validateInputs(occtDtoRegistry, path, resolveInputs(occtDtoRegistry, path, inputs), occtDtoRules);

const unpaired = (property: string, other: string, expected: number, actual: number): InputIssue => ({
    property,
    code: "same-length",
    params: { expected, actual },
    message: `must have as many items as ${other} (${expected}), not ${actual}`,
});

type Row = [path: string, what: string, inputs: object, issues: InputIssue[]];

type GatedFillet = [path: string, owner: object, list: string];

const pairedWhenBothGiven: GatedFillet[] = [
    ["fillets.filletEdges", { shape: S }, "radiusList"],
    ["fillets.fillet2d", { shape: S }, "radiusList"],
    ["fillets.fillet2dShapes", { shapes: [S] }, "radiusList"],
];

const pairedWhenIndexesSelect: GatedFillet[] = [
    ["fillets.fillet3DWire", { shape: S }, "radiusList"],
    ["fillets.fillet3DWires", { shapes: [S] }, "radiusList"],
    ["fillets.chamferEdges", { shape: S }, "distanceList"],
];

const gatedFilletRows: Row[] = [...pairedWhenBothGiven, ...pairedWhenIndexesSelect].flatMap(([path, owner, list]): Row[] => [
    [path, `pass a ${list} as long as its indexes`, { ...owner, [list]: [1, 2], indexes: [1, 2] }, []],
    [path, `pass a ${list} of one item for one index`, { ...owner, [list]: [1], indexes: [1] }, []],
    [path, `report a ${list} shorter than its indexes`, { ...owner, [list]: [1], indexes: [1, 2] }, [unpaired(list, "indexes", 2, 1)]],
    [path, `report a ${list} longer than its indexes`, { ...owner, [list]: [1, 2, 3], indexes: [1, 2] }, [unpaired(list, "indexes", 2, 3)]],
    [path, `report an empty ${list} for indexes that select something`, { ...owner, [list]: [], indexes: [1, 2] }, [unpaired(list, "indexes", 2, 0)]],
    [path, `pass an empty ${list} with empty indexes`, { ...owner, [list]: [], indexes: [] }, []],
    [path, `not compare a ${list} when the indexes are left out`, { ...owner, [list]: [1, 2] }, []],
    [path, `not compare the indexes when the ${list} is left out`, { ...owner, indexes: [1, 2] }, []],
]).concat(
    pairedWhenBothGiven.map(([path, owner, list]): Row => [path, `report a ${list} given with empty indexes`, { ...owner, [list]: [1, 2], indexes: [] }, [unpaired(list, "indexes", 0, 2)]]),
    pairedWhenIndexesSelect.map(([path, owner, list]): Row => [path, `not compare a ${list} with empty indexes, which select everything`, { ...owner, [list]: [1, 2], indexes: [] }, []]),
);

const filletRows: Row[] = [
    ["fillets.filletEdgesList", "pass one radius per edge", { shape: S, edges: [S, S], radiusList: [1, 2] }, []],
    ["fillets.filletEdgesList", "report a radius list shorter than the edges", { shape: S, edges: [S, S], radiusList: [1] }, [unpaired("radiusList", "edges", 2, 1)]],
    ["fillets.filletEdgeVariableRadius", "pass one radius per parameter", { shape: S, edge: S, radiusList: [1, 2], paramsU: [0, 1] }, []],
    ["fillets.filletEdgeVariableRadius", "report a radius list longer than the parameters", { shape: S, edge: S, radiusList: [1, 2], paramsU: [0] }, [unpaired("radiusList", "paramsU", 1, 2)]],
    ["fillets.filletEdgesSameVariableRadius", "pass one radius per parameter", { shape: S, edges: [S], radiusList: [1, 2], paramsU: [0, 1] }, []],
    ["fillets.filletEdgesSameVariableRadius", "report a radius list longer than the parameters", { shape: S, edges: [S], radiusList: [1, 2], paramsU: [0] }, [unpaired("radiusList", "paramsU", 1, 2)]],
    ["fillets.filletEdgesVariableRadius", "pass one radius list and one parameter list per edge", { shape: S, edges: [S, S], radiusLists: [[1], [2]], paramsULists: [[0], [1]] }, []],
    ["fillets.filletEdgesVariableRadius", "report radius lists that do not pair with the edges", { shape: S, edges: [S, S], radiusLists: [[1]], paramsULists: [[0], [1]] }, [unpaired("radiusLists", "edges", 2, 1)]],
    ["fillets.filletEdgesVariableRadius", "report parameter lists that do not pair with the edges", { shape: S, edges: [S, S], radiusLists: [[1], [2]], paramsULists: [[0]] }, [unpaired("paramsULists", "edges", 2, 1)]],
    ["fillets.filletEdgesVariableRadius", "report both lists in the order the rules are written", { shape: S, edges: [S, S], radiusLists: [[1]], paramsULists: [[0], [1], [2]] }, [unpaired("radiusLists", "edges", 2, 1), unpaired("paramsULists", "edges", 2, 3)]],
    ["fillets.chamferEdgesList", "pass one distance per edge", { shape: S, edges: [S, S], distanceList: [1, 2] }, []],
    ["fillets.chamferEdgesList", "report a distance list longer than the edges", { shape: S, edges: [S, S], distanceList: [1, 2, 3] }, [unpaired("distanceList", "edges", 2, 3)]],
    ["fillets.chamferEdgesTwoDistances", "pass one face per edge", { shape: S, edges: [S, S], faces: [S, S] }, []],
    ["fillets.chamferEdgesTwoDistances", "report faces that do not pair with the edges", { shape: S, edges: [S, S], faces: [S] }, [unpaired("faces", "edges", 2, 1)]],
    ["fillets.chamferEdgesTwoDistancesLists", "pass one face and two distances per edge", { shape: S, edges: [S, S], faces: [S, S], distances1: [1, 2], distances2: [1, 2] }, []],
    ["fillets.chamferEdgesTwoDistancesLists", "report faces that do not pair with the edges", { shape: S, edges: [S, S], faces: [S], distances1: [1, 2], distances2: [1, 2] }, [unpaired("faces", "edges", 2, 1)]],
    ["fillets.chamferEdgesTwoDistancesLists", "report first distances that do not pair with the edges", { shape: S, edges: [S, S], faces: [S, S], distances1: [1], distances2: [1, 2] }, [unpaired("distances1", "edges", 2, 1)]],
    ["fillets.chamferEdgesTwoDistancesLists", "report second distances that do not pair with the edges", { shape: S, edges: [S, S], faces: [S, S], distances1: [1, 2], distances2: [1] }, [unpaired("distances2", "edges", 2, 1)]],
    ["fillets.chamferEdgesDistsAngles", "pass one face, distance and angle per edge", { shape: S, edges: [S, S], faces: [S, S], distances: [1, 2], angles: [30, 45] }, []],
    ["fillets.chamferEdgesDistsAngles", "report faces that do not pair with the edges", { shape: S, edges: [S, S], faces: [S], distances: [1, 2], angles: [30, 45] }, [unpaired("faces", "edges", 2, 1)]],
    ["fillets.chamferEdgesDistsAngles", "report distances that do not pair with the edges", { shape: S, edges: [S, S], faces: [S, S], distances: [1], angles: [30, 45] }, [unpaired("distances", "edges", 2, 1)]],
    ["fillets.chamferEdgesDistsAngles", "report angles that do not pair with the edges", { shape: S, edges: [S, S], faces: [S, S], distances: [1, 2], angles: [30] }, [unpaired("angles", "edges", 2, 1)]],
    ["fillets.chamferEdgesDistAngle", "pass one face per edge", { shape: S, edges: [S, S], faces: [S, S] }, []],
    ["fillets.chamferEdgesDistAngle", "report faces that do not pair with the edges", { shape: S, edges: [S, S], faces: [S] }, [unpaired("faces", "edges", 2, 1)]],
];

const pairedTransforms: [path: string, lists: Record<string, unknown[]>][] = [
    ["transforms.transformShapes", { translations: [P(0), P(1)], rotationAxes: [P(1), P(1)], rotationAngles: [0, 90], scaleFactors: [1, 2] }],
    ["transforms.rotateShapes", { axes: [P(1), P(1)], angles: [0, 90] }],
    ["transforms.rotateAroundCenterShapes", { axes: [P(1), P(1)], angles: [0, 90], centers: [P(0), P(0)] }],
    ["transforms.alignShapes", { fromOrigins: [P(0), P(0)], fromDirections: [P(1), P(1)], toOrigins: [P(0), P(0)], toDirections: [P(1), P(1)] }],
    ["transforms.alignAndTranslateShapes", { centers: [P(0), P(0)], directions: [P(1), P(1)] }],
    ["transforms.translateShapes", { translations: [P(1), P(2)] }],
    ["transforms.scaleShapes", { factors: [1, 2] }],
    ["transforms.scale3dShapes", { scales: [[1, 1, 1], [2, 2, 2]], centers: [P(0), P(0)] }],
    ["transforms.mirrorShapes", { directions: [P(1), P(1)], origins: [P(0), P(0)] }],
    ["transforms.mirrorAlongNormalShapes", { normals: [P(1), P(1)], origins: [P(0), P(0)] }],
];

const flattens = (property: string, message = "must not be 0, which flattens the shape"): InputIssue[] => [{ property, code: "custom", message }];

const transformRows: Row[] = pairedTransforms.flatMap(([path, lists]): Row[] => [
    [path, "pass one item of every list per shape", { shapes: [S, S], ...lists }, []],
    ...Object.entries(lists).map(([list, items]): Row => [path, `report ${list} that do not pair with the shapes`, { shapes: [S, S], ...lists, [list]: items.slice(0, 1) }, [unpaired(list, "shapes", 2, 1)]]),
]);

const scaleRows: Row[] = [
    ["transforms.scale", "pass a negative factor, which also mirrors", { shape: S, factor: -1 }, []],
    ["transforms.scale", "report a factor of 0", { shape: S, factor: 0 }, flattens("factor")],
    ["transforms.scaleFromCenter", "pass a negative factor, which also mirrors", { shape: S, factor: -2 }, []],
    ["transforms.scaleFromCenter", "report a factor of 0", { shape: S, factor: 0 }, flattens("factor")],
    ["transforms.transform", "pass a negative scale factor, which also mirrors", { shape: S, scaleFactor: -1 }, []],
    ["transforms.transform", "report a scale factor of 0", { shape: S, scaleFactor: 0 }, flattens("scaleFactor")],
    ["transforms.scale3d", "pass a negative factor on one axis, which mirrors along it", { shape: S, scale: [-1, 1, 1] }, []],
    ["transforms.scale3d", "report a factor of 0 on one axis", { shape: S, scale: [1, 0, 1] }, flattens("scale", "must not hold a 0, which flattens the shape")],
    ["transforms.scaleShapes", "pass negative factors", { shapes: [S, S], factors: [1, -1] }, []],
    ["transforms.scaleShapes", "report a factor of 0 for one shape", { shapes: [S, S], factors: [1, 0] }, flattens("factors", "must not hold a 0, which flattens its shape")],
    ["transforms.scale3dShapes", "report a factor of 0 in one set of factors", { shapes: [S, S], scales: [[1, 1, 1], [1, 1, 0]], centers: [P(0), P(0)] }, flattens("scales", "must not hold a 0 in any set of factors, which flattens its shape")],
    ["transforms.transformShapes", "report a scale factor of 0 for one shape", { shapes: [S, S], translations: [P(0), P(1)], rotationAxes: [P(1), P(1)], rotationAngles: [0, 90], scaleFactors: [1, 0] }, flattens("scaleFactors", "must not hold a 0, which flattens its shape")],
];

const bezierIssue: InputIssue = { property: "weights", code: "custom", message: "must have one weight per point, and one more when the curve is closed but not periodic" };
const torusIssue: InputIssue = { property: "minorRadius", code: "custom", message: "must not exceed majorRadius" };
const ellipseIssue: InputIssue = { property: "radiusMinor", code: "custom", message: "must not exceed radiusMajor" };
const stepsIssue: InputIssue = { property: "steps", code: "custom", message: "must add up to more than 0, or the slices never move along the shape" };
const lengthsIssue: InputIssue = { property: "lengths", code: "custom", message: "must add up to more than 0, or the points never move along the wire" };
const ellipses = ["shapes.wire.createEllipseWire", "shapes.edge.createEllipseEdge", "shapes.face.createEllipseFace", "geom.curves.geomEllipseCurve", "geom.curves.geom2dEllipse"];
const threePoints = [P(0), P(1), P(2)];

const shapeRows: Row[] = [
    ["shapes.wire.createLineWireWithExtensions", "pass the default ends", {}, []],
    ["shapes.wire.createLineWireWithExtensions", "pass two different ends", { start: P(0), end: P(1) }, []],
    ["shapes.wire.createLineWireWithExtensions", "pass ends that differ in their last coordinate only", { start: [0, 0, 0], end: [0, 0, 1e-9] }, []],
    ["shapes.wire.createLineWireWithExtensions", "report an end that is the start", { start: P(1), end: P(1) }, [{ property: "end", code: "distinct", message: "must differ from start" }]],
    ["shapes.wire.createBezierWeights", "pass one weight per point on an open curve", { points: threePoints, weights: [1, 1, 1] }, []],
    ["shapes.wire.createBezierWeights", "report too few weights on an open curve", { points: threePoints, weights: [1, 1] }, [bezierIssue]],
    ["shapes.wire.createBezierWeights", "report too many weights on an open curve", { points: threePoints, weights: [1, 1, 1, 1] }, [bezierIssue]],
    ["shapes.wire.createBezierWeights", "pass one more weight than points on a closed curve", { points: threePoints, weights: [1, 1, 1, 1], closed: true }, []],
    ["shapes.wire.createBezierWeights", "report one weight per point on a closed curve", { points: threePoints, weights: [1, 1, 1], closed: true }, [bezierIssue]],
    ["shapes.wire.createBezierWeights", "pass one weight per point on a closed periodic curve", { points: threePoints, weights: [1, 1, 1], closed: true, periodic: true }, []],
    ["shapes.wire.createBezierWeights", "report one more weight than points on a closed periodic curve", { points: threePoints, weights: [1, 1, 1, 1], closed: true, periodic: true }, [bezierIssue]],
    ["shapes.wire.createBezierWeights", "pass one weight per point on a periodic curve that is not closed", { points: threePoints, weights: [1, 1, 1], periodic: true }, []],
    ["shapes.wire.createBezierWeights", "report one more weight than points on a periodic curve that is not closed", { points: threePoints, weights: [1, 1, 1, 1], periodic: true }, [bezierIssue]],
    ["shapes.wire.createBezierWeights", "not weigh the points when whether the curve is closed is not a boolean", { points: threePoints, weights: [1, 1, 1], closed: "yes" }, [{ property: "closed", code: "type", message: "must be true or false" }]],
    ["shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges", "pass exactly two wires", { shapes: [S, S] }, []],
    ["shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges", "report a single wire", { shapes: [S] }, [{ property: "shapes", code: "custom", message: "must hold at least two wires or edges" }]],
    ["shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges", "report no wires at all", { shapes: [] }, [{ property: "shapes", code: "custom", message: "must hold at least two wires or edges" }]],
    ["shapes.wire.createWiresBetweenSubdividedPointsOfWiresAndEdges", "pass exactly two wires", { shapes: [S, S] }, []],
    ["shapes.wire.createWiresBetweenSubdividedPointsOfWiresAndEdges", "report a single wire", { shapes: [S] }, [{ property: "shapes", code: "custom", message: "must hold at least two wires or edges" }]],
    ["shapes.solid.createTorus", "pass a tube thinner than its ring", { majorRadius: 2, minorRadius: 1.999 }, []],
    ["shapes.solid.createTorus", "pass a tube exactly as thick as its ring, which closes the hole", { majorRadius: 2, minorRadius: 2 }, []],
    ["shapes.solid.createTorus", "report a tube thicker than its ring", { majorRadius: 2, minorRadius: 2.001 }, [torusIssue]],
    ["shapes.solid.createTorus", "not compare the tube with a ring that is not a number", { majorRadius: Number.NaN, minorRadius: 3 }, [{ property: "majorRadius", code: "not-a-number", message: "is not a number (NaN)" }]],
    ["operations.slice", "pass the default step", { shape: S }, []],
    ["operations.slice", "pass the smallest step that moves", { shape: S, step: 1e-9 }, []],
    ["operations.slice", "report a step of exactly 0", { shape: S, step: 0 }, [{ property: "step", code: "custom", message: "must be above 0" }]],
    ["operations.slice", "report a negative step by its bound alone", { shape: S, step: -1 }, [{ property: "step", code: "minimum", params: { limit: 0, exclusive: false, actual: -1 }, message: "must be at least 0" }]],
    ["operations.sliceInStepPattern", "pass the default steps", { shape: S }, []],
    ["operations.sliceInStepPattern", "pass steps of which one moves", { shape: S, steps: [0, 1e-9] }, []],
    ["operations.sliceInStepPattern", "pass steps that move back less than they move forward", { shape: S, steps: [2, -1] }, []],
    ["operations.sliceInStepPattern", "report steps of which none moves", { shape: S, steps: [0, -1] }, [stepsIssue]],
    ["operations.sliceInStepPattern", "report steps that move back as far as they move forward", { shape: S, steps: [1, -1] }, [stepsIssue]],
    ["operations.sliceInStepPattern", "report steps that move back further than they move forward", { shape: S, steps: [1, -2] }, [stepsIssue]],
    ["operations.sliceInStepPattern", "report no steps at all", { shape: S, steps: [] }, [stepsIssue]],
    ["shapes.wire.pointsOnWireAtPatternOfLengths", "pass one length that moves", { shape: S, lengths: [1] }, []],
    ["shapes.wire.pointsOnWireAtPatternOfLengths", "pass lengths that move back less than they move forward", { shape: S, lengths: [2, -1] }, []],
    ["shapes.wire.pointsOnWireAtPatternOfLengths", "report no lengths at all", { shape: S, lengths: [] }, [lengthsIssue]],
    ["shapes.wire.pointsOnWireAtPatternOfLengths", "report a single length of 0", { shape: S, lengths: [0] }, [lengthsIssue]],
    ["shapes.wire.pointsOnWireAtPatternOfLengths", "report lengths that move back as far as they move forward", { shape: S, lengths: [1, -1] }, [lengthsIssue]],
    ["operations.revolve", "pass the default angle", { shape: S }, []],
    ["operations.revolve", "pass a negative angle, which spins the other way", { shape: S, angle: -90 }, []],
    ["operations.revolve", "pass a full turn the other way", { shape: S, angle: -360 }, []],
    ["operations.revolve", "report an angle of 0", { shape: S, angle: 0 }, [{ property: "angle", code: "custom", message: "must not be 0, or nothing is swept" }]],
    ...ellipses.flatMap((path): Row[] => [
        [path, "pass a minor radius below the major one", { radiusMinor: 1, radiusMajor: 2 }, []],
        [path, "pass a minor radius equal to the major one, which is a circle", { radiusMinor: 2, radiusMajor: 2 }, []],
        [path, "report a minor radius above the major one", { radiusMinor: 3, radiusMajor: 1 }, [ellipseIssue]],
    ]),
];

const circlesIssue: InputIssue = { property: "listsOfCircles", code: "custom", message: "must hold lists of one length when circles are joined in order" };

const circleCollectionRows: Row[] = [
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "pass lists of different lengths joined all with all", { listsOfCircles: [[S], [S, S]], combination: "allWithAll" }, []],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "pass lists of different lengths under the default combination", { listsOfCircles: [[S], [S, S]] }, []],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "pass lists of one length joined in order", { listsOfCircles: [[S, S], [S, S]], combination: "inOrder" }, []],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "report a later list longer than the first when joined in order", { listsOfCircles: [[S], [S, S]], combination: "inOrder" }, [circlesIssue]],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "report a later list shorter than the first when joined in order", { listsOfCircles: [[S, S], [S, S], [S]], combination: "inOrder" }, [circlesIssue]],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "pass lists of one length joined in a closed order", { listsOfCircles: [[S], [S]], combination: "inOrderClosed" }, []],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "report lists of different lengths joined in a closed order", { listsOfCircles: [[S], [S, S]], combination: "inOrderClosed" }, [circlesIssue]],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "pass no lists at all joined in order", { listsOfCircles: [], combination: "inOrder" }, []],
    ["shapes.face.createFaceFromMultipleCircleTanWireCollections", "report only the combination when it is not one it knows", { listsOfCircles: [[S], [S, S]], combination: "sideways" }, [{ property: "combination", code: "enum", params: { allowed: ["allWithAll", "inOrder", "inOrderClosed"] }, message: "must be one of allWithAll, inOrder, inOrderClosed" }]],
];

const profileSolids = [
    "shapes.solid.createIBeamProfileSolid",
    "shapes.solid.createHBeamProfileSolid",
    "shapes.solid.createTBeamProfileSolid",
    "shapes.solid.createUBeamProfileSolid",
    "shapes.solid.createStarSolid",
    "shapes.solid.createNGonSolid",
    "shapes.solid.createParallelogramSolid",
    "shapes.solid.createHeartSolid",
    "shapes.solid.createChristmasTreeSolid",
    "shapes.solid.createLPolygonSolid",
];

const profileRows: Row[] = profileSolids.flatMap((path): Row[] => [
    [path, "pass a profile extruded to the front only", { extrusionLengthFront: 1, extrusionLengthBack: 0 }, []],
    [path, "pass a profile extruded to the back only", { extrusionLengthFront: 0, extrusionLengthBack: 1 }, []],
    [path, "pass a profile extruded by the smallest amount", { extrusionLengthFront: 1e-9, extrusionLengthBack: 0 }, []],
    [path, "report a profile extruded neither way", { extrusionLengthFront: 0, extrusionLengthBack: 0 }, [{ property: "extrusionLengthFront", code: "custom", message: "or extrusionLengthBack must be above 0, or the profile has no thickness" }]],
    [path, "report a negative back extrusion by its bound alone", { extrusionLengthFront: 0, extrusionLengthBack: -1 }, [{ property: "extrusionLengthBack", code: "minimum", params: { limit: 0, exclusive: false, actual: -1 }, message: "must be at least 0" }]],
]);

describe("the OCCT input rules", () => {
    describe("fillets and chamfers whose lists pair with the indexes whenever the service reads them", () => {
        it.each(gatedFilletRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });

    describe("fillets and chamfers whose lists always pair", () => {
        it.each(filletRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });

    describe("transforms of several shapes at once", () => {
        it.each(transformRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });

    describe("scales, which may mirror but never flatten", () => {
        it.each(scaleRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });

    describe("wires, solids and slices", () => {
        it.each(shapeRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });

    describe("circle collections, whose lists pair only when joined in order", () => {
        it.each(circleCollectionRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });

    describe("profile solids, which need some thickness", () => {
        it.each(profileRows)("%s should %s", (path, _what, inputs, issues) => {
            // Act
            const found = issuesOf(path, inputs);

            // Assert
            expect(found).toEqual(issues);
        });
    });
});
