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
    MathBitByBit, GeometryHelper,
    Lists, Logic, Transforms, Dates, MeshBitByBit
} from "@bitbybit-dev/base";
import { Draw } from "./bitbybit/draw";
import { Context } from "./context";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import * as vrb from "verb-nurbs-web";
import { DrawHelper } from "./draw-helper";
import { PlayCanvas } from "./bitbybit/playcanvas";
import * as pc from "playcanvas";

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
    public playcanvas: PlayCanvas;
    public point: Point;
    public line: Line;
    public transforms: Transforms;
    public polyline: Polyline;
    public draw: Draw;
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
        this.jscadWorkerManager = new JSCADWorkerManager();
        this.manifoldWorkerManager = new ManifoldWorkerManager();
        this.occtWorkerManager = new OCCTWorkerManager();
        this.jscad = new JSCAD(this.jscadWorkerManager);
        this.manifold = new ManifoldBitByBit(this.manifoldWorkerManager);

        const geometryHelper = new GeometryHelper();
        this.lists = new Lists();
        this.math = new MathBitByBit();
        this.vector = new Vector(this.math, geometryHelper);
        const drawHelper = new DrawHelper(this.context, this.jscad.text, this.vector, this.jscadWorkerManager, this.manifoldWorkerManager, this.occtWorkerManager);
        this.playcanvas = new PlayCanvas(this.context, drawHelper);
        this.tag = new Tag(this.context);
        this.draw = new Draw(drawHelper, this.context, this.tag);
        this.color = new Color(this.math);
        this.transforms = new Transforms(this.vector, this.math);
        this.point = new Point(geometryHelper, this.transforms, this.vector, this.lists);
        this.line = new Line(this.vector, this.point, geometryHelper);
        this.polyline = new Polyline(this.vector, this.point, this.line, geometryHelper);
        this.verb = new Verb(this.context, geometryHelper, this.math);
        this.time = new Time(this.context);
        this.occt = new OCCTW(this.context, this.occtWorkerManager);
        this.asset = new Asset();
        this.logic = new Logic();
        this.json = new JSONBitByBit(this.context);
        this.csv = new CSVBitByBit();
        this.text = new TextBitByBit(this.point);
        this.dates = new Dates();
        this.mesh = new MeshBitByBit(this.vector, this.polyline);
    }

    init(app: pc.AppBase, scene: pc.Entity, occt?: Worker, jscad?: Worker, manifold?: Worker) {
        const verb = { geom: vrb.geom, core: vrb.core };
        this.context.app = app;
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
