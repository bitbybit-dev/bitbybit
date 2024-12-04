import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import { JSCADWorkerManager, JSCADText } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import { Scene } from "three";

describe("Draw unit tests", () => {
    let drawHelper: DrawHelper;

    beforeAll(async () => {
        const context = new Context();
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();
        const manifoldWorkerManager = new ManifoldWorkerManager();

        const solidText = new JSCADText(jscadWorkerManager);
        const math = new MathBitByBit();
        const geometryHelper = new GeometryHelper();
        const vector = new Vector(math, geometryHelper);
        drawHelper = new DrawHelper(context, solidText, vector, jscadWorkerManager, manifoldWorkerManager, occtWorkerManager);
        context.scene = new Scene();
    });

    it("should be initialised", () => {
        expect(drawHelper).toBeDefined();
    });
});
