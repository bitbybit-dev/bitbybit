import { OCCT as BaseOCCT, OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { JSONPath } from "jsonpath-plus";
import { Babylon } from "./bitbybit/babylon/babylon";
import {
    Line,
    Polyline,
    Verb,
    Tag,
    Time,
    OCCTW,
    Asset,
    JSONBitByBit,
} from "@bitbybit-dev/core";
import {
    Vector,
    Point,
    TextBitByBit,
    Color,
    MathBitByBit,
    GeometryHelper,
    Lists,
    Logic,
    Transforms
} from "@bitbybit-dev/base";
import {
    JSCAD
} from "@bitbybit-dev/jscad-worker";
import { ManifoldBitByBit } from "@bitbybit-dev/manifold-worker";
import { Draw } from "./bitbybit/draw";
import { Context } from "./context";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import * as BABYLON from "@babylonjs/core";
import * as vrb from "verb-nurbs-web";
import { DrawHelper } from "./draw-helper";

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
    public babylon: Babylon;
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
        this.vector = new Vector(this.math, geometryHelper);
        const drawHelper = new DrawHelper(this.context, this.jscad.text, this.vector, this.jscadWorkerManager, this.manifoldWorkerManager, this.occtWorkerManager,);
        this.babylon = new Babylon(this.context, drawHelper, this.color);
        this.tag = new Tag(this.context);
        this.draw = new Draw(
            drawHelper,
            this.babylon.node,
            this.tag,
            this.context);

        this.color = new Color(this.math);
        this.line = new Line(this.context, geometryHelper);
        this.transforms = new Transforms(this.vector, this.math);
        this.point = new Point(geometryHelper, this.transforms);
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

    init(scene: BABYLON.Scene, occt?: Worker, jscad?: Worker, manifold?: Worker, havokPlugin?: BABYLON.HavokPlugin) {
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
        if(manifold){
            this.manifoldWorkerManager.setManifoldWorker(manifold);
        }
    }
}
