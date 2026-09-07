import { OCCT as BaseOCCT, OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { JSONPath } from "jsonpath-plus";
import { Babylon } from "./bitbybit/babylon/babylon";
import {
    Verb,
    Tag,
    Time,
    OCCTW,
    Asset,
    JSONBitByBit,
    CSVBitByBit,
} from "@bitbybit-dev/core";
import {
    Vector,
    Point,
    Line,
    Polyline,
    TextBitByBit,
    Color,
    MathBitByBit,
    Lists,
    Logic,
    Transforms,
    Dates,
    MeshBitByBit,
} from "@bitbybit-dev/base";
import {
    JSCAD
} from "@bitbybit-dev/jscad-worker";
import { ManifoldBitByBit } from "@bitbybit-dev/manifold-worker";
import { createSharedServices } from "@bitbybit-dev/core/lib/api/shared-services";
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
    public csv: CSVBitByBit;
    public vector: Vector;
    public babylon: Babylon;
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
    public mesh: MeshBitByBit;
    public occt: OCCTW & BaseOCCT;
    public asset: Asset;
    public color: Color;

    constructor() {
        this.context = new Context();
        // Every service that is not about the renderer is wired in one place, shared by all three
        // renderer packages; only the engine facade and what draws through it are built here.
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
        this.babylon = new Babylon(this.context, drawHelper, this.color);
        this.draw = new Draw(
            drawHelper,
            this.babylon.node,
            this.tag,
            this.context);
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
        if (manifold) {
            this.manifoldWorkerManager.setManifoldWorker(manifold);
        }
    }
}
