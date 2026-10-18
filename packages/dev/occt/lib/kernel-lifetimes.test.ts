import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { OCCTService } from "./occ-service";
import * as Inputs from "./api/inputs";
import { handlesIn, ledgerRun, namesOf } from "./__test__/kernel-ledger";

type Act = () => unknown;
type Arranged = [string, () => Act];

describe("OCCT kernel object lifetimes", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;
    let och: OccHelper;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        och = new OccHelper(kernel);
        occt = new OCCTService(kernel, och);
    }, 120_000);

    const box = (size = 10): TopoDS_Shape => occt.shapes.solid.createBox({ width: size, length: size, height: size, center: [0, 0, 0] });
    const ball = (): TopoDS_Shape => occt.shapes.solid.createSphere({ radius: 6, center: [5, 5, 5] });
    const rectangleWire = (): TopoDS_Wire => occt.shapes.wire.createRectangleWire({ width: 8, length: 4, center: [0, 0, 0], direction: [0, 1, 0] });
    const rectangleFace = (): TopoDS_Face => occt.shapes.face.createRectangleFace({ width: 8, length: 4, center: [0, 0, 0], direction: [0, 1, 0] });
    const circleWire = (radius: number, x: number): TopoDS_Wire => occt.shapes.wire.createCircleWire({ radius, center: [x, 0, 0], direction: [0, 1, 0] });
    const line = (end: Inputs.Base.Point3): TopoDS_Edge => occt.shapes.edge.line({ start: [0, 0, 0], end });
    const roundedOutline = (): TopoDS_Wire => occt.fillets.fillet3DWire({ shape: occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [6, 0, 0], [6, 0, 4], [0, 0, 4]] }), radius: 1, direction: [0, 1, 0] });

    const leavesNothingButItsAnswer = (arrange: () => Act): void => {
        // Arrange
        const act = arrange();

        // Act
        const run = ledgerRun(kernel, act);

        // Assert
        expect(run.thrown).toBeUndefined();
        expect(namesOf(run.leaked)).toEqual([]);
    };

    const leavesNothingWhenItFails = (arrange: () => Act): void => {
        // Arrange
        const act = arrange();

        // Act
        const run = ledgerRun(kernel, act);

        // Assert
        expect(run.thrown).toBeDefined();
        expect(namesOf(run.leaked)).toEqual([]);
    };

    describe("a call that succeeds keeps only what it hands back", () => {
        const leaking: Arranged[] = [
            ["intersecting a box with a ball", () => { const shapes = [box(), ball()]; return () => occt.booleans.intersection({ shapes, keepEdges: false }); }],
            ["measuring the closest points between a box and a ball apart from it", () => { const shape1 = box(); const shape2 = occt.shapes.solid.createSphere({ radius: 1, center: [20, 0, 0] }); return () => occt.operations.closestPointsBetweenTwoShapes({ shape1, shape2 }); }],
            ["writing a filleted box to STEP", () => { const shape = occt.fillets.filletEdges({ shape: box(), radius: 1 }); return () => occt.io.saveShapeSTEP({ shape, fileName: "part.step", adjustYtoZ: false }); }],
            ["writing a box to STEP turned to Z up", () => { const shape = box(); return () => occt.io.saveShapeSTEP({ shape, fileName: "part.step", adjustYtoZ: true }); }],
            ["rounding the corners of a rectangle wire", () => { const shape = rectangleWire(); return () => occt.fillets.fillet2d({ shape, radius: 0.5 }); }],
            ["rounding the corners of a rectangle face", () => { const shape = rectangleFace(); return () => occt.fillets.fillet2d({ shape, radius: 0.5 }); }],
            ["rounding two corners of a rectangle wire by index", () => { const shape = rectangleWire(); return () => occt.fillets.fillet2d({ shape, radiusList: [0.5, 1], indexes: [1, 3] }); }],
            ["rounding the corners of two outlines", () => { const shapes = [rectangleWire(), rectangleWire()]; return () => occt.fillets.fillet2dShapes({ shapes, radius: 0.5 }); }],
            ["bevelling the corners of a rectangle wire", () => { const shape = rectangleWire(); return () => occt.fillets.chamfer2dVertices({ shape, distance: 0.5 }); }],
            ["bevelling the corners of a rectangle face", () => { const shape = rectangleFace(); return () => occt.fillets.chamfer2dVertices({ shape, distance: 0.5 }); }],
            ["dimensioning the length between two points", () => { const inputs = { ...new Inputs.OCCT.SimpleLinearLengthDimensionDto(), start: [0, 0, 0] as Inputs.Base.Point3, end: [10, 0, 0] as Inputs.Base.Point3, direction: [0, 0, 2] as Inputs.Base.Vector3 }; return () => occt.dimensions.simpleLinearLengthDimension(inputs); }],
            ["dimensioning an angle", () => { const inputs = { ...new Inputs.OCCT.SimpleAngularDimensionDto(), direction1: [1, 0, 0] as Inputs.Base.Vector3, direction2: [0, 0, 1] as Inputs.Base.Vector3 }; return () => occt.dimensions.simpleAngularDimension(inputs); }],
            ["pinning a label to a point", () => { const inputs = new Inputs.OCCT.PinWithLabelDto(); return () => occt.dimensions.pinWithLabel(inputs); }],
            ["reading the start point of an edge", () => { const shape = line([4, 0, 0]); return () => occt.shapes.edge.startPointOnEdge({ shape }); }],
            ["reading the end point of an edge", () => { const shape = line([4, 0, 0]); return () => occt.shapes.edge.endPointOnEdge({ shape }); }],
            ["reading the start points of two edges", () => { const shapes = [line([4, 0, 0]), line([0, 4, 0])]; return () => occt.shapes.edge.startPointsOnEdges({ shapes }); }],
            ["reading the end points of two edges", () => { const shapes = [line([4, 0, 0]), line([0, 4, 0])]; return () => occt.shapes.edge.endPointsOnEdges({ shapes }); }],
            ["tracing every edge of a box as points", () => { const shape = box(); return () => occt.shapes.edge.edgesToPoints({ shape, angularDeflection: 0.1, curvatureDeflection: 0.1, minimumOfPoints: 2, uTolerance: 1e-7, minimumLength: 1e-7 }); }],
            ["picking the arcs out of a rounded outline", () => { const shape = roundedOutline(); return () => occt.shapes.edge.getCircularEdgesAlongWire({ shape }); }],
            ["picking the straight edges out of a rounded outline", () => { const shape = roundedOutline(); return () => occt.shapes.edge.getLinearEdgesAlongWire({ shape }); }],
            ["reading the corner points of a box's edges", () => { const shape = box(); return () => occt.shapes.edge.getCornerPointsOfEdgesForShape({ shape }); }],
            ["reading the corners of a box as points", () => { const shape = box(); return () => occt.shapes.vertex.getVerticesAsPoints({ shape }); }],
            ["describing a box for debugging", () => { const shape = occt.shapes.solid.getSolids({ shape: box() })[0]!; return () => occt.shapes.solid.debugInfo({ shape }); }],
            ["describing a sewn shell for debugging", () => { const shape = occt.shapes.shell.sewFaces({ shapes: occt.shapes.face.getFaces({ shape: box() }), tolerance: 1e-7 }); return () => occt.shapes.shell.debugInfo({ shape }); }],
            ["describing a wire for debugging", () => { const shape = rectangleWire(); return () => occt.shapes.wire.debugInfo({ shape }); }],
            ["drawing a star face", () => { const inputs = new Inputs.OCCT.StarDto(); return () => occt.shapes.face.createStarFace(inputs); }],
            ["drawing a heart face", () => { const inputs = new Inputs.OCCT.Heart2DDto(); return () => occt.shapes.face.createHeartFace(inputs); }],
            ["drawing an L-shaped face", () => { const inputs = new Inputs.OCCT.LPolygonDto(); return () => occt.shapes.face.createLPolygonFace(inputs); }],
            ["drawing an I-beam profile face", () => { const inputs = new Inputs.OCCT.IBeamProfileDto(); return () => occt.shapes.face.createIBeamProfileFace(inputs); }],
            ["drawing a hexagon face", () => { const inputs = new Inputs.OCCT.NGonWireDto(); return () => occt.shapes.face.createNGonFace(inputs); }],
            ["drawing a grid of hexagon faces", () => { const inputs = new Inputs.OCCT.HexagonsInGridDto(); return () => occt.shapes.face.hexagonsInGrid(inputs); }],
            ["building a star solid", () => { const inputs = new Inputs.OCCT.StarSolidDto(); return () => occt.shapes.solid.createStarSolid(inputs); }],
            ["building a hexagonal prism", () => { const inputs = new Inputs.OCCT.NGonSolidDto(); return () => occt.shapes.solid.createNGonSolid(inputs); }],
            ["building an I-beam", () => { const inputs = new Inputs.OCCT.IBeamProfileSolidDto(); return () => occt.shapes.solid.createIBeamProfileSolid(inputs); }],
            ["drawing a christmas tree outline", () => { const inputs = new Inputs.OCCT.ChristmasTreeDto(); return () => occt.shapes.wire.createChristmasTreeWire(inputs); }],
            ["writing a word as wires with their data", () => { const inputs = { ...new Inputs.OCCT.TextWiresDto(), text: "Bit" }; return () => occt.shapes.wire.textWiresWithData(inputs); }],
            ["joining two circles by their tangent lines", () => { const circle1 = circleWire(2, 0); const circle2 = circleWire(1, 6); return () => occt.shapes.wire.createWireFromTwoCirclesTan({ circle1, circle2, keepLines: Inputs.OCCT.twoSidesStrictEnum.outside, circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside, tolerance: 1e-7 }); }],
            ["zig-zagging between two outlines", () => { const wire1 = rectangleWire(); const wire2 = occt.shapes.wire.createRectangleWire({ width: 8, length: 4, center: [0, 3, 0], direction: [0, 1, 0] }); return () => occt.shapes.wire.createZigZagBetweenTwoWires({ wire1, wire2, nrZigZags: 4 }); }],
            ["moving the seam of a wire by a length", () => { const shape = rectangleWire(); return () => occt.shapes.wire.moveWireSeamByLength({ shape, length: 1 }); }],
            ["moving the seam of a wire by a parameter", () => { const shape = rectangleWire(); return () => occt.shapes.wire.moveWireSeamByParameter({ shape, parameter: 0.3 }); }],
            ["rebuilding the degree of a wire", () => { const shape = rectangleWire(); return () => occt.shapes.wire.rebuildWireDegree({ shape, degree: 3, tolerance: 1e-4 }); }],
            ["reversing a wire edge by edge", () => { const shape = rectangleWire(); return () => occt.shapes.wire.reversedWireFromReversedEdges({ shape }); }],
            ["tracing the wires of a box as points", () => { const shape = box(); return () => occt.shapes.wire.wiresToPoints({ shape, angularDeflection: 0.1, curvatureDeflection: 0.1, minimumOfPoints: 2, uTolerance: 1e-7, minimumLength: 1e-7 }); }],
            ["subdividing a face into wires", () => { const shape = rectangleFace(); return () => occt.shapes.face.subdivideToWires({ shape, nrDivisions: 3, isU: true, shiftHalfStep: false, removeStart: false, removeEnd: false }); }],
            ["taking the wire along a face's parameter", () => { const shape = rectangleFace(); return () => occt.shapes.face.wireAlongParam({ shape, isU: true, param: 0.5 }); }],
            ["placing a wire on a face", () => { const face = rectangleFace(); const wire = occt.shapes.wire.createCircleWire({ radius: 0.2, center: [0.5, 0.5, 0], direction: [0, 0, 1] }); return () => occt.shapes.wire.placeWireOnFace({ wire, face }); }],
        ];

        const keeping: Arranged[] = [
            ["uniting a box and a ball", () => { const shapes = [box(), ball()]; return () => occt.booleans.union({ shapes, keepEdges: false }); }],
            ["cutting a ball out of a box, with history", () => { const shape = box(); const shapes = [ball()]; return () => occt.booleans.differenceWithHistory({ shape, shapes, keepEdges: false }); }],
            ["intersecting a box with a ball, with history", () => { const shapes = [box(), ball()]; return () => occt.booleans.intersectionWithHistory({ shapes, keepEdges: false }); }],
            ["rounding two edges of a box by index", () => { const shape = box(); return () => occt.fillets.filletEdges({ shape, radius: 1, indexes: [0, 3] }); }],
            ["bevelling two edges of a box by index, with history", () => { const shape = box(); return () => occt.fillets.chamferEdgesWithHistory({ shape, distance: 1, indexes: [0, 3] }); }],
            ["twisting a square face up", () => { const shape = occt.shapes.face.createSquareFace({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] }); return () => occt.operations.rotatedExtrudeWithHistory({ shape, height: 20, angle: 90, makeSolid: true }); }],
            ["lofting through circle edges", () => { const shapes = [occt.shapes.edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] }), occt.shapes.edge.createCircleEdge({ radius: 1, center: [0, 5, 0], direction: [0, 1, 0] })]; return () => occt.operations.loftWithHistory({ shapes, makeSolid: true }); }],
            ["splitting a box in two, with history", () => { const shape = box(); const shapes = [occt.shapes.face.createRectangleFace({ width: 20, length: 20, center: [0, 0, 0], direction: [1, 0, 0] })]; return () => occt.operations.splitShapeWithShapesWithHistory({ shape, shapes, localFuzzyTolerance: 1e-7, nonDestructive: false }); }],
            ["sewing the faces of a box into a solid, with history", () => { const shapes = occt.shapes.face.getFaces({ shape: box() }); return () => occt.shapes.solid.fromFacesWithHistory({ shapes, tolerance: 1e-7 }); }],
            ["meshing a box into buffers with metadata, iso curves and an analysis", () => { const shape = box(); return () => occt.shapeToMesh({ shape, precision: 0.1, computeMetadata: true, isoCurvesU: 2, isoCurvesV: 2, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.gaussian }); }],
            ["drawing a rectangle face", () => () => occt.shapes.face.createRectangleFace({ width: 8, length: 4, center: [0, 0, 0], direction: [0, 1, 0] })],
        ];

        it.each(leaking)("should keep nothing but its answer after %s", (_name, arrange) => leavesNothingButItsAnswer(arrange));

        it.each(keeping)("should keep nothing but its answer after %s, as it does today", (_name, arrange) => leavesNothingButItsAnswer(arrange));
    });

    describe("a call the kernel refuses keeps nothing it made", () => {
        const leaking: Arranged[] = [
            ["offsetting a small box by its default distance at its default tolerance", () => { const shape = box(4); return () => occt.operations.offset({ shape, distance: 0.2, tolerance: 0.1 }); }],
            ["revolving an edge that lies on the axis", () => { const shape = line([0, 4, 0]); return () => occt.operations.revolve({ shape, angle: 360, direction: [0, 1, 0], copy: false }); }],
            ["revolving a face about an axis with no length", () => { const shape = occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 0, 1] }); return () => occt.operations.revolve({ shape, angle: 90, direction: [0, 0, 0], copy: false }); }],
            ["rounding the edges of a lone face", () => { const shape = rectangleFace(); return () => occt.fillets.filletEdges({ shape, radius: 0.1 }); }],
            ["bevelling the edges of a lone face", () => { const shape = rectangleFace(); return () => occt.fillets.chamferEdges({ shape, distance: 0.1 }); }],
            ["rounding two edges by index with one radius listed", () => { const shape = box(); return () => occt.fillets.filletEdges({ shape, indexes: [0, 1], radiusList: [0.5] }); }],
            ["bevelling two edges by index with one distance listed", () => { const shape = box(); return () => occt.fillets.chamferEdges({ shape, indexes: [0, 1], distanceList: [0.5] }); }],
            ["bevelling an edge by distance and angle without its face", () => { const shape = box(); const edge = occt.shapes.edge.getEdge({ shape, index: 0 }); const inputs = { shape, edge, distance: 0.5, angle: 45 } as Inputs.OCCT.ChamferEdgeDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>; return () => occt.fillets.chamferEdgeDistAngle(inputs); }],
            ["rounding two edges in a plane with a radius too big for them", () => { const edge1 = line([4, 0, 0]); const edge2 = occt.shapes.edge.line({ start: [4, 0, 0], end: [4, 0, 4] }); return () => occt.fillets.filletTwoEdgesInPlaneIntoAWire({ edge1, edge2, planeOrigin: [0, 0, 0], planeDirection: [0, 1, 0], radius: 50, solution: -1 }); }],
            ["thickening a box by removing a solid instead of a face", () => { const shape = box(); const shapes = [box()]; return () => occt.operations.makeThickSolidByJoin({ shape, shapes, offset: 1 }); }],
            ["sweeping a point along a line", () => { const shape = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [0, 10, 0] }); const shapes = [occt.shapes.vertex.vertexFromXYZ({ x: 0, y: 0, z: 0 })]; return () => occt.operations.pipe({ shape, shapes }); }],
            ["turning a box about an axis with no length", () => { const shape = box(); return () => occt.transforms.rotate({ shape, axis: [0, 0, 0], angle: 30 }); }],
            ["mirroring a box across a direction with no length", () => { const shape = box(); return () => occt.transforms.mirror({ shape, origin: [0, 0, 0], direction: [0, 0, 0] }); }],
            ["mirroring a box across a plane whose normal has no length", () => { const shape = box(); return () => occt.transforms.mirrorAlongNormal({ shape, origin: [0, 0, 0], normal: [0, 0, 0] }); }],
            ["aligning a box from a direction with no length", () => { const shape = box(); return () => occt.transforms.align({ shape, fromOrigin: [0, 0, 0], fromDirection: [0, 0, 0], toOrigin: [1, 1, 1], toDirection: [1, 0, 0] }); }],
            ["inverting a transform that has no inverse", () => () => occt.transforms.invertTransform({ transformation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] })],
            ["rebuilding a face of a single face's graph that has no solid", () => { const shape = rectangleFace(); return () => occt.brepGraph.reconstruct({ shape, kind: Inputs.OCCT.brepGraphNodeKindEnum.solid, index: 0 }); }],
            ["drawing a spline through a single point", () => () => occt.shapes.wire.createBSpline({ points: [[0, 0, 0]], closed: false })],
            ["cutting an arc from a circle between two equal points", () => { const circle = occt.shapes.edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] }); return () => occt.shapes.edge.arcFromCircleAndTwoPoints({ circle, start: [2, 0, 0], end: [2, 0, 0], sense: true }); }],
            ["joining a circle to the circle inside it by tangent lines", () => { const circle1 = circleWire(2, 0); const circle2 = circleWire(1, 0); return () => occt.shapes.wire.createWireFromTwoCirclesTan({ circle1, circle2, keepLines: Inputs.OCCT.twoSidesStrictEnum.outside, circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside, tolerance: 1e-7 }); }],
            ["building a cylinder along a direction with no length", () => () => occt.shapes.solid.createCylinder({ radius: 1, height: 2, center: [0, 0, 0], direction: [0, 0, 0] })],
            ["building a ball of radius 0", () => () => occt.shapes.solid.createSphere({ radius: 0, center: [0, 0, 0] })],
            ["building a box of width 0", () => () => occt.shapes.solid.createBox({ width: 0, length: 1, height: 1, center: [0, 0, 0] })],
            ["drawing a square face facing a direction with no length", () => () => occt.shapes.face.createSquareFace({ size: 2, center: [0, 0, 0], direction: [0, 0, 0] })],
            ["making an axis of a direction with no length", () => () => och.entitiesService.gpAx1([1, 2, 3], [0, 0, 0])],
            ["making a frame of a direction with no length", () => () => och.entitiesService.gpAx2([1, 2, 3], [0, 0, 0])],
            ["making a placement of a direction with no length", () => () => och.entitiesService.gpAx3_4([1, 2, 3], [0, 0, 0])],
            ["making a placement of a second direction with no length", () => () => och.entitiesService.gpAx3_3([1, 2, 3], [0, 0, 1], [0, 0, 0])],
            ["making a frame of two directions, the second with no length", () => () => och.entitiesService.gpAx2FromTwoVectors([1, 2, 3], [0, 0, 1], [0, 0, 0])],
            ["making a flat axis of a direction with no length", () => () => och.entitiesService.gpAx2d([1, 2], [0, 0])],
        ];

        const keeping: Arranged[] = [
            ["making a plane whose normal has no length", () => () => och.entitiesService.gpPln([1, 2, 3], [0, 0, 0])],
            ["drafting a side of a box along a direction with no length", () => { const shape = box(); const faces = [occt.shapes.face.getFace({ shape, index: 0 })]; return () => occt.draft.draftAngle({ shape, faces, direction: [0, 0, 0], angle: 5, neutralPlaneOrigin: [0, 0, -5], neutralPlaneDirection: [0, 0, 1], flag: true }); }],
            ["twisting an upright square the kernel cannot sweep", () => { const shape = occt.shapes.face.createSquareFace({ size: 5, center: [0, 0, 0], direction: [1, 0, 0] }); return () => occt.operations.rotatedExtrude({ shape, height: 5, angle: 90, makeSolid: true }); }],
            ["twisting a square by a height of 0", () => { const shape = rectangleWire(); return () => occt.operations.rotatedExtrudeWithHistory({ shape, height: 0, angle: 90, makeSolid: true }); }],
            ["splitting a box with a face beside it, with history", () => { const shape = box(); const shapes = [occt.shapes.face.createRectangleFace({ width: 20, length: 20, center: [50, 0, 0], direction: [1, 0, 0] })]; return () => occt.operations.splitShapeWithShapesWithHistory({ shape, shapes, localFuzzyTolerance: 1e-7, nonDestructive: false }); }],
            ["sewing five faces of a box into a solid", () => { const shapes = occt.shapes.face.getFaces({ shape: box() }).slice(1); return () => occt.shapes.solid.fromFaces({ shapes, tolerance: 1e-7 }); }],
            ["offsetting a box by 0, with history", () => { const shape = box(); return () => occt.operations.offsetWithHistory({ shape, distance: 0, tolerance: 1e-7 }); }],
            ["extruding a face along a direction with no length", () => { const shape = rectangleFace(); return () => occt.operations.extrude({ shape, direction: [0, 0, 0] }); }],
        ];

        it.each(leaking)("should keep nothing it made when %s fails", (_name, arrange) => leavesNothingWhenItFails(arrange));

        it.each(keeping)("should keep nothing it made when %s fails, as it does today", (_name, arrange) => leavesNothingWhenItFails(arrange));
    });

    describe("a part redrawn again and again", () => {
        const drilledPlate = (corner: number): TopoDS_Shape => {
            const sketch = occt.shapes.face.createRectangleFace({ width: 40, length: 20, center: [0, 0, 0], direction: [0, 1, 0] });
            const plate = occt.operations.extrude({ shape: sketch, direction: [0, 4, 0] });
            const holes = [-12, 12].map(x => occt.shapes.solid.createCylinder({ radius: 2, height: 10, center: [x, -2, 0], direction: [0, 1, 0] }));
            const drilled = occt.booleans.difference({ shape: plate, shapes: holes, keepEdges: false });
            const rounded = occt.fillets.filletEdges({ shape: drilled, radius: corner, indexes: [0, 2] });
            [sketch, plate, ...holes, drilled].forEach(shape => shape.delete());
            return rounded;
        };
        const drawn = (shape: TopoDS_Shape): void => {
            och.meshingService.shapeToMeshBuffers({ shape, precision: 0.1, computeMetadata: true });
            shape.delete();
        };

        it("should hold no more kernel objects after ten redraws of a drilled and rounded plate than before them", () => {
            // Arrange
            const corners = [1, 1.5, 2, 2.5, 3, 1, 1.5, 2, 2.5, 3];

            // Act
            const run = ledgerRun(kernel, () => corners.forEach(corner => drawn(drilledPlate(corner))));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(run.made).toBeGreaterThan(100);
            expect(namesOf(run.leaked)).toEqual([]);
        });

        it("should hold no more kernel objects after ten redraws of a plate cut from a rounded outline than before them", () => {
            // Arrange
            const radii = [0.5, 1, 1.5, 2, 2.5, 0.5, 1, 1.5, 2, 2.5];
            const outlinePlate = (radius: number): TopoDS_Shape => {
                const rectangle = occt.shapes.wire.createRectangleWire({ width: 40, length: 20, center: [0, 0, 0], direction: [0, 1, 0] });
                const outline = occt.fillets.fillet2d({ shape: rectangle, radius });
                const face = occt.shapes.face.createFaceFromWire({ shape: outline, planar: true });
                const plate = occt.operations.extrude({ shape: face, direction: [0, 4, 0] });
                [rectangle, outline, face].forEach(shape => shape.delete());
                return plate;
            };

            // Act
            const run = ledgerRun(kernel, () => radii.forEach(radius => drawn(outlinePlate(radius))));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(namesOf(run.leaked)).toEqual([]);
        });

        it("should hand back every shape it made in a list it was asked to keep, and nothing besides", () => {
            // Arrange
            const shapes = [box(), ball()];

            // Act
            const run = ledgerRun(kernel, () => occt.booleans.intersectionWithHistory({ shapes, keepEdges: false }));

            // Assert
            expect([...handlesIn(run.result)].map(handle => handle.isDeleted())).toEqual([false]);
            expect(namesOf(run.leaked)).toEqual([]);
        });
    });
});
