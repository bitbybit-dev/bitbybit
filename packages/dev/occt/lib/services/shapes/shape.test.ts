import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTShape } from "./shape";
import { OCCTSolid } from "./solid";
import { OCCTFace } from "./face";
import { OCCTWire } from "./wire";
import { OCCTEdge } from "./edge";
import { OCCTShell } from "./shell";
import { OCCTOperations } from "../operations";
import { OCCTSurfaces } from "../geom/surfaces";
import * as Inputs from "../../api/inputs";

describe("OCCT shape unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let shape: OCCTShape;
    let solid: OCCTSolid;
    let face: OCCTFace;
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let shell: OCCTShell;
    let operations: OCCTOperations;
    let surfaces: OCCTSurfaces;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        shape = new OCCTShape(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        shell = new OCCTShell(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
        operations = new OCCTOperations(occt, occHelper);
        surfaces = new OCCTSurfaces(occt, occHelper);
    });

    it("should unify same domain", () => {
        const square1 = wire.createSquareWire({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const square2 = wire.createSquareWire({ size: 3, center: [0, 0, 0], direction: [0, 1, 0] });
        const square3 = wire.createSquareWire({ size: 4, center: [0, 0, 0], direction: [0, 1, 0] });
        const loftOpt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>();
        loftOpt.shapes = [square1, square2, square3];
        loftOpt.makeSolid = false;
        loftOpt.straight = true;
        const loft = operations.loftAdvanced(loftOpt);
        const unified = shape.unifySameDomain({
            shape: loft,
            concatBSplines: true,
            unifyEdges: true,
            unifyFaces: true,
        });
        const edges = edge.getEdges({
            shape: unified
        });

        const faces = face.getFaces({
            shape: unified
        });
        expect(edges.length).toBe(8);
        expect(faces.length).toBe(1);

        // Cleanup
        square1.delete();
        square2.delete();
        square3.delete();
        loft.delete();
        unified.delete();
        edges.forEach(e => e.delete());
        faces.forEach(f => f.delete());
    });

    it("should check whether shape is null", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isNull({ shape: cube });
        expect(res).toBe(false);
        cube.Nullify();
        const isNull = shape.isNull({ shape: cube });
        expect(isNull).toBe(true);
        cube.delete();
    });

    it("should check whether shell shape is closed", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        const faces = face.getFaces({ shape: cube });
        const shell1 = shell.sewFaces({
            shapes: faces,
            tolerance: 0.00000001,
        });
        const res = shape.isClosed({ shape: shell1 });
        expect(res).toBe(true);
        cube.delete();
        shell1.delete();
        faces.forEach(f => f.delete());
    });

    it("should check whether shell shape is open", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        const faces = face.getFaces({ shape: cube });
        faces.pop();
        const shell1 = shell.sewFaces({
            shapes: faces,
            tolerance: 0.00000001,
        });
        const res = shape.isClosed({ shape: shell1 });
        expect(res).toBe(false);
        cube.delete();
        shell1.delete();
        faces.forEach(f => f.delete());
    });

    it("should check whether wire shape is closed", async () => {
        const circleWire = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const res = shape.isClosed({ shape: circleWire });
        expect(res).toBe(true);
        circleWire.delete();
    });

    it("should check whether wire shape is open", async () => {
        const bspline = wire.createBSpline({ points: [[0, 0, 0], [1, 0, 1], [1, 0, 0], [0, 0, 1]], closed: false });
        const res = shape.isClosed({ shape: bspline });
        expect(res).toBe(false);
        bspline.delete();
    });

    it("should check whether loft shape is marked as convex", async () => {
        // it seems that in OCCT marking does not happen automatically, could be investigated further
        const circle1 = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = wire.createCircleWire({ radius: 1.5, center: [0, 1, 0], direction: [0, 1, 0] });
        const circle3 = wire.createCircleWire({ radius: 1, center: [0, 2, 0], direction: [0, 1, 0] });
        const loft = operations.loft({ shapes: [circle1, circle2, circle3], makeSolid: false });
        loft.SetConvex(true);
        const res = shape.isConvex({ shape: loft });
        expect(res).toBe(true);
        circle1.delete();
        circle2.delete();
        circle3.delete();
        loft.delete();
    });

    it("should check whether loft shape is marked as convex", async () => {
        // it seems that in OCCT marking does not happen automatically
        const circle1 = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = wire.createCircleWire({ radius: 0.5, center: [0, 1, 0], direction: [0, 1, 0] });
        const circle3 = wire.createCircleWire({ radius: 1, center: [0, 2, 0], direction: [0, 1, 0] });
        const loft = operations.loft({ shapes: [circle1, circle2, circle3], makeSolid: false });
        loft.SetConvex(false);
        const res = shape.isConvex({ shape: loft });
        expect(res).toBe(false);
        circle1.delete();
        circle2.delete();
        circle3.delete();
        loft.delete();
    });

    it("should check whether shape is marked as checked", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        let res = shape.isChecked({ shape: cube });
        expect(res).toBe(false);
        cube.SetChecked(true);
        res = shape.isChecked({ shape: cube });
        expect(res).toBe(true);
        cube.delete();
    });

    it("should check whether shape is marked as free", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        let res = shape.isFree({ shape: cube });
        expect(res).toBe(true);
        cube.SetFree(false);
        res = shape.isFree({ shape: cube });
        expect(res).toBe(false);
        cube.delete();
    });

    it("should check whether shape is infinite", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isInfinite({ shape: cube });
        expect(res).toBe(false);
        cube.delete();
    });

    it("should check whether shape is infinite", async () => {
        const cylSurface = surfaces.cylindricalSurface({
            radius: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const f = face.faceFromSurface({
            shape: cylSurface,
            tolerance: 0.001,
        });
        f.SetInfinite(true);
        const res = shape.isInfinite({ shape: f });
        expect(res).toBe(true);
        cylSurface.delete();
        f.delete();
    });

    it("should check whether shape is modified", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        let res = shape.isModified({ shape: cube });
        expect(res).toBe(true);
        cube.SetModified(false);
        res = shape.isModified({ shape: cube });
        expect(res).toBe(false);
        cube.delete();
    });

    it("should check whether shape is locked", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        let res = shape.isLocked({ shape: cube });
        expect(res).toBe(false);
        cube.SetLocked(true);
        res = shape.isLocked({ shape: cube });
        expect(res).toBe(true);
        cube.delete();
    });

    it("should check whether shapes are equal", async () => {
        const cube1 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const cube2 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isEqual({ shape: cube1, otherShape: cube2 });
        expect(res).toBe(false);
        cube1.delete();
        cube2.delete();
    });

    it("should check whether shapes are equal", async () => {
        const cube1 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isEqual({ shape: cube1, otherShape: cube1 });
        expect(res).toBe(true);
        cube1.delete();
    });

    it("should check whether shapes are not equal", async () => {
        const cube1 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const cube2 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isNotEqual({ shape: cube1, otherShape: cube2 });
        expect(res).toBe(true);
        cube1.delete();
        cube2.delete();
    });

    it("should check whether shapes are not equal", async () => {
        const cube1 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isNotEqual({ shape: cube1, otherShape: cube1 });
        expect(res).toBe(false);
        cube1.delete();
    });

    it("should check whether shapes are same", async () => {
        const cube1 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const cube2 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isSame({ shape: cube1, otherShape: cube2 });
        expect(res).toBe(false);
        cube1.delete();
        cube2.delete();
    });


    it("should check whether shapes are partners", async () => {
        const cube1 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const cube2 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isPartner({ shape: cube1, otherShape: cube2 });
        expect(res).toBe(false);
        cube1.delete();
        cube2.delete();
    });

    it("should check whether shapes are the same", async () => {
        const cube1 = solid.createCube({ size: 1, center: [0, 0, 0] });
        const res = shape.isSame({ shape: cube1, otherShape: cube1 });
        expect(res).toBe(true);
        cube1.delete();
    });

    it("should get forward orientation of the shape", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        const orientation = shape.getOrientation({
            shape: cube
        });
        expect(orientation).toBe(Inputs.OCCT.topAbsOrientationEnum.forward);
        cube.delete();
    });

    it("should get reversed orientation of the shape", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        const rev = cube.Reversed();
        const orientation = shape.getOrientation({
            shape: rev
        });
        expect(orientation).toBe(Inputs.OCCT.topAbsOrientationEnum.reversed);
        cube.delete();
        rev.delete();
    });

    it("should get reversed orientation of the shape", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        cube.SetOrientation(occt.TopAbs_Orientation.INTERNAL);
        const orientation = shape.getOrientation({
            shape: cube
        });
        expect(orientation).toBe(Inputs.OCCT.topAbsOrientationEnum.internal);
        cube.SetOrientation(occt.TopAbs_Orientation.EXTERNAL);
        const orientation2 = shape.getOrientation({
            shape: cube
        });
        expect(orientation2).toBe(Inputs.OCCT.topAbsOrientationEnum.external);
        cube.delete();
    });

    it("should get shape type", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        const type = shape.getShapeType({
            shape: cube
        });
        expect(type).toBe(Inputs.OCCT.shapeTypeEnum.solid);
        cube.delete();
    });

    it("should not purge internal edges for the shape if there are any and return it", async () => {
        const cube = solid.createCube({ size: 1, center: [0, 0, 0] });
        const s = shape.purgeInternalEdges({
            shape: cube
        });
        expect(s).toBeDefined();
        cube.delete();
    });
});
