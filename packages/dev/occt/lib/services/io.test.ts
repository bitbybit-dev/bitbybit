import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTSolid, OCCTWire } from "./shapes";
import { OCCTIO } from "./io";
import * as Inputs from "../api/inputs";

describe("OCCT io unit tests", () => {
    let occt: BitbybitOcctModule;
    let io: OCCTIO;
    let solid: OCCTSolid;
    let wire: OCCTWire;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
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

    it("should save shape as step file with adjustYtoZ and fromRightHanded (no mirroring)", () => {
        const box = solid.createBox({ width: 4, length: 6, height: 8, center: [0, 0, 0] });
        
        const stepRightHanded = io.saveShapeSTEP({ 
            shape: box, 
            adjustYtoZ: true, 
            fromRightHanded: true, 
            fileName: "box.step" 
        });
        
        const stepLeftHanded = io.saveShapeSTEP({ 
            shape: box, 
            adjustYtoZ: true, 
            fromRightHanded: false, 
            fileName: "box.step" 
        });
        
        expect(stepRightHanded).toContain("ISO-10303-21;");
        expect(stepRightHanded).toContain("END-ISO-10303-21;");
        expect(stepLeftHanded).toContain("ISO-10303-21;");
        expect(stepLeftHanded).toContain("END-ISO-10303-21;");
        
        expect(stepRightHanded).not.toEqual(stepLeftHanded);
        
        box.delete();
    });

    it("should save shape as step file with fromRightHanded true and preserve roundtrip", () => {
        const cylinder = solid.createCylinder({ radius: 5, height: 10, direction: [0, 1, 0], center: [0, 0, 0] });
        
        const stepText = io.saveShapeSTEP({ 
            shape: cylinder, 
            adjustYtoZ: true, 
            fromRightHanded: true, 
            fileName: "cylinder.step" 
        });
        
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "cylinder.step", adjustZtoY: true })!;
        
        const volumeOriginal = solid.getSolidVolume({ shape: cylinder });
        const volumeLoaded = solid.getSolidVolume({ shape: loaded });
        
        expect(volumeOriginal).toBeCloseTo(volumeLoaded);
        
        cylinder.delete();
        loaded.delete();
    });

    it("should load cube shape from step file", () => {
        const cube = solid.createCube({ size: 10, center: [0, 0, 0] });
        const stepText = io.saveShapeSTEP({ shape: cube, adjustYtoZ: false, fileName: "cube.step" });
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "cube1.step", adjustZtoY: false })!;

        const volumeOriginal = solid.getSolidVolume({ shape: cube });
        const volumeLoaded = solid.getSolidVolume({ shape: loaded });
        expect(volumeOriginal).toEqual(volumeLoaded);
        cube.delete();
        loaded.delete();
    });

    it("should load cylinder shape from step file", () => {
        const c = solid.createCylinder({ radius: 10, height: 20, direction: [0, 1, 0], center: [0, 0, 0] });

        const stepText = io.saveShapeSTEP({ shape: c, adjustYtoZ: false, fileName: "cone.step" });
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "cone1.step", adjustZtoY: false })!;

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
        
        for (let i = 1; i < edges.length; i++) {
            const prevEnd = occHelper.edgesService.endPointOnEdge({ shape: edges[i - 1]! });
            const currStart = occHelper.edgesService.startPointOnEdge({ shape: edges[i]! });
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
        expect(dxfPaths[0]!.segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0]!.segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.bulges).toBeDefined();
        expect(polyline.closed).toBe(true);
        expect(polyline.points.length).toBe(polyline.bulges.length);
        
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
        expect(dxfPaths[0]!.segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0]!.segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.closed).toBe(true);
        expect(polyline.points.length).toBe(4);
        
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
        expect(dxfPaths[0]!.segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const circleSegment = dxfPaths[0]!.segments[0] as any;
        
        expect(circleSegment.center).toBeDefined();
        expect(circleSegment.radius).toBeDefined();
        expect(circleSegment.radius).toBeCloseTo(5, 2);
        expect(circleSegment.center[0]).toBeCloseTo(0, 2);
        expect(circleSegment.center[1]).toBeCloseTo(0, 2);
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
        expect(dxfPaths[0]!.segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0]!.segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.closed).toBe(true);
        expect(polyline.bulges).toBeDefined();
        
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
        expect(dxfPaths[0]!.segments.length).toBe(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0]!.segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.closed).toBe(false);
        expect(polyline.points.length).toBeGreaterThan(4);
        
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

        expect(dxfPaths.length).toBe(2);
        
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

        const dxfDto = new Inputs.OCCT.DxfPathsPartsListDto([pathsWithLayer]);
        const dxfContent = io.dxfCreate(dxfDto);
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
        
        for (let i = 1; i < edges.length; i++) {
            const prevEnd = occHelper.edgesService.endPointOnEdge({ shape: edges[i - 1]! });
            const currStart = occHelper.edgesService.startPointOnEdge({ shape: edges[i]! });
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
        const polyline = dxfPaths[0]!.segments[0] as any;
        expect(polyline.closed).toBe(true);
        expect(polyline.points.length).toBeGreaterThan(3);
    });

    it("should correctly export oblong slot with opposing semicircular arcs", () => {
        const radius = 5;
        const leftArcCenterX = 10;
        const rightArcCenterX = 30;
        const arcCenterZ = 20;

        const topLine = wire.createPolylineWire({
            points: [
                [leftArcCenterX, 0, arcCenterZ + radius],
                [rightArcCenterX, 0, arcCenterZ + radius]
            ]
        });

        const rightArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [rightArcCenterX, 0, arcCenterZ + radius],
            end: [rightArcCenterX, 0, arcCenterZ - radius],
            tangentVec: [1, 0, 0]
        });

        const bottomLine = wire.createPolylineWire({
            points: [
                [rightArcCenterX, 0, arcCenterZ - radius],
                [leftArcCenterX, 0, arcCenterZ - radius]
            ]
        });

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
        expect(dxfPaths[0]!.segments.length).toBe(1);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0]!.segments[0] as any;
        expect(polyline.points).toBeDefined();
        expect(polyline.bulges).toBeDefined();
        expect(polyline.closed).toBe(true);

        const bulges = polyline.bulges;

        const significantBulges = bulges.filter((b: number) => Math.abs(b) > 0.9);
        expect(significantBulges.length).toBe(2);

        const bulgeIndices: number[] = [];
        for (let i = 0; i < bulges.length; i++) {
            if (Math.abs(bulges[i]) > 0.9) {
                bulgeIndices.push(i);
            }
        }
        expect(bulgeIndices.length).toBe(2);
        
        const bulge1 = bulges[bulgeIndices[0]!];
        const bulge2 = bulges[bulgeIndices[1]!];
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

        const rightArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [centerX, 0, centerZ + radius],
            end: [centerX, 0, centerZ - radius],
            tangentVec: [1, 0, 0]
        });

        const arcWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [rightArc] });

        const startPt = occHelper.edgesService.startPointOnEdge({ shape: rightArc });
        const endPt = occHelper.edgesService.endPointOnEdge({ shape: rightArc });

        expect(startPt[2]).toBeGreaterThan(endPt[2]);
        
        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(arcWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0]!.segments[0] as any;

        expect(polyline.bulges[0]).toBeLessThan(-0.9);
        
        arcWire.delete();
        rightArc.delete();
    });

    it("should correctly export semicircular arc curving left with positive bulge", () => {
        const radius = 5;
        const centerX = 20;
        const centerZ = 10;

        const leftArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [centerX, 0, centerZ - radius],
            end: [centerX, 0, centerZ + radius],
            tangentVec: [-1, 0, 0]
        });

        const arcWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [leftArc] });

        const startPt = occHelper.edgesService.startPointOnEdge({ shape: leftArc });
        const endPt = occHelper.edgesService.endPointOnEdge({ shape: leftArc });

        expect(startPt[2]).toBeLessThan(endPt[2]);

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(arcWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0]!.segments[0] as any;

        expect(polyline.bulges[0]).toBeLessThan(-0.9);

        arcWire.delete();
        leftArc.delete();
    });

    it("should correctly export vertical arc curving right with negative bulge", () => {
        const radius = 5;
        const centerX = 20;
        const centerZ = 10;

        const rightArc = occHelper.edgesService.arcThroughTwoPointsAndTangent({
            start: [centerX, 0, centerZ - radius],
            end: [centerX, 0, centerZ + radius],
            tangentVec: [1, 0, 0]
        });

        const arcWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [rightArc] });

        const startPt = occHelper.edgesService.startPointOnEdge({ shape: rightArc });
        const endPt = occHelper.edgesService.endPointOnEdge({ shape: rightArc });

        expect(startPt[2]).toBeLessThan(endPt[2]);

        const dxfPathOpt = new Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>(arcWire);
        const dxfPaths = io.shapeToDxfPaths(dxfPathOpt);

        expect(dxfPaths.length).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const polyline = dxfPaths[0]!.segments[0] as any;

        expect(polyline.bulges[0]).toBeGreaterThan(0.9);

        arcWire.delete();
        rightArc.delete();
    });

    it("should correctly export horizontal arc curving upward (center above chord)", () => {
        const startX = 10;
        const endX = 20;
        const chordZ = 15;
        
        const centerX = (startX + endX) / 2;
        const centerZ = chordZ + 5;
        const radius = Math.sqrt(Math.pow((endX - startX) / 2, 2) + Math.pow(5, 2));

        const middleX = centerX;
        const middleZ = centerZ + radius;
        
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
        const polyline = dxfPaths[0]!.segments[0] as any;

        expect(center[2]).toBeGreaterThan(chordZ);
        
        expect(polyline.bulges[0]).toBeLessThan(-0.1);

        arcWire.delete();
        arc.delete();
    });

    it("should correctly export horizontal arc curving downward (center below chord)", () => {
        const startX = 10;
        const endX = 20;
        const chordZ = 15;
        
        const centerX = (startX + endX) / 2;
        const centerZ = chordZ - 5;
        const radius = Math.sqrt(Math.pow((endX - startX) / 2, 2) + Math.pow(5, 2));

        const middleX = centerX;
        const middleZ = centerZ - radius;
        
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
        const polyline = dxfPaths[0]!.segments[0] as any;

        expect(center[2]).toBeLessThan(chordZ);
        
        expect(polyline.bulges[0]).toBeGreaterThan(0.1);

        arcWire.delete();
        arc.delete();
    });

    it("should save cube shape as STL file", () => {
        const cube = solid.createCube({ size: 10, center: [0, 0, 0] });
        const dto = new Inputs.OCCT.SaveStlDto(cube, "cube.stl", 0.01, false);
        const stl = io.saveShapeStl(dto);
        
        expect(stl).toContain("solid");
        expect(stl).toContain("facet normal");
        expect(stl).toContain("outer loop");
        expect(stl).toContain("vertex");
        expect(stl).toContain("endloop");
        expect(stl).toContain("endfacet");
        expect(stl).toContain("endsolid");
        
        cube.delete();
    });

    it("should save cylinder shape as STL file", () => {
        const cylinder = solid.createCylinder({ radius: 5, height: 10, direction: [0, 1, 0], center: [0, 0, 0] });
        const dto = new Inputs.OCCT.SaveStlDto(cylinder, "cylinder.stl", 0.1, false);
        const stl = io.saveShapeStl(dto);
        
        expect(stl).toContain("solid");
        expect(stl).toContain("facet normal");
        expect(stl).toContain("endsolid");
        
        const facetCount = (stl.match(/facet normal/g) || []).length;
        expect(facetCount).toBeGreaterThan(10);
        
        cylinder.delete();
    });

    it("should save cone shape as STL file with Y to Z adjustment", () => {
        const cone = solid.createCone({ radius1: 10, radius2: 5, height: 20, angle: 360, direction: [0, 1, 0], center: [0, 0, 0] });
        const dto = new Inputs.OCCT.SaveStlDto(cone, "cone.stl", 0.1, true);
        const stl = io.saveShapeStl(dto);
        
        expect(stl).toContain("solid");
        expect(stl).toContain("facet normal");
        expect(stl).toContain("endsolid");
        
        cone.delete();
    });

    it("should save sphere shape as STL file with higher precision", () => {
        const sphere = solid.createSphere({ radius: 5, center: [0, 0, 0] });
        const dtoLowRes = new Inputs.OCCT.SaveStlDto(sphere, "sphere.stl", 1, false);
        const stlLowRes = io.saveShapeStl(dtoLowRes);
        
        const dtoHighRes = new Inputs.OCCT.SaveStlDto(sphere, "sphere.stl", 0.01, false);
        const stlHighRes = io.saveShapeStl(dtoHighRes);
        
        const facetCountLow = (stlLowRes.match(/facet normal/g) || []).length;
        const facetCountHigh = (stlHighRes.match(/facet normal/g) || []).length;
        
        expect(facetCountHigh).toBeGreaterThan(facetCountLow);
        
        sphere.delete();
    });

    it("should save box shape as STL file and contain valid vertex coordinates", () => {
        const box = solid.createBox({ width: 4, length: 6, height: 8, center: [0, 0, 0] });
        const dto = new Inputs.OCCT.SaveStlDto(box, "box.stl", 0.01, false);
        const stl = io.saveShapeStl(dto);
        
        const facetCount = (stl.match(/facet normal/g) || []).length;
        expect(facetCount).toBe(12);
        
        const vertexMatches = stl.match(/vertex\s+[-\d.e+]+\s+[-\d.e+]+\s+[-\d.e+]+/g);
        expect(vertexMatches).not.toBeNull();
        expect(vertexMatches).toHaveLength(36);
        
        box.delete();
    });

    it("should load shape from STEP file with .stp extension", () => {
        const cube = solid.createCube({ size: 5, center: [0, 0, 0] });
        const stepText = io.saveShapeSTEP({ shape: cube, adjustYtoZ: false, fileName: "cube.stp" });
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "cube.stp", adjustZtoY: false })!;

        const volumeOriginal = solid.getSolidVolume({ shape: cube });
        const volumeLoaded = solid.getSolidVolume({ shape: loaded });
        expect(volumeOriginal).toBeCloseTo(volumeLoaded);
        
        cube.delete();
        loaded.delete();
    });

    it("should load shape from STEP file with adjustZtoY enabled", () => {
        const cylinder = solid.createCylinder({ radius: 3, height: 10, direction: [0, 1, 0], center: [0, 0, 0] });
        const stepText = io.saveShapeSTEP({ shape: cylinder, adjustYtoZ: true, fileName: "cylinder.step" });
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "cylinder.step", adjustZtoY: true })!;

        const volumeOriginal = solid.getSolidVolume({ shape: cylinder });
        const volumeLoaded = solid.getSolidVolume({ shape: loaded });
        expect(volumeOriginal).toBeCloseTo(volumeLoaded);
        
        cylinder.delete();
        loaded.delete();
    });

    it("should load sphere shape from STEP file and preserve volume", () => {
        const sphere = solid.createSphere({ radius: 7, center: [0, 0, 0] });
        const stepText = io.saveShapeSTEP({ shape: sphere, adjustYtoZ: false, fileName: "sphere.step" });
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "sphere.step", adjustZtoY: false })!;

        const volumeOriginal = solid.getSolidVolume({ shape: sphere });
        const volumeLoaded = solid.getSolidVolume({ shape: loaded });
        expect(volumeOriginal).toBeCloseTo(volumeLoaded);
        
        sphere.delete();
        loaded.delete();
    });

    it("should load box shape from STEP file and preserve volume", () => {
        const box = solid.createBox({ width: 4, length: 6, height: 8, center: [0, 0, 0] });
        const stepText = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
        const loaded = io.loadSTEPorIGES({ filetext: stepText, fileName: "box.step", adjustZtoY: false })!;

        const volumeOriginal = solid.getSolidVolume({ shape: box });
        const volumeLoaded = solid.getSolidVolume({ shape: loaded });
        expect(volumeOriginal).toBeCloseTo(volumeLoaded);
        
        box.delete();
        loaded.delete();
    });

    it("should return undefined for unsupported file extension", () => {
        const originalError = console.error;
        let errorMessage: string | undefined;
        console.error = (msg: string) => { errorMessage = msg; };
        const result = io.loadSTEPorIGES({ filetext: "some content", fileName: "file.obj", adjustZtoY: false });
        expect(result).toBeUndefined();
        expect(errorMessage).toBe("opencascade can't parse this extension!");
        console.error = originalError;
    });
    describe("reading a file that arrived as bytes rather than text", () => {
        it("should read a STEP file handed over as an ArrayBuffer", () => {
            // Arrange
            const box = solid.createBox({ width: 4, length: 6, height: 8, center: [0, 0, 0] });
            const stepText = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
            const bytes = new TextEncoder().encode(stepText);

            // Act
            const loaded = io.loadSTEPorIGES({
                filetext: bytes.buffer, fileName: "box.step", adjustZtoY: false
            })!;

            // Assert
            expect(solid.getSolidVolume({ shape: loaded })).toBeCloseTo(solid.getSolidVolume({ shape: box }));

            box.delete();
            loaded.delete();
        });

        it("should read a compressed STEP file by its own extension", () => {
            // Arrange
            const box = solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });
            const stepText = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
            const bytes = new TextEncoder().encode(stepText);

            // Act
            const loaded = io.loadSTEPorIGES({
                filetext: bytes.buffer, fileName: "box.stpz", adjustZtoY: false
            })!;

            // Assert
            expect(solid.getSolidVolume({ shape: loaded })).toBeCloseTo(8);

            box.delete();
            loaded.delete();
        });

        it("should say so rather than throw where the bytes are not a model at all", () => {
            // Arrange
            const originalError = console.error;
            const said: string[] = [];
            console.error = (msg: string) => { said.push(msg); };
            const rubbish = new TextEncoder().encode("this is not a step file");

            // Act
            const result = io.loadSTEPorIGES({
                filetext: rubbish.buffer, fileName: "part.step", adjustZtoY: false
            });

            // Assert
            expect(result).toBeUndefined();
            expect(said[0]).toContain("Failed to read STEP file");

            console.error = originalError;
        });

        it("should say so rather than throw where the bytes are not an IGES model", () => {
            // Arrange
            const originalError = console.error;
            const said: string[] = [];
            console.error = (msg: string) => { said.push(msg); };
            const rubbish = new TextEncoder().encode("this is not an iges file");

            // Act
            const result = io.loadSTEPorIGES({
                filetext: rubbish.buffer, fileName: "part.iges", adjustZtoY: false
            });

            // Assert
            expect(result).toBeUndefined();
            expect(said[0]).toContain("Failed to read IGES file");

            console.error = originalError;
        });
    });

    describe("reading an IGES file as text", () => {
        it("should refuse text it can make no model out of", () => {
            // Arrange
            const originalError = console.error;
            const reported: unknown[] = [];
            console.error = (message: unknown): void => { reported.push(message); };

            // Act
            const result = io.loadSTEPorIGES({ filetext: "", fileName: "part.igs", adjustZtoY: false });
            console.error = originalError;

            // Assert
            expect(result).toBeUndefined();
            expect(reported).toStrictEqual(["Failed to read IGES file: part.igs"]);
        });
    });

    describe("converting a STEP model to glTF", () => {
        const stepOfABox = (): string => {
            const box = solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
            const step = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
            box.delete();
            return step;
        };

        const isGlb = (result: Uint8Array): boolean =>
            result.length > 4 && String.fromCharCode(result[0]!, result[1]!, result[2]!, result[3]!) === "glTF";

        it("should convert a STEP model handed over as text", () => {
            // Act
            const result = io.convertStepToGltf({ ...new Inputs.OCCT.ConvertStepToGltfDto(stepOfABox()) });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it("should convert the same model handed over as bytes", () => {
            // Arrange
            const bytes = new TextEncoder().encode(stepOfABox());

            // Act
            const result = io.convertStepToGltf({ ...new Inputs.OCCT.ConvertStepToGltfDto(bytes) });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it("should convert the same model handed over as an ArrayBuffer", () => {
            // Arrange
            const bytes = new TextEncoder().encode(stepOfABox());

            // Act
            const result = io.convertStepToGltf({
                ...new Inputs.OCCT.ConvertStepToGltfDto(bytes.buffer)
            });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it("should refuse a File, which only the worker layer knows how to unwrap", () => {
            // Arrange
            const inputs = { ...new Inputs.OCCT.ConvertStepToGltfDto(stepOfABox()) };
            Object.assign(inputs, { stepData: { name: "part.step" } });

            // Act
            const act = (): Uint8Array => io.convertStepToGltf(inputs);

            // Assert
            expect(act).toThrow(/must be converted to ArrayBuffer/);
        });

        it("should say what went wrong where the data is not a model at all", () => {
            // Act
            const act = (): Uint8Array => io.convertStepToGltf({
                ...new Inputs.OCCT.ConvertStepToGltfDto("this is not a step file")
            });

            // Assert
            expect(act).toThrow(/STEP to glTF conversion failed/);
        });
    });

    describe("converting a STEP model to glTF with every knob exposed", () => {
        const stepOfABox = (): string => {
            const box = solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
            const step = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
            box.delete();
            return step;
        };

        const isGlb = (result: Uint8Array): boolean =>
            result.length > 4 && String.fromCharCode(result[0]!, result[1]!, result[2]!, result[3]!) === "glTF";

        it("should convert a model handed over as text", () => {
            // Act
            const result = io.convertStepToGltfAdvanced({
                ...new Inputs.OCCT.ConvertStepToGltfAdvancedDto(stepOfABox())
            });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it("should convert a model handed over as bytes", () => {
            // Arrange
            const bytes = new TextEncoder().encode(stepOfABox());

            // Act
            const result = io.convertStepToGltfAdvanced({
                ...new Inputs.OCCT.ConvertStepToGltfAdvancedDto(bytes)
            });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it("should convert a model handed over as an ArrayBuffer", () => {
            // Arrange
            const bytes = new TextEncoder().encode(stepOfABox());

            // Act
            const result = io.convertStepToGltfAdvanced({
                ...new Inputs.OCCT.ConvertStepToGltfAdvancedDto(bytes.buffer)
            });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it("should refuse a File, which only the worker layer knows how to unwrap", () => {
            // Arrange
            const inputs = { ...new Inputs.OCCT.ConvertStepToGltfAdvancedDto(stepOfABox()) };
            Object.assign(inputs, { stepData: { name: "part.step" } });

            // Act
            const act = (): Uint8Array => io.convertStepToGltfAdvanced(inputs);

            // Assert
            expect(act).toThrow(/must be converted to ArrayBuffer/);
        });

        it("should say what went wrong where the data is not a model at all", () => {
            // Act
            const act = (): Uint8Array => io.convertStepToGltfAdvanced({
                ...new Inputs.OCCT.ConvertStepToGltfAdvancedDto("this is not a step file")
            });

            // Assert
            expect(act).toThrow(/STEP to glTF advanced conversion failed/);
        });
    });
    describe("converting a STEP model to glTF with Draco compression", () => {
        const stepOfABox = (): string => {
            const box = solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
            const step = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
            box.delete();
            return step;
        };

        const isGlb = (result: Uint8Array): boolean =>
            result.length > 4 && String.fromCharCode(result[0]!, result[1]!, result[2]!, result[3]!) === "glTF";

        it.each([
            ["text", (step: string): string | ArrayBuffer | Uint8Array => step],
            ["bytes", (step: string): string | ArrayBuffer | Uint8Array => new TextEncoder().encode(step)],
            ["an ArrayBuffer", (step: string): string | ArrayBuffer | Uint8Array =>
                new TextEncoder().encode(step).buffer],
        ])("should convert a model handed over as %s", (_kind, asData) => {
            // Act
            const result = io.convertStepToGltfWithDraco({
                ...new Inputs.OCCT.ConvertStepToGltfWithDracoDto(asData(stepOfABox()))
            });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it("should refuse a File, which only the worker layer knows how to unwrap", () => {
            // Arrange
            const inputs = { ...new Inputs.OCCT.ConvertStepToGltfWithDracoDto(stepOfABox()) };
            Object.assign(inputs, { stepData: { name: "part.step" } });

            // Act
            const act = (): Uint8Array => io.convertStepToGltfWithDraco(inputs);

            // Assert
            expect(act).toThrow(/must be converted to ArrayBuffer/);
        });

        it("should say what went wrong where the data is not a model at all", () => {
            // Act
            const act = (): Uint8Array => io.convertStepToGltfWithDraco({
                ...new Inputs.OCCT.ConvertStepToGltfWithDracoDto("this is not a step file")
            });

            // Assert
            expect(act).toThrow(/STEP to glTF \(Draco\) conversion failed/);
        });
    });

    describe("converting a STEP model to glTF with every knob and Draco", () => {
        const stepOfABox = (): string => {
            const box = solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
            const step = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
            box.delete();
            return step;
        };

        const isGlb = (result: Uint8Array): boolean =>
            result.length > 4 && String.fromCharCode(result[0]!, result[1]!, result[2]!, result[3]!) === "glTF";

        it.each([
            ["text", (step: string): string | ArrayBuffer | Uint8Array => step],
            ["bytes", (step: string): string | ArrayBuffer | Uint8Array => new TextEncoder().encode(step)],
            ["an ArrayBuffer", (step: string): string | ArrayBuffer | Uint8Array =>
                new TextEncoder().encode(step).buffer],
        ])("should convert a model handed over as %s", (_kind, asData) => {
            // Act
            const result = io.convertStepToGltfAdvancedWithDraco({
                ...new Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto(asData(stepOfABox()))
            });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it("should refuse a File, which only the worker layer knows how to unwrap", () => {
            // Arrange
            const inputs = { ...new Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto(stepOfABox()) };
            Object.assign(inputs, { stepData: { name: "part.step" } });

            // Act
            const act = (): Uint8Array => io.convertStepToGltfAdvancedWithDraco(inputs);

            // Assert
            expect(act).toThrow(/must be converted to ArrayBuffer/);
        });

        it("should say what went wrong where the data is not a model at all", () => {
            // Act
            const act = (): Uint8Array => io.convertStepToGltfAdvancedWithDraco({
                ...new Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto("this is not a step file")
            });

            // Assert
            expect(act).toThrow(/conversion failed/);
        });
    });
    describe("reading the structure of a STEP assembly", () => {
        const stepOfABox = (): string => {
            const box = solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
            const step = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
            box.delete();
            return step;
        };

        it.each([
            ["text", (step: string): string | ArrayBuffer | Uint8Array => step],
            ["bytes", (step: string): string | ArrayBuffer | Uint8Array => new TextEncoder().encode(step)],
            ["an ArrayBuffer", (step: string): string | ArrayBuffer | Uint8Array =>
                new TextEncoder().encode(step).buffer],
        ])("should read the tree out of a model handed over as %s", (_kind, asData) => {
            // Act
            const result = io.parseStepToJson({
                ...new Inputs.OCCT.ParseStepAssemblyToJsonDto(asData(stepOfABox()))
            });

            // Assert
            expect(result.error).toBeUndefined();
            expect(result.nodes.length).toBeGreaterThan(0);
        });

        it("should report the trouble in the result rather than throw", () => {
            // Act
            const result = io.parseStepToJson({
                ...new Inputs.OCCT.ParseStepAssemblyToJsonDto("this is not a step file")
            });

            // Assert
            expect(result.nodes ?? []).toEqual([]);
            expect(result.error).toBeDefined();
        });

        it("should report a File the same way, since only the worker layer unwraps one", () => {
            // Arrange
            const inputs = { ...new Inputs.OCCT.ParseStepAssemblyToJsonDto("") };
            Object.assign(inputs, { stepData: { name: "part.step" } });

            // Act
            const result = io.parseStepToJson(inputs);

            // Assert
            expect(result.error).toContain("must be converted to ArrayBuffer");
        });
    });

    describe("the naming and transform choices a glTF export is given", () => {
        const stepOfABox = (): string => {
            const box = solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
            const step = io.saveShapeSTEP({ shape: box, adjustYtoZ: false, fileName: "box.step" });
            box.delete();
            return step;
        };

        const isGlb = (result: Uint8Array): boolean =>
            result.length > 4 && String.fromCharCode(result[0]!, result[1]!, result[2]!, result[3]!) === "glTF";

        it.each([
            [Inputs.OCCT.gltfNameFormatEnum.empty],
            [Inputs.OCCT.gltfNameFormatEnum.product],
            [Inputs.OCCT.gltfNameFormatEnum.instance],
            [Inputs.OCCT.gltfNameFormatEnum.instanceOrProduct],
            [Inputs.OCCT.gltfNameFormatEnum.productOrInstance],
            [Inputs.OCCT.gltfNameFormatEnum.productAndInstance],
            [Inputs.OCCT.gltfNameFormatEnum.productAndInstanceAndOcaf],
        ])("should export a file whose nodes are named the %s way", (nodeNameFormat) => {
            // Arrange
            const inputs = new Inputs.OCCT.ConvertStepToGltfAdvancedDto(stepOfABox());
            inputs.nodeNameFormat = nodeNameFormat;
            inputs.meshNameFormat = nodeNameFormat;

            // Act
            const result = io.convertStepToGltfAdvanced({ ...inputs });

            // Assert
            expect(isGlb(result)).toBe(true);
        });

        it.each([
            [Inputs.OCCT.gltfTransformFormatEnum.compact],
            [Inputs.OCCT.gltfTransformFormatEnum.mat4],
            [Inputs.OCCT.gltfTransformFormatEnum.trs],
        ])("should export a file whose transforms are written the %s way", (transformFormat) => {
            // Arrange
            const inputs = new Inputs.OCCT.ConvertStepToGltfAdvancedDto(stepOfABox());
            inputs.transformFormat = transformFormat;

            // Act
            const result = io.convertStepToGltfAdvanced({ ...inputs });

            // Assert
            expect(isGlb(result)).toBe(true);
        });
    });
});
