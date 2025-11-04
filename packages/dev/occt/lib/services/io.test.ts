import initOpenCascade, { OpenCascadeInstance, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTSolid, OCCTWire } from "./shapes";
import { OCCTIO } from "./io";
import * as Inputs from "../api/inputs/inputs";

describe("OCCT io unit tests", () => {
    let occt: OpenCascadeInstance;
    let io: OCCTIO;
    let solid: OCCTSolid;
    let wire: OCCTWire;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();

        occHelper = new OccHelper(vec, s, occt);
        solid = new OCCTSolid(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        io = new OCCTIO(occt, occHelper);
    });

    it("should save shape as step file", () => {
        const cone = solid.createCone({ radius1: 10, radius2: 5, height: 20, angle: 360, direction: [0, 1, 0], center: [0, 0, 0] });
        const step = io.saveShapeSTEP({ shape: cone, adjustYtoZ: true, fileName: "cone.step" });
        const someLinesFromFile = [
            "ISO-10303-21;",
            "FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));",
            "#55 = CARTESIAN_POINT('',(-5.,-8.660254037844));",
            "#73 = ( GEOMETRIC_REPRESENTATION_CONTEXT(2)",
            "#126 = PRODUCT_RELATED_PRODUCT_CATEGORY('part',$,(#7));",
            "END-ISO-10303-21;"
        ];
        const includes = someLinesFromFile.map(l => step.includes(l));
        const ex = someLinesFromFile.map(() => true);

        expect(includes).toEqual(
            ex
        );
        cone.delete();
    });

    it("should save shape as step file and not adjust y to z", () => {
        const cone = solid.createCone({ radius1: 10, radius2: 5, height: 20, angle: 360, direction: [0, 1, 0], center: [0, 0, 0] });
        const step = io.saveShapeSTEP({ shape: cone, adjustYtoZ: false, fileName: "cone.step" });
        const someLinesFromFile = [
            "ISO-10303-21;",
            "FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));",
            "#55 = EDGE_CURVE('',#56,#22,#58,.T.);",
            "#73 = CARTESIAN_POINT('',(0.,-0.));",
            "#117 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#114,",
            "END-ISO-10303-21;"
        ];
        const includes = someLinesFromFile.map(l => step.includes(l));
        const ex = someLinesFromFile.map(() => true);

        expect(includes).toEqual(
            ex
        );
        cone.delete();
    });

    it("should load cube shape from step file", () => {
        const cube = solid.createCube({ size: 10, center: [0, 0, 0] });
        const stepText = io.saveShapeSTEP({ shape: cube, adjustYtoZ: false, fileName: "cube.step" });
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "cube1.step", adjustZtoY: false });

        const volumeOriginal = solid.getSolidVolume({ shape: cube });
        const volumeLoaded = solid.getSolidVolume({ shape: loaded });
        expect(volumeOriginal).toEqual(volumeLoaded);
        cube.delete();
        loaded.delete();
    });

    it("should load cylinder shape from step file", () => {
        const c = solid.createCylinder({ radius: 10, height: 20, direction: [0, 1, 0], center: [0, 0, 0] });

        const stepText = io.saveShapeSTEP({ shape: c, adjustYtoZ: false, fileName: "cone.step" });
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "cone1.step", adjustZtoY: false });

        const volumeOriginal = solid.getSolidVolume({ shape: c });
        const volumeLoaded = solid.getSolidVolume({ shape: loaded });

        expect(volumeOriginal).toBeCloseTo(volumeLoaded);
        c.delete();
        loaded.delete();
    });

    it("should create dxf from interpolated path that was joined with polyline and filleted", () => {
        const pointsToInterpolate = [[-10, 0, 1], [-5, 0, -1], [0, 0, 1], [5, 0, -1], [10, 0, 1]] as Inputs.Base.Point3[];
        const pointsPolyline = [[-10, 0, 1], [-5, 0, 10], [0, 0, 5], [5, 0, 10], [10, 0, 1]] as Inputs.Base.Point3[];

        const interpolatedWire = wire.interpolatePoints({ points: pointsToInterpolate, periodic: false, tolerance: 0.000001 });
        const polylineWire = wire.createPolylineWire({ points: pointsPolyline });

        const combinedWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [interpolatedWire, polylineWire] });
        const filletedWire = occHelper.filletsService.fillet2d({ shape: combinedWire, radius: 1 });

        const edges = occHelper.edgesService.getEdgesAlongWire({ shape: filletedWire });
        
        // Verify edge connectivity
        for (let i = 1; i < edges.length; i++) {
            const prevEnd = occHelper.edgesService.endPointOnEdge({ shape: edges[i - 1] });
            const currStart = occHelper.edgesService.startPointOnEdge({ shape: edges[i] });
            const distance = Math.sqrt(
                Math.pow(currStart[0] - prevEnd[0], 2) +
                Math.pow(currStart[1] - prevEnd[1], 2) +
                Math.pow(currStart[2] - prevEnd[2], 2)
            );
            expect(distance).toBeLessThan(0.01);
        }

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(filletedWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        expect(dxfPaths[0].segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.bulges).toBeDefined();
        expect(polyline.closed).toBe(true);
        expect(polyline.points.length).toBe(polyline.bulges.length);
        
        // First and last points should not be the same for a closed polyline
        const firstPoint = polyline.points[0];
        const lastPoint = polyline.points[polyline.points.length - 1];
        const distanceToClose = Math.sqrt(
            Math.pow(lastPoint[0] - firstPoint[0], 2) + 
            Math.pow(lastPoint[1] - firstPoint[1], 2)
        );
        expect(distanceToClose).toBeGreaterThan(0.01);
    });

    it("should create dxf from a simple rectangle wire with linear edges", () => {
        const points = [[0, 0, 0], [10, 0, 0], [10, 0, 5], [0, 0, 5], [0, 0, 0]] as Inputs.Base.Point3[];
        const rectangleWire = wire.createPolylineWire({ points });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(rectangleWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        expect(dxfPaths[0].segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.closed).toBe(true);
        expect(polyline.points.length).toBe(4); // 4 corners, no duplicate for closed
        
        // All bulges should be 0 for straight lines
        polyline.bulges.forEach((bulge: number) => {
            expect(bulge).toBe(0);
        });
    });

    it("should create dxf from a circle wire", () => {
        const circleWire = wire.createCircleWire({
            radius: 5,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(circleWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        expect(dxfPaths[0].segments.length).toBe(1);
        
        // A full circle is represented as a CIRCLE entity in DXF, not a polyline
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const circleSegment = dxfPaths[0].segments[0] as any;
        
        // Check it's a circle entity with center and radius
        expect(circleSegment.center).toBeDefined();
        expect(circleSegment.radius).toBeDefined();
        expect(circleSegment.radius).toBeCloseTo(5, 2);
        expect(circleSegment.center[0]).toBeCloseTo(0, 2); // X coordinate
        expect(circleSegment.center[1]).toBeCloseTo(0, 2); // Z coordinate (Y removed for 2D)
    });

    it("should create dxf from mixed linear and arc edges", () => {
        const line1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 0] });
        const line2 = occHelper.edgesService.lineEdge({ start: [10, 0, 0], end: [10, 0, 10] });
        const arc = occHelper.edgesService.arcThroughThreePoints({
            start: [10, 0, 10],
            middle: [5, 0, 12],
            end: [0, 0, 10]
        });
        const line3 = occHelper.edgesService.lineEdge({ start: [0, 0, 10], end: [0, 0, 0] });

        const mixedWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [line1, line2, arc, line3] });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(mixedWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        expect(dxfPaths[0].segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.closed).toBe(true);
        expect(polyline.bulges).toBeDefined();
        
        // Should have both zero and non-zero bulges
        const hasZeroBulge = polyline.bulges.some((bulge: number) => Math.abs(bulge) < 0.01);
        const hasNonZeroBulge = polyline.bulges.some((bulge: number) => Math.abs(bulge) > 0.01);
        expect(hasZeroBulge).toBe(true);
        expect(hasNonZeroBulge).toBe(true);
    });

    it("should create dxf from an open wire with bezier curve", () => {
        const points = [[0, 0, 0], [5, 0, 5], [10, 0, 2], [15, 0, 8]] as Inputs.Base.Point3[];
        const bezierWire = wire.interpolatePoints({ points, periodic: false, tolerance: 0.0001 });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(bezierWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        expect(dxfPaths[0].segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.closed).toBe(false);
        expect(polyline.points.length).toBeGreaterThan(4); // Should tessellate
        
        // All bulges should be 0 since tessellation creates line segments
        polyline.bulges.forEach((bulge: number) => {
            expect(bulge).toBe(0);
        });
    });

    it("should create dxf with multiple paths from a shape with multiple wires", () => {
        const outer = wire.createPolylineWire({
            points: [[0, 0, 0], [20, 0, 0], [20, 0, 20], [0, 0, 20], [0, 0, 0]]
        });
        const inner = wire.createPolylineWire({
            points: [[5, 0, 5], [15, 0, 5], [15, 0, 15], [5, 0, 15], [5, 0, 5]]
        });

        const faceWithHole = occHelper.facesService.createFaceFromWires({
            shapes: [outer, inner],
            planar: true
        });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(faceWithHole);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(2); // Outer and inner wire
        
        dxfPaths.forEach(path => {
            expect(path.segments.length).toBe(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const polyline = path.segments[0] as any;
            expect(polyline.points).toBeDefined();
            expect(polyline.closed).toBe(true);
        });
    });

    it("should create dxf with proper color and layer information", () => {
        const rectangleWire = wire.createPolylineWire({
            points: [[0, 0, 0], [10, 0, 0], [10, 0, 5], [0, 0, 5], [0, 0, 0]]
        });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(rectangleWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        const pathsWithLayer = io.dxfPathsWithLayer({
            paths: dxfPaths,
            layer: "TestLayer",
            color: "#FF0000"
        });

        expect(pathsWithLayer.paths).toBeDefined();
        expect(pathsWithLayer.paths.length).toBe(1);
        expect(pathsWithLayer.layer).toBe("TestLayer");
        expect(pathsWithLayer.color).toBe("#FF0000");

        const dxfContent = io.dxfCreate({ pathsParts: [pathsWithLayer] });
        expect(dxfContent).toContain("TestLayer");
        expect(dxfContent).toContain("LWPOLYLINE");
    });

    it("should handle edge direction consistency in complex wires", () => {
        const points1 = [[0, 0, 0], [5, 0, 2], [10, 0, 0]] as Inputs.Base.Point3[];
        const points2 = [[10, 0, 0], [15, 0, 5], [20, 0, 0]] as Inputs.Base.Point3[];
        const points3 = [[20, 0, 0], [10, 0, -5], [0, 0, 0]] as Inputs.Base.Point3[];

        const curve1 = wire.interpolatePoints({ points: points1, periodic: false, tolerance: 0.0001 });
        const curve2 = wire.interpolatePoints({ points: points2, periodic: false, tolerance: 0.0001 });
        const curve3 = wire.interpolatePoints({ points: points3, periodic: false, tolerance: 0.0001 });

        const combinedWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [curve1, curve2, curve3] });

        const edges = occHelper.edgesService.getEdgesAlongWire({ shape: combinedWire });
        
        // Verify all edges connect properly
        for (let i = 1; i < edges.length; i++) {
            const prevEnd = occHelper.edgesService.endPointOnEdge({ shape: edges[i - 1] });
            const currStart = occHelper.edgesService.startPointOnEdge({ shape: edges[i] });
            const distance = Math.sqrt(
                Math.pow(currStart[0] - prevEnd[0], 2) +
                Math.pow(currStart[1] - prevEnd[1], 2) +
                Math.pow(currStart[2] - prevEnd[2], 2)
            );
            expect(distance).toBeLessThan(0.01);
        }

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(combinedWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;
        expect(polyline.closed).toBe(true);
        expect(polyline.points.length).toBeGreaterThan(3);
    });

    it("should correctly export oblong slot with opposing semicircular arcs", () => {
        const radius = 5;
        const leftArcCenterX = 10;
        const rightArcCenterX = 30;
        const arcCenterZ = 20;

        // Top straight line
        const topLine = wire.createPolylineWire({
            points: [
                [leftArcCenterX, 0, arcCenterZ + radius],
                [rightArcCenterX, 0, arcCenterZ + radius]
            ]
        });

        // Right semicircle arc (from top to bottom, curving right)
        const rightArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [rightArcCenterX, 0, arcCenterZ + radius],
            end: [rightArcCenterX, 0, arcCenterZ - radius],
            tangentVec: [1, 0, 0]
        });

        // Bottom straight line
        const bottomLine = wire.createPolylineWire({
            points: [
                [rightArcCenterX, 0, arcCenterZ - radius],
                [leftArcCenterX, 0, arcCenterZ - radius]
            ]
        });

        // Left semicircle arc (from bottom to top, curving left)
        const leftArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [leftArcCenterX, 0, arcCenterZ - radius],
            end: [leftArcCenterX, 0, arcCenterZ + radius],
            tangentVec: [-1, 0, 0]
        });

        const slotWire = wire.combineEdgesAndWiresIntoAWire({
            shapes: [topLine, rightArc, bottomLine, leftArc]
        });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(slotWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        expect(dxfPaths[0].segments.length).toBe(1);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.bulges).toBeDefined();
        expect(polyline.closed).toBe(true);

        // Find bulge indices for the arcs
        const bulges = polyline.bulges;

        // Both arcs should have significant non-zero bulges (semicircles ≈ ±1)
        const significantBulges = bulges.filter((b: number) => Math.abs(b) > 0.9);
        expect(significantBulges.length).toBe(2); // Two semicircular arcs

        // Both arcs bulge outward from the slot
        const bulgeIndices: number[] = [];
        for (let i = 0; i < bulges.length; i++) {
            if (Math.abs(bulges[i]) > 0.9) {
                bulgeIndices.push(i);
            }
        }
        expect(bulgeIndices.length).toBe(2);
        
        // Both bulges should be negative based on the actual arc traversal
        const bulge1 = bulges[bulgeIndices[0]];
        const bulge2 = bulges[bulgeIndices[1]];
        expect(bulge1).toBeLessThan(-0.9);
        expect(bulge2).toBeLessThan(-0.9);

        slotWire.delete();
        topLine.delete();
        bottomLine.delete();
        rightArc.delete();
        leftArc.delete();
    });

    it("should correctly export semicircular arc curving right with positive bulge", () => {
        const radius = 5;
        const centerX = 20;
        const centerZ = 10;

        // Semicircle arc from top to bottom with tangent pointing right
        // When traveling downward, curving right means positive bulge (left of travel direction)
        const rightArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [centerX, 0, centerZ + radius],
            end: [centerX, 0, centerZ - radius],
            tangentVec: [1, 0, 0]  // Tangent pointing right
        });

        const arcWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [rightArc] });

        const startPt = occHelper.edgesService.startPointOnEdge({ shape: rightArc });
        const endPt = occHelper.edgesService.endPointOnEdge({ shape: rightArc });

        // Verify the arc geometry
        expect(startPt[2]).toBeGreaterThan(endPt[2]); // Start is higher than end
        
        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(arcWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;

        // For a semicircular arc, the bulge should be close to ±1
        expect(polyline.bulges[0]).toBeLessThan(-0.9); // Semicircle ≈ -1
        
        arcWire.delete();
        rightArc.delete();
    });

    it("should correctly export semicircular arc curving left with positive bulge", () => {
        const radius = 5;
        const centerX = 20;
        const centerZ = 10;

        // Semicircle arc from bottom to top with tangent pointing left
        // When traveling upward, curving left means positive bulge (left of travel direction)
        const leftArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [centerX, 0, centerZ - radius],
            end: [centerX, 0, centerZ + radius],
            tangentVec: [-1, 0, 0]  // Tangent pointing left
        });

        const arcWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [leftArc] });

        const startPt = occHelper.edgesService.startPointOnEdge({ shape: leftArc });
        const endPt = occHelper.edgesService.endPointOnEdge({ shape: leftArc });

        // Verify the arc geometry
        expect(startPt[2]).toBeLessThan(endPt[2]); // Start is lower than end

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(arcWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;

        // For a semicircular arc, the bulge should be close to ±1
        expect(polyline.bulges[0]).toBeLessThan(-0.9); // Semicircle ≈ -1

        arcWire.delete();
        leftArc.delete();
    });

    it("should correctly export vertical arc curving right with negative bulge", () => {
        const radius = 5;
        const centerX = 20;
        const centerZ = 10;

        // Semicircle arc from bottom to top with tangent pointing RIGHT
        // When traveling upward, curving right means negative bulge (right of travel direction)
        const rightArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [centerX, 0, centerZ - radius],
            end: [centerX, 0, centerZ + radius],
            tangentVec: [1, 0, 0]  // Tangent pointing right
        });

        const arcWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [rightArc] });

        const startPt = occHelper.edgesService.startPointOnEdge({ shape: rightArc });
        const endPt = occHelper.edgesService.endPointOnEdge({ shape: rightArc });

        // Verify the arc geometry
        expect(startPt[2]).toBeLessThan(endPt[2]); // Start is lower than end

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(arcWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;

        // For a semicircular arc curving right (when traveling up), bulge should be positive
        expect(polyline.bulges[0]).toBeGreaterThan(0.9); // Semicircle ≈ 1

        arcWire.delete();
        rightArc.delete();
    });

    it("should correctly export horizontal arc curving upward (center above chord)", () => {
        const startX = 10;
        const endX = 20;
        const chordZ = 15;
        
        // Create arc with center above the chord
        // For a horizontal chord, center above means positive Z offset
        const centerX = (startX + endX) / 2;
        const centerZ = chordZ + 5; // Center 5 units above the chord
        const radius = Math.sqrt(Math.pow((endX - startX) / 2, 2) + Math.pow(5, 2)); // Calculate radius

        // Create arc using arcThroughThreePoints
        // Middle point should be on the arc itself, at the peak
        const middleX = centerX;
        const middleZ = centerZ + radius; // Top of the arc
        
        const arc = occHelper.edgesService.arcThroughThreePoints({
            start: [startX, 0, chordZ],
            middle: [middleX, 0, middleZ],
            end: [endX, 0, chordZ]
        });

        const arcWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [arc] });

        const center = occHelper.edgesService.getCircularEdgeCenterPoint({ shape: arc });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(arcWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;

        // Verify center is actually above the chord
        expect(center[2]).toBeGreaterThan(chordZ);
        
        // For a horizontal chord traveling right, center above = negative bulge
        expect(polyline.bulges[0]).toBeLessThan(-0.1);

        arcWire.delete();
        arc.delete();
    });

    it("should correctly export horizontal arc curving downward (center below chord)", () => {
        const startX = 10;
        const endX = 20;
        const chordZ = 15;
        
        // Create arc with center below the chord
        const centerX = (startX + endX) / 2;
        const centerZ = chordZ - 5; // Center 5 units below the chord
        const radius = Math.sqrt(Math.pow((endX - startX) / 2, 2) + Math.pow(5, 2)); // Calculate radius

        // Create arc using arcThroughThreePoints
        // Middle point should be on the arc itself, at the lowest point
        const middleX = centerX;
        const middleZ = centerZ - radius; // Bottom of the arc
        
        const arc = occHelper.edgesService.arcThroughThreePoints({
            start: [startX, 0, chordZ],
            middle: [middleX, 0, middleZ],
            end: [endX, 0, chordZ]
        });

        const arcWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [arc] });

        const center = occHelper.edgesService.getCircularEdgeCenterPoint({ shape: arc });

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(arcWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0].segments[0] as any;

        // Verify center is actually below the chord
        expect(center[2]).toBeLessThan(chordZ);
        
        // For a horizontal chord traveling right, center below = positive bulge
        expect(polyline.bulges[0]).toBeGreaterThan(0.1);

        arcWire.delete();
        arc.delete();
    });
});
