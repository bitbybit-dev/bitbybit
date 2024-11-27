import initOpenCascade, { OpenCascadeInstance, TopoDS_Face, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";
import { OCCTShell } from "./shell";
import { OCCTSolid } from "./solid";
import { OCCTCompound } from "./compound";

describe("OCCT solid unit tests", () => {
    let occt: OpenCascadeInstance;
    let face: OCCTFace;
    let shell: OCCTShell;
    let solid: OCCTSolid;
    let compound: OCCTCompound;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
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
        const cylinder = solid.createCylinder({ radius: 2, height: 2, center: [0, 0, 0], direction: [0, 0, 1] });
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
            [ 0, 0, -1 ],   [ -0.5, 0, -0.5 ],
            [ 0, 0, -0.5 ], [ 0.5, 0, -0.5 ],
            [ -1, 0, 0 ],   [ -0.5, 0, 0 ],
            [ 0, 0, 0 ],    [ 0.5, 0, 0 ],
            [ 1, 0, 0 ],    [ -0.5, 0, 0.5 ],
            [ 0, 0, 0.5 ],  [ 0.5, 0, 0.5 ],
            [ 0, 0, 1 ]
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
            [ -1, 0, -1 ],   [ -0.5, 0, -1 ],
            [ 0.5, 0, -1 ],  [ 1, 0, -1 ],
            [ -1, 0, -0.5 ], [ 1, 0, -0.5 ],
            [ -1, 0, 0.5 ],  [ 1, 0, 0.5 ],
            [ -1, 0, 1 ],    [ -0.5, 0, 1 ],
            [ 0.5, 0, 1 ],   [ 1, 0, 1 ]
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
});
