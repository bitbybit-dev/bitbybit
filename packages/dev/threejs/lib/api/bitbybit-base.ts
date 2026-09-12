import { OCCT as BaseOCCT, OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { JSONPath } from "jsonpath-plus";
import {
    Verb,
    Tag,
    Time,
    OCCTW,
    Asset,
    JSONBitByBit,
    CSVBitByBit,
} from "@bitbybit-dev/core";
import { JSCAD } from "@bitbybit-dev/jscad-worker";
import { ManifoldBitByBit } from "@bitbybit-dev/manifold-worker";
import {
    Vector,
    Point,
    Line,
    Polyline, TextBitByBit, Color,
    MathBitByBit,
    Lists, Logic, Transforms, Dates, MeshBitByBit
} from "@bitbybit-dev/base";
import { createSharedServices } from "@bitbybit-dev/core/lib/api/shared-services";
import { Draw } from "./bitbybit/draw";
import { Context } from "./context";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import * as vrb from "verb-nurbs-web";
import { DrawHelper } from "./draw-helper";
import { ThreeJS } from "./bitbybit/threejs";
import * as THREEJS from "three";

/**
 * The whole library behind one object for a Three.js scene: `occt`, `jscad` and `manifold` for the
 * CAD kernels, `draw` to put anything into the scene, `three` for the camera, and the plain data
 * helpers `math`, `vector`, `point`, `line`, `polyline`, `transforms`, `lists`, `logic`, `json`,
 * `csv`, `text`, `dates`, `color`, `asset`, `tag` and `time`. Call `init` once with the scene and
 * the kernel workers before using any of them. The `bitbybit` object in the examples throughout
 * these docs is an instance of this class.
 */
export class BitByBitBase {

    public context: Context;
    public jscadWorkerManager: JSCADWorkerManager;
    public manifoldWorkerManager: ManifoldWorkerManager;
    public occtWorkerManager: OCCTWorkerManager;

    public math: MathBitByBit;
    public logic: Logic;
    public lists: Lists;
    public json: JSONBitByBit;
    public csv: CSVBitByBit;
    public vector: Vector;
    public three: ThreeJS;
    public point: Point;
    public line: Line;
    public transforms: Transforms;
    public polyline: Polyline;
    public draw: Draw;
    /**
     * NURBS curves and surfaces.
     *
     * @deprecated Verbnurbs is not maintained upstream and this API is removed in the next major
     * version. Use the OpenCascade (occt) NURBS operations instead. Existing scripts keep working
     * until the removal.
     */
    public verb: Verb;
    public jscad: JSCAD;
    public manifold: ManifoldBitByBit;
    public text: TextBitByBit;
    public dates: Dates;
    public tag: Tag;
    public time: Time;
    public occt: OCCTW & BaseOCCT;
    public mesh: MeshBitByBit;
    public asset: Asset;
    public color: Color;

    constructor() {
        this.context = new Context();
        const shared = createSharedServices(this.context);
        this.jscadWorkerManager = shared.jscadWorkerManager;
        this.manifoldWorkerManager = shared.manifoldWorkerManager;
        this.occtWorkerManager = shared.occtWorkerManager;
        this.jscad = shared.jscad;
        this.manifold = shared.manifold;
        this.lists = shared.lists;
        this.math = shared.math;
        this.vector = shared.vector;
        this.tag = shared.tag;
        this.color = shared.color;
        this.transforms = shared.transforms;
        this.point = shared.point;
        this.line = shared.line;
        this.polyline = shared.polyline;
        this.verb = shared.verb;
        this.time = shared.time;
        this.occt = shared.occt;
        this.asset = shared.asset;
        this.logic = shared.logic;
        this.json = shared.json;
        this.csv = shared.csv;
        this.text = shared.text;
        this.dates = shared.dates;
        this.mesh = shared.mesh;
        const drawHelper = new DrawHelper(this.context, this.jscad.text, this.vector, this.jscadWorkerManager, this.manifoldWorkerManager, this.occtWorkerManager);
        this.three = new ThreeJS(this.context, drawHelper);
        this.draw = new Draw(drawHelper, this.context, this.tag);
    }

    /**
     * Connects the library to a Three.js scene and to the web workers that run the CAD kernels;
     * nothing works before it is called.
     *
     * A kernel whose worker is left out is unavailable, so pass only the ones your application
     * loads.
     * @param scene - The scene everything is drawn into
     * @param occt - The worker running the OCCT kernel, when OCCT is used
     * @param jscad - The worker running the JSCAD kernel, when JSCAD is used
     * @param manifold - The worker running the Manifold kernel, when Manifold is used
     * @returns Nothing
     * @example
     * ```typescript
     * const bitbybit = new BitByBitBase();
     * const occtWorker = new Worker(new URL("./occt.worker", import.meta.url), { name: "OCC", type: "module" });
     * bitbybit.init(scene, occtWorker);
     * ```
     */
    init(scene: THREEJS.Scene, occt?: Worker, jscad?: Worker, manifold?: Worker) {
        const verb = { geom: vrb.geom, core: vrb.core };
        this.context.scene = scene;
        this.context.verb = verb;
        this.context.jsonpath = JSONPath;
        if (occt) {
            this.occtWorkerManager.setOccWorker(occt);
        }
        if (jscad) {
            this.jscadWorkerManager.setJscadWorker(jscad);
        }
        if (manifold) {
            this.manifoldWorkerManager.setManifoldWorker(manifold);
        }
    }
}
