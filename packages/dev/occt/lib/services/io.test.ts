import initOpenCascade, { OpenCascadeInstance } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTSolid } from "./shapes";
import { OCCTIO } from "./io";

describe("OCCT io unit tests", () => {
    let occt: OpenCascadeInstance;
    let io: OCCTIO;
    let solid: OCCTSolid;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();

        occHelper = new OccHelper(vec, s, occt);
        solid = new OCCTSolid(occt, occHelper);
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
        const ex = someLinesFromFile.map(l => true);

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
        const ex = someLinesFromFile.map(l => true);

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
        const volumeLoaded = solid.getSolidVolume({ shape:loaded });

        expect(volumeOriginal).toBeCloseTo(volumeLoaded);
        c.delete();
        loaded.delete();
    });

});
