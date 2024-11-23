import { OCCT as BaseOCCT, OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { JSONPath } from "jsonpath-plus";
import {
    Vector,
    Point,
    Line,
    Polyline,
    Verb,
    JSCAD,
    ManifoldBitByBit,
    Tag,
    Time,
    TextBitByBit,
    OCCTW,
    Asset,
    Color,
    MathBitByBit,
    GeometryHelper,
    Lists,
    JSONBitByBit,
    Logic,
    Transforms,
} from "@bitbybit-dev/core";
import { Draw } from "./bitbybit/draw";
import { Context } from "./context";
import { JSCADWorkerManager } from "@bitbybit-dev/core/lib/workers/jscad/jscad-worker-manager";
import { ManifoldWorkerManager } from "@bitbybit-dev/core/lib/workers/manifold/manifold-worker-manager";
import * as vrb from "verb-nurbs-web";
import { DrawHelper } from "./draw-helper";
import { ThreeJS } from "./bitbybit/threejs";
import { Scene } from "three";

export class BitByBitBase {

    public context: Context;
    public jscadWorkerManager: JSCADWorkerManager;
    public manifoldWorkerManager: ManifoldWorkerManager;
    public occtWorkerManager: OCCTWorkerManager;

    public math: MathBitByBit;
    public logic: Logic;
    public lists: Lists;
    public json: JSONBitByBit;
    public vector: Vector;
    public three: ThreeJS;
    public point: Point;
    public line: Line;
    public transforms: Transforms;
    public polyline: Polyline;
    public draw: Draw;
    public verb: Verb;
    public jscad: JSCAD;
    public manifold: ManifoldBitByBit;
    public text: TextBitByBit;
    public tag: Tag;
    public time: Time;
    public occt: OCCTW & BaseOCCT;
    public asset: Asset;
    public color: Color;

    constructor() {
        this.context = new Context();
        this.jscadWorkerManager = new JSCADWorkerManager();
        this.manifoldWorkerManager = new ManifoldWorkerManager();
        this.occtWorkerManager = new OCCTWorkerManager();
        this.jscad = new JSCAD(this.jscadWorkerManager);
        this.manifold = new ManifoldBitByBit(this.manifoldWorkerManager);

        const geometryHelper = new GeometryHelper();
        this.math = new MathBitByBit();
        this.vector = new Vector(this.context, this.math, geometryHelper);
        const drawHelper = new DrawHelper(this.context, this.jscad.text, this.vector, this.jscadWorkerManager, this.occtWorkerManager);
        this.three = new ThreeJS(drawHelper);
        this.tag = new Tag(this.context);
        this.draw = new Draw(drawHelper, this.context, this.tag);
        this.color = new Color(this.context);
        this.line = new Line(this.context, geometryHelper);
        this.transforms = new Transforms(this.vector, this.math);
        this.point = new Point(this.context, geometryHelper, this.line, this.transforms);
        this.polyline = new Polyline(this.context, geometryHelper);
        this.verb = new Verb(this.context, geometryHelper, this.math);
        this.time = new Time(this.context);
        this.occt = new OCCTW(this.context, this.occtWorkerManager);
        this.asset = new Asset();
        this.logic = new Logic();
        this.json = new JSONBitByBit(this.context);
        this.text = new TextBitByBit();
        this.lists = new Lists();
    }

    init(scene: Scene, occt?: Worker, jscad?: Worker) {
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
    }
}
