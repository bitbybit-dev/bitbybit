import { OCCT as BaseOCCT, OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { JSONPath } from "jsonpath-plus";
import { Babylon } from "./bitbybit/babylon/babylon";
import {
    Vector,
    Point,
    Line,
    Polyline,
    Verb,
    JSCAD,
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
import * as BABYLON from "@babylonjs/core";
import * as vrb from "verb-nurbs-web";
import { DrawHelper } from "./draw-helper";

export class BitByBitBase {

    public context: Context;
    public jscadWorkerManager: JSCADWorkerManager;
    public occtWorkerManager: OCCTWorkerManager;

    public math: MathBitByBit;
    public logic: Logic;
    public lists: Lists;
    public json: JSONBitByBit;
    public vector: Vector;
    public babylon: Babylon;
    public point: Point;
    public line: Line;
    public transforms: Transforms;
    public polyline: Polyline;
    public draw: Draw;
    public verb: Verb;
    public jscad: JSCAD;
    public text: TextBitByBit;
    public tag: Tag;
    public time: Time;
    public occt: OCCTW & BaseOCCT;
    public asset: Asset;
    public color: Color;

    constructor() {
        this.context = new Context();
        this.jscadWorkerManager = new JSCADWorkerManager();
        this.occtWorkerManager = new OCCTWorkerManager();
        this.jscad = new JSCAD(this.jscadWorkerManager);

        const geometryHelper = new GeometryHelper();
        const drawHelper = new DrawHelper(this.context, this.jscad.text, this.vector, this.jscadWorkerManager, this.occtWorkerManager,);
        this.babylon = new Babylon(this.context, drawHelper, this.color);
        this.tag = new Tag(this.context);
        this.draw = new Draw(
            drawHelper,
            this.babylon.node,
            this.tag,
            this.context);

        this.color = new Color(this.context);
        this.math = new MathBitByBit();
        this.vector = new Vector(this.context, this.math, geometryHelper);
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

    init(scene: BABYLON.Scene, occt?: Worker, jscad?: Worker, havokPlugin?: BABYLON.HavokPlugin) {
        this.context.scene = scene;
        if (havokPlugin) {
            this.context.havokPlugin = havokPlugin;
        }
        const verb = { geom: vrb.geom, core: vrb.core };
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
