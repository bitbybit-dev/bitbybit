import initOpenCascade, { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTShapes } from "./shapes";

describe("OCCT face unit tests", () => {
    let occt: OpenCascadeInstance;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
    });

    it("should create shapes object", async () => {
        const shapes = new OCCTShapes(occt, occHelper);
        expect(shapes).toBeDefined();
        expect(shapes.compound).toBeDefined();
        expect(shapes.wire).toBeDefined();
        expect(shapes.edge).toBeDefined();
        expect(shapes.face).toBeDefined();
        expect(shapes.solid).toBeDefined();
        expect(shapes.shell).toBeDefined();
        expect(shapes.shape).toBeDefined();
    });

});
