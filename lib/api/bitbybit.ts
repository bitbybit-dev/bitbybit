
import { Babylon } from './bitbybit/babylon/babylon';
import { Vector } from './bitbybit/vector';
import { Point } from './bitbybit/point';
import { Line } from './bitbybit/line';
import { Polyline } from './bitbybit/polyline';
import { Draw } from './bitbybit/draw';
import { Verb } from './bitbybit/verb/verb';
import { JSCAD } from './bitbybit/jscad/jscad';
import { Tag } from './bitbybit/tag';
import { Time } from './bitbybit/time';
import { OCCT } from './bitbybit/occt/occt';
import { OCCT as BaseOCCT } from 'bitbybit-occt-worker/lib/api/occt/occt';
import { Asset } from './bitbybit/asset';
import { Color } from './bitbybit/color';
import { Context } from './context';
import { GeometryHelper } from './geometry-helper';
import { JSCADWorkerManager } from '../workers/jscad/jscad-worker-manager';
import { OCCTWorkerManager } from 'bitbybit-occt-worker/lib/occ-worker/occ-worker-manager';
import { Scene } from '@babylonjs/core';
import { OpenCascadeInstance } from 'bitbybit-occt/bitbybit-dev-occt/bitbybit-dev-occt';

export class BitByBitBase {

    public context: Context;
    public jscadWorkerManager: JSCADWorkerManager;
    public occtWorkerManager: OCCTWorkerManager;

    public babylon: Babylon;
    public vector: Vector;
    public point: Point;
    public line: Line;
    public polyline: Polyline;
    public draw: Draw;
    public verb: Verb;
    public jscad: JSCAD;
    public tag: Tag;
    public time: Time;
    public occt: OCCT & BaseOCCT;
    public asset: Asset;
    public color: Color;

    constructor(
    ) {
        this.context = new Context();
        this.jscadWorkerManager = new JSCADWorkerManager();
        this.occtWorkerManager = new OCCTWorkerManager();
        const geometryHelper = new GeometryHelper(this.context);

        this.color = new Color();
        this.babylon = new Babylon(this.context, geometryHelper, this.color);
        this.vector = new Vector(this.context);
        this.line = new Line(this.context, geometryHelper);
        this.point = new Point(this.context, geometryHelper, this.line);
        this.polyline = new Polyline(this.context, geometryHelper);
        this.verb = new Verb(this.context, geometryHelper);
        this.jscad = new JSCAD(this.jscadWorkerManager, this.context, geometryHelper);
        this.tag = new Tag();
        this.time = new Time();
        this.occt = new OCCT(this.context, this.occtWorkerManager, geometryHelper, this.jscad.text, this.vector);
        this.asset = new Asset();
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

    init(scene: Scene, occt?: Worker, jscad?: Worker, occtInstance?: OpenCascadeInstance) {
        this.context.scene = scene;
        if (occt) {
            this.occtWorkerManager.setOccWorker(occt);
        }
        if (jscad) {
            this.jscadWorkerManager.setJscadWorker(jscad);
        }
    }
}
