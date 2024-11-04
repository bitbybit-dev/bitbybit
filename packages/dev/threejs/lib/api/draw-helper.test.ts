import { GeometryHelper, JSCADText, MathBitByBit, Tag, Vector } from "@bitbybit-dev/core";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import { JSCADWorkerManager } from "@bitbybit-dev/core/lib/workers";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import { Scene } from "three";

describe("Draw unit tests", () => {
    let drawHelper: DrawHelper;

    beforeAll(async () => {
        const context = new Context();
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();

        const solidText = new JSCADText(jscadWorkerManager);
        const math = new MathBitByBit();
        const geometryHelper = new GeometryHelper();
        const vector = new Vector(context, math, geometryHelper);
        drawHelper = new DrawHelper(context, solidText, vector, jscadWorkerManager, occtWorkerManager);
        context.scene = new Scene();
    });

    it("should be initialised", () => {
        expect(drawHelper).toBeDefined();
    });
});
