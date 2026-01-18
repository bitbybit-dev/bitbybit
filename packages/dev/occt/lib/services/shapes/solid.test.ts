import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Face, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";
import { OCCTShell } from "./shell";
import { OCCTSolid } from "./solid";
import { OCCTCompound } from "./compound";

describe("OCCT solid unit tests", () => {
    let occt: BitbybitOcctModule;
    let face: OCCTFace;
    let shell: OCCTShell;
    let solid: OCCTSolid;
    let compound: OCCTCompound;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        face = new OCCTFace(occt, occHelper);
        shell = new OCCTShell(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        compound = new OCCTCompound(occt, occHelper);
    });

    it("should recreate a solid from closed shell if sewing all edges of the box", async () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
        const faces = face.getFaces({ shape: box });
        const s = shell.sewFaces({ shapes: faces, tolerance: 1e-7 });
        const so = solid.fromClosedShell({ shape: s });
        expect(occHelper.enumService.getShapeTypeEnum(so)).toBe(Inputs.OCCT.shapeTypeEnum.solid);
        expect(solid.getSolidVolume({ shape: so })).toBeCloseTo(8);
        box.delete();
        s.delete();
        faces.forEach(f => f.delete());
        so.delete();
    });

    it("should create a box solid", async () => {
        const box = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        expect(solid.getSolidVolume({ shape: box })).toBeCloseTo(8);
        box.delete();
    });

    it("should create a box solid from corner", async () => {
        const box = solid.createBoxFromCorner({ corner: [-1, -1, -1], width: 3, height: 2, length: 2 });
        const center = solid.getSolidCenterOfMass({ shape: box });
        expect(solid.getSolidVolume({ shape: box })).toBeCloseTo(12);

        expect(center[0]).toBeCloseTo(0.5);
        expect(center[1]).toBeCloseTo(0);
        expect(center[2]).toBeCloseTo(0);
        box.delete();
    });

    it("should create a cube solid", async () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        expect(solid.getSolidVolume({ shape: cube })).toBeCloseTo(8);
        cube.delete();
    });

    it("should create a cylinder solid", async () => {
        const cylinder = solid.createCylinder({ radius: 2, height: 2, center: [0, 0, 0], direction: [0, 0, 1], angle: 360 });
        expect(solid.getSolidVolume({ shape: cylinder })).toBeCloseTo(25.13274122871834);
        cylinder.delete();
    });

    it("should create a cylinder solid wit default direction", async () => {
        const cylinder = solid.createCylinder({ radius: 2, height: 2, center: [0, 0, 0] });
        expect(solid.getSolidVolume({ shape: cylinder })).toBeCloseTo(25.13274122871834);
        cylinder.delete();
    });

    it("should create a sphere solid", async () => {
        const sphere = solid.createSphere({ radius: 2, center: [0, 0, 0] });
        expect(solid.getSolidVolume({ shape: sphere })).toBeCloseTo(33.51032163829113);
        sphere.delete();
    });

    it("should create a cone solid", async () => {
        const cone = solid.createCone({ height: 3, radius1: 3, radius2: 1, angle: Math.PI, direction: [0, 1, 0], center: [0, 0, 0] });
        expect(solid.getSolidVolume({ shape: cone })).toBeCloseTo(20.42035224833366);
        expect(solid.getSolidSurfaceArea({ shape: cone })).toBeCloseTo(50.36231006622692);
        cone.delete();
    });

    it("should create a cone of half angle solid", async () => {
        const cone = solid.createCone({ height: 3, radius1: 3, radius2: 1, angle: Math.PI / 2, direction: [0, 1, 0], center: [0, 0, 0] });
        expect(solid.getSolidVolume({ shape: cone })).toBeCloseTo(20.42035224833366 / 2);
        cone.delete();
    });

    it("should create a cone of half angle solid", async () => {
        const cone = solid.createCone({ height: 3, radius1: 3, radius2: 1, angle: Math.PI / 2, direction: [0, 1, 0], center: [0, 0, 0] });
        expect(solid.getSolidVolume({ shape: cone })).toBeCloseTo(20.42035224833366 / 2);
        cone.delete();
    });

    it("should create cylinders on lines and get volumes", async () => {
        const cylinders = solid.createCylindersOnLines({
            radius: 2,
            lines: [
                { start: [0, 0, 0], end: [0, 1, 0] },
                { start: [0, -1, 0], end: [0, 1, 1] },
                { start: [-1, -1, 0], end: [1, 1, 0] }
            ]
        });
        expect(cylinders.length).toBe(3);
        const volumes = solid.getSolidsVolumes({ shapes: cylinders });
        const centersOfMass = solid.getSolidsCentersOfMass({ shapes: cylinders });
        expect(volumes[0]).toBeCloseTo(12.56637061435917);
        expect(volumes[1]).toBeCloseTo(28.099258924162907);
        expect(volumes[2]).toBeCloseTo(35.54306350526693);
        expect(centersOfMass[0]).toEqual([
            -7.016405868980245e-17,
            0.49999999999999994,
            -7.06789929214115e-17
        ]);
        expect(centersOfMass[1]).toEqual([
            -5.167467325983023e-17,
            9.482581965210151e-17,
            0.5000000000000001
        ]);
        expect(centersOfMass[2]).toEqual([
            8.746079156879059e-17,
            -7.496639277324908e-17,
            -9.515812715170455e-18
        ]);

        cylinders.forEach(c => c.delete());
    });


    it("get solids of a compound", async () => {
        const cone1 = solid.createCone({ height: 3, radius1: 3, radius2: 1, angle: Math.PI / 2, direction: [0, 1, 0], center: [0, 0, 0] });
        const cone2 = solid.createCone({ height: 3, radius1: 3, radius2: 1, angle: Math.PI / 2, direction: [0, 1, 0], center: [0, 10, 0] });
        const cone3 = solid.createCone({ height: 3, radius1: 3, radius2: 1, angle: Math.PI / 2, direction: [0, 1, 0], center: [0, 0, 10] });

        const compundShape = compound.makeCompound({ shapes: [cone1, cone2, cone3] });
        const solidShapes = solid.getSolids({ shape: compundShape });

        expect(solidShapes).toHaveLength(3);

        cone1.delete();
        cone2.delete();
        cone3.delete();
        compundShape.delete();
    });

    it("should filter points in the solid", async () => {
        const f1 = face.createRectangleFace({ width: 2, length: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const subdOpt = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(f1);
        subdOpt.nrDivisionsU = 5;
        subdOpt.nrDivisionsV = 5;
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const points = face.subdivideToPoints(subdOpt);
        expect(points.length).toBe(25);
        const filterOptions = new Inputs.OCCT.FilterSolidPointsDto<TopoDS_Solid>(sphere, points);
        const filteredPoints = solid.filterSolidPoints(filterOptions);
        expect(filteredPoints.length).toBe(13);
        expect(filteredPoints).toEqual([
            [0, 0, -1], [-0.5, 0, -0.5],
            [0, 0, -0.5], [0.5, 0, -0.5],
            [-1, 0, 0], [-0.5, 0, 0],
            [0, 0, 0], [0.5, 0, 0],
            [1, 0, 0], [-0.5, 0, 0.5],
            [0, 0, 0.5], [0.5, 0, 0.5],
            [0, 0, 1]
        ]);
        sphere.delete();
        f1.delete();
    });

    it("should filter points outside the solid", async () => {
        const f1 = face.createRectangleFace({ width: 2, length: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const subdOpt = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(f1);
        subdOpt.nrDivisionsU = 5;
        subdOpt.nrDivisionsV = 5;
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const points = face.subdivideToPoints(subdOpt);
        expect(points.length).toBe(25);
        const filterOptions = new Inputs.OCCT.FilterSolidPointsDto<TopoDS_Solid>(sphere, points);
        filterOptions.keepIn = false;
        filterOptions.keepOn = false;
        filterOptions.keepOut = true;
        const filteredPoints = solid.filterSolidPoints(filterOptions);
        expect(filteredPoints.length).toBe(12);
        expect(filteredPoints).toEqual([
            [-1, 0, -1], [-0.5, 0, -1],
            [0.5, 0, -1], [1, 0, -1],
            [-1, 0, -0.5], [1, 0, -0.5],
            [-1, 0, 0.5], [1, 0, 0.5],
            [-1, 0, 1], [-0.5, 0, 1],
            [0.5, 0, 1], [1, 0, 1]
        ]);
        sphere.delete();
        f1.delete();
    });

    it("should filter points on the solid", async () => {
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const sphereFace = face.getFaces({ shape: sphere })[0];
        const subdOpt = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(sphereFace);
        subdOpt.nrDivisionsU = 5;
        subdOpt.nrDivisionsV = 5;
        const points = face.subdivideToPoints(subdOpt);
        expect(points.length).toBe(25);
        const filterOptions = new Inputs.OCCT.FilterSolidPointsDto<TopoDS_Solid>(sphere, points);
        filterOptions.keepIn = false;
        filterOptions.keepOn = true;
        filterOptions.keepOut = false;
        const filteredPoints = solid.filterSolidPoints(filterOptions);
        expect(filteredPoints.length).toBe(25);
        sphere.delete();
        sphereFace.delete();
    });

    it("should not filter points if input is empty", async () => {
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const filterOptions = new Inputs.OCCT.FilterSolidPointsDto<TopoDS_Solid>(sphere, []);
        filterOptions.keepIn = false;
        filterOptions.keepOn = true;
        filterOptions.keepOut = false;
        const filteredPoints = solid.filterSolidPoints(filterOptions);
        expect(filteredPoints.length).toBe(0);
        sphere.delete();
    });

    // I-Beam profile solid tests
    it("should create an I-beam profile solid with default values", async () => {
        // I-beam area: 2 flanges (width * flangeThickness) + web ((height - 2*flangeThickness) * webThickness)
        // width=2, height=3, webThickness=0.2, flangeThickness=0.3, extrusionLengthFront=1
        // Area = 2 * (2 * 0.3) + (3 - 2*0.3) * 0.2 = 1.2 + 2.4 * 0.2 = 1.2 + 0.48 = 1.68
        // Volume = 1.68 * 1 = 1.68
        const opt = new Inputs.OCCT.IBeamProfileSolidDto(2, 3, 0.2, 0.3);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const ibeam = solid.createIBeamProfileSolid(opt);
        const volume = solid.getSolidVolume({ shape: ibeam });
        expect(volume).toBeCloseTo(1.68);
        ibeam.delete();
    });

    it("should create an I-beam profile solid with bidirectional extrusion", async () => {
        // Same area as above: 1.68
        // Volume = 1.68 * (1 + 0.5) = 1.68 * 1.5 = 2.52
        const opt = new Inputs.OCCT.IBeamProfileSolidDto(2, 3, 0.2, 0.3);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0.5;
        const ibeam = solid.createIBeamProfileSolid(opt);
        const volume = solid.getSolidVolume({ shape: ibeam });
        expect(volume).toBeCloseTo(2.52);
        ibeam.delete();
    });

    // H-Beam profile solid tests
    it("should create an H-beam profile solid with default values", async () => {
        // H-beam area: 2 flanges (height * flangeThickness) + web ((width - 2*flangeThickness) * webThickness)
        // width=2, height=3, webThickness=0.2, flangeThickness=0.3, extrusionLengthFront=1
        // Area = 2 * (3 * 0.3) + (2 - 2*0.3) * 0.2 = 1.8 + 1.4 * 0.2 = 1.8 + 0.28 = 2.08
        // Volume = 2.08 * 1 = 2.08
        const opt = new Inputs.OCCT.HBeamProfileSolidDto(2, 3, 0.2, 0.3);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const hbeam = solid.createHBeamProfileSolid(opt);
        const volume = solid.getSolidVolume({ shape: hbeam });
        expect(volume).toBeCloseTo(2.08);
        hbeam.delete();
    });

    it("should create an H-beam profile solid with backward extrusion only", async () => {
        // Volume = 2.08 * 2 = 4.16
        const opt = new Inputs.OCCT.HBeamProfileSolidDto(2, 3, 0.2, 0.3);
        opt.extrusionLengthFront = 0;
        opt.extrusionLengthBack = 2;
        const hbeam = solid.createHBeamProfileSolid(opt);
        const volume = solid.getSolidVolume({ shape: hbeam });
        expect(volume).toBeCloseTo(4.16);
        hbeam.delete();
    });

    // T-Beam profile solid tests
    it("should create a T-beam profile solid with default values", async () => {
        // T-beam area: 1 flange (width * flangeThickness) + web ((height - flangeThickness) * webThickness)
        // width=2, height=2, webThickness=0.2, flangeThickness=0.3, extrusionLengthFront=1
        // Area = (2 * 0.3) + (2 - 0.3) * 0.2 = 0.6 + 1.7 * 0.2 = 0.6 + 0.34 = 0.94
        // Volume = 0.94 * 1 = 0.94
        const opt = new Inputs.OCCT.TBeamProfileSolidDto(2, 2, 0.2, 0.3);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const tbeam = solid.createTBeamProfileSolid(opt);
        const volume = solid.getSolidVolume({ shape: tbeam });
        expect(volume).toBeCloseTo(0.94);
        tbeam.delete();
    });

    // U-Beam profile solid tests
    it("should create a U-beam profile solid with default values", async () => {
        // U-beam area: 2 vertical flanges + bottom web
        // width=2, height=3, webThickness=0.2, flangeThickness=0.3, flangeWidth=0.5, extrusionLengthFront=1
        const opt = new Inputs.OCCT.UBeamProfileSolidDto(2, 3, 0.2, 0.3, 0.5);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const ubeam = solid.createUBeamProfileSolid(opt);
        const volume = solid.getSolidVolume({ shape: ubeam });
        // Actual computed volume is 2.25
        expect(volume).toBeCloseTo(2.25);
        ubeam.delete();
    });

    // Star solid tests
    it("should create a star solid with default values", async () => {
        const opt = new Inputs.OCCT.StarSolidDto(2, 1, 5);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const star = solid.createStarSolid(opt);
        const volume = solid.getSolidVolume({ shape: star });
        // 5-pointed star area ≈ 5 * (0.5 * outerRadius * innerRadius * sin(2π/5)) = 5 * 0.5 * 2 * 1 * sin(72°)
        // For a 5-pointed star with outer=2, inner=1:
        // Area can be calculated as n * r1 * r2 * sin(π/n) where n=5
        // = 5 * 2 * 1 * sin(36°) ≈ 5 * 2 * 0.588 ≈ 5.878
        // Volume ≈ 5.878
        expect(volume).toBeCloseTo(5.877, 2);

        star.delete();
    });

    it("should create a star solid and verify volume is positive", async () => {
        const opt = new Inputs.OCCT.StarSolidDto(2, 1, 6);
        opt.half = false;
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const star = solid.createStarSolid(opt);
        const volume = solid.getSolidVolume({ shape: star });
        // 6-pointed star with outer=2, inner=1
        expect(volume).toBe(6);
        star.delete();
    });

    // NGon solid tests
    it("should create a hexagon (6-gon) solid", async () => {
        // Hexagon area = (3 * sqrt(3) / 2) * r^2 where r is the radius
        // For radius = 1: Area = (3 * 1.732 / 2) * 1 = 2.598
        // Volume = 2.598 * 1 = 2.598
        const opt = new Inputs.OCCT.NGonSolidDto([0, 0, 0], [0, 1, 0], 6, 1);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const hexagon = solid.createNGonSolid(opt);
        const volume = solid.getSolidVolume({ shape: hexagon });
        expect(volume).toBeCloseTo(2.598, 2);
        hexagon.delete();
    });

    it("should create a pentagon (5-gon) solid", async () => {
        // Pentagon area = (5/4) * r^2 * sqrt(10 + 2*sqrt(5)) / sqrt(5)
        // Simplified: (5/2) * r^2 * sin(72°) = 2.5 * 1 * 0.951 = 2.378
        const opt = new Inputs.OCCT.NGonSolidDto([0, 0, 0], [0, 1, 0], 5, 1);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const pentagon = solid.createNGonSolid(opt);
        const volume = solid.getSolidVolume({ shape: pentagon });
        expect(volume).toBeCloseTo(2.378, 2);
        pentagon.delete();
    });

    it("should create a triangle (3-gon) solid", async () => {
        // Equilateral triangle inscribed in circle of radius r
        // Area = (3 * sqrt(3) / 4) * (r * sqrt(3))^2 = (3 * sqrt(3) / 4) * 3 * r^2 = (9 * sqrt(3) / 4) * r^2
        // For r = 1: Area = 1.299
        const opt = new Inputs.OCCT.NGonSolidDto([0, 0, 0], [0, 1, 0], 3, 1);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const triangle = solid.createNGonSolid(opt);
        const volume = solid.getSolidVolume({ shape: triangle });
        expect(volume).toBeCloseTo(1.299, 2);
        triangle.delete();
    });

    // Parallelogram solid tests
    it("should create a parallelogram solid", async () => {
        // Parallelogram area = width * height (base * height for the slanted shape)
        // width=2, height=1, angle=15 degrees
        // Area = 2 * 1 = 2
        // Volume = 2 * 1 = 2
        const opt = new Inputs.OCCT.ParallelogramSolidDto([0, 0, 0], [0, 1, 0], true, 2, 1, 15);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const parallelogram = solid.createParallelogramSolid(opt);
        const volume = solid.getSolidVolume({ shape: parallelogram });
        expect(volume).toBeCloseTo(2);
        parallelogram.delete();
    });

    it("should create a parallelogram solid with bidirectional extrusion", async () => {
        const opt = new Inputs.OCCT.ParallelogramSolidDto([0, 0, 0], [0, 1, 0], true, 2, 1, 30);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 1;
        const parallelogram = solid.createParallelogramSolid(opt);
        const volume = solid.getSolidVolume({ shape: parallelogram });
        // Volume = 2 * 2 = 4
        expect(volume).toBeCloseTo(4);
        parallelogram.delete();
    });

    // Heart solid tests
    it("should create a heart solid", async () => {
        const opt = new Inputs.OCCT.HeartSolidDto([0, 0, 0], [0, 1, 0], 0, 2);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const heart = solid.createHeartSolid(opt);
        const volume = solid.getSolidVolume({ shape: heart });
        // Heart shape volume depends on the parametric curve
        expect(volume).toBeCloseTo(2.732, 2);
        heart.delete();
    });

    it("should create a rotated heart solid with same volume", async () => {
        const opt1 = new Inputs.OCCT.HeartSolidDto([0, 0, 0], [0, 1, 0], 0, 2);
        opt1.extrusionLengthFront = 1;
        opt1.extrusionLengthBack = 0;
        const heart1 = solid.createHeartSolid(opt1);

        const opt2 = new Inputs.OCCT.HeartSolidDto([0, 0, 0], [0, 1, 0], 45, 2);
        opt2.extrusionLengthFront = 1;
        opt2.extrusionLengthBack = 0;
        const heart2 = solid.createHeartSolid(opt2);

        const volume1 = solid.getSolidVolume({ shape: heart1 });
        const volume2 = solid.getSolidVolume({ shape: heart2 });
        expect(volume1).toBeCloseTo(volume2);
        heart1.delete();
        heart2.delete();
    });

    // Christmas tree solid tests
    it("should create a christmas tree solid", async () => {
        const opt = new Inputs.OCCT.ChristmasTreeSolidDto(6, 1.5, 3, 5, 1, 1, false, 0, [0, 0, 0], [0, 1, 0]);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const tree = solid.createChristmasTreeSolid(opt);
        const volume = solid.getSolidVolume({ shape: tree });
        expect(volume).toBeCloseTo(15.687, 2);
        tree.delete();
    });

    it("should create christmas tree solid with bidirectional extrusion", async () => {
        const opt = new Inputs.OCCT.ChristmasTreeSolidDto(6, 1.5, 3, 5, 1, 1, false, 0, [0, 0, 0], [0, 1, 0]);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 1;
        const tree = solid.createChristmasTreeSolid(opt);
        const volume = solid.getSolidVolume({ shape: tree });
        // Bidirectional extrusion should double the volume
        expect(volume).toBeCloseTo(31.375, 2);
        tree.delete();
    });

    // L-Polygon solid tests
    it("should create an L-polygon solid with default values", async () => {
        // L-polygon area depends on alignment mode
        // widthFirst=1, lengthFirst=2, widthSecond=0.5, lengthSecond=2
        const opt = new Inputs.OCCT.LPolygonSolidDto(1, 2, 0.5, 2);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 0;
        const lpolygon = solid.createLPolygonSolid(opt);
        const volume = solid.getSolidVolume({ shape: lpolygon });
        // Actual computed volume is 3.5
        expect(volume).toBeCloseTo(3.5);
        lpolygon.delete();
    });

    it("should create an L-polygon solid with bidirectional extrusion", async () => {
        const opt = new Inputs.OCCT.LPolygonSolidDto(1, 2, 0.5, 2);
        opt.extrusionLengthFront = 1;
        opt.extrusionLengthBack = 1;
        const lpolygon = solid.createLPolygonSolid(opt);
        const volume = solid.getSolidVolume({ shape: lpolygon });
        // Volume = 3.5 * 2 = 7
        expect(volume).toBeCloseTo(7);
        lpolygon.delete();
    });

    // Error case tests
    it("should throw error when both extrusion lengths are zero", async () => {
        const opt = new Inputs.OCCT.IBeamProfileSolidDto(2, 3, 0.2, 0.3);
        opt.extrusionLengthFront = 0;
        opt.extrusionLengthBack = 0;
        expect(() => solid.createIBeamProfileSolid(opt)).toThrow("Cannot create solid: both extrusionLengthFront and extrusionLengthBack are 0");
    });

    it("should throw error for NGon solid when both extrusion lengths are zero", async () => {
        const opt = new Inputs.OCCT.NGonSolidDto([0, 0, 0], [0, 1, 0], 6, 1);
        opt.extrusionLengthFront = 0;
        opt.extrusionLengthBack = 0;
        expect(() => solid.createNGonSolid(opt)).toThrow("Cannot create solid: both extrusionLengthFront and extrusionLengthBack are 0");
    });
});
