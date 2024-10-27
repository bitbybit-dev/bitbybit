import { OCCT as BaseOCCT, OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Babylon } from "./bitbybit/babylon/babylon";
import { Vector } from "./bitbybit/vector";
import { Point } from "./bitbybit/point";
import { Line } from "./bitbybit/line";
import { Polyline } from "./bitbybit/polyline";
import { Draw } from "./bitbybit/draw";
import { Verb } from "./bitbybit/verb/verb";
import { JSCAD } from "./bitbybit/jscad/jscad";
import { Tag } from "./bitbybit/tag";
import { Time } from "./bitbybit/time";
import { TextBitByBit } from "./bitbybit/text";
import { OCCTW } from "./bitbybit/occt/occt";
import { Asset } from "./bitbybit/asset";
import { Color } from "./bitbybit/color";
import { MathBitByBit } from "./bitbybit/math";
import { Context } from "./context";
import { GeometryHelper } from "./geometry-helper";
import { JSCADWorkerManager } from "../workers/jscad/jscad-worker-manager";
import * as BABYLON from "@babylonjs/core";
import * as vrb from "verb-nurbs-web";
import { Lists } from "./bitbybit/lists";
import { JSONBitByBit } from "./bitbybit/json";
import { JSONPath } from "jsonpath-plus";
import { Logic } from "./bitbybit/logic";

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
        const geometryHelper = new GeometryHelper(this.context);

        this.color = new Color(this.context);
        this.babylon = new Babylon(this.context, geometryHelper, this.color);
        this.math = new MathBitByBit();
        this.vector = new Vector(this.context, this.math, geometryHelper);
        this.line = new Line(this.context, geometryHelper);
        this.point = new Point(this.context, geometryHelper, this.line, this.babylon.transforms);
        this.polyline = new Polyline(this.context, geometryHelper);
        this.verb = new Verb(this.context, geometryHelper);
        this.jscad = new JSCAD(this.jscadWorkerManager, this.context, geometryHelper);
        this.tag = new Tag(this.context);
        this.time = new Time(this.context);
        this.occt = new OCCTW(this.context, this.occtWorkerManager, geometryHelper, this.jscad.text, this.vector);
        this.asset = new Asset();
        this.logic = new Logic();
        this.json = new JSONBitByBit(this.context);
        this.text = new TextBitByBit();
        this.lists = new Lists();
        this.draw = new Draw(
            this.point,
            this.line,
            this.polyline,
            this.babylon.node,
            this.verb.curve,
            this.verb.surface,
            this.jscad,
            this.occt,
            this.tag,
            this.context);
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
