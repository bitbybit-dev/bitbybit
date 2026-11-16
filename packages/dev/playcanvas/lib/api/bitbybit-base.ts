import type { OCCT as BaseOCCT, OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { JSONPath } from "jsonpath-plus";
import type { Verb, Tag, Time, OCCTW, IFCW, Asset, JSONBitByBit, CSVBitByBit } from "@bitbybit-dev/core";
import type { JSCAD } from "@bitbybit-dev/jscad-worker";
import type { ManifoldBitByBit } from "@bitbybit-dev/manifold-worker";
import type { IFCWorkerManager } from "@bitbybit-dev/ifc-worker";
import type { Color, Dates, Engineering, Frame, IoBitByBit, Line, Lists, Logic, MathBitByBit, MeshBitByBit, Point, Polyline, Recipes, TextBitByBit, Transforms, Vector } from "@bitbybit-dev/base";
import { createSharedServices } from "@bitbybit-dev/core/lib/api/shared-services";
import type { BitbybitSettings } from "@bitbybit-dev/base";
import { Inputs } from "@bitbybit-dev/base";
import { Draw } from "./bitbybit/draw";
import { Context } from "./context";
import type { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import type { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import * as vrb from "verb-nurbs-web";
import { DrawHelper } from "./draw-helper";
import { PlayCanvas } from "./bitbybit/playcanvas";
import type * as pc from "playcanvas";

/**
 * The whole library behind one object for a PlayCanvas application: `occt`, `jscad` and `manifold`
 * for the CAD kernels, `ifc` for IFC building models, `recipes` for geometry as data, `engineering`
 * for the sizes and outlines of standard parts, `io` for DXF and SVG drawings, `draw` to put anything
 * into the scene, `playcanvas` for the camera, and the plain data helpers `math`, `vector`, `point`,
 * `frame`, `line`, `polyline`, `transforms`, `lists`, `logic`, `json`, `csv`, `text`, `dates`,
 * `color`, `asset`, `tag` and `time`. Call `init` with the application, the scene root and the
 * kernel workers first. The `bitbybit` object in these docs' examples is one.
 */
export class BitByBitBase {

    public context: Context;
    public jscadWorkerManager: JSCADWorkerManager;
    public manifoldWorkerManager: ManifoldWorkerManager;
    /**
     * Sends IFC calls to their worker and reports its state; `initBitByBit` hands it the worker, or
     * call its `setIfcWorker` with one.
     */
    public ifcWorkerManager: IFCWorkerManager;
    public occtWorkerManager: OCCTWorkerManager;
    private readonly applySettings: (settings: BitbybitSettings) => Promise<BitbybitSettings>;
    private readonly applyConventions: (level: number, engineSettings: BitbybitSettings) => Promise<BitbybitSettings>;

    public math: MathBitByBit;
    public logic: Logic;
    public lists: Lists;
    public json: JSONBitByBit;
    public csv: CSVBitByBit;
    public vector: Vector;
    public playcanvas: PlayCanvas;
    public point: Point;
    public frame: Frame;
    public engineering: Engineering;
    public recipes: Recipes;
    public io: IoBitByBit;
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
    /**
     * IFC building models: read, written and authored in a worker, each method answering with a
     * promise, and built as OpenCascade shapes or STEP through `geometry`. Experimental, as the IFC
     * library is.
     */
    public ifc: IFCW;
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
        this.ifcWorkerManager = shared.ifcWorkerManager;
        this.occtWorkerManager = shared.occtWorkerManager;
        this.applySettings = shared.setSettings;
        this.applyConventions = shared.setConventions;
        this.jscad = shared.jscad;
        this.manifold = shared.manifold;
        this.ifc = shared.ifc;
        this.lists = shared.lists;
        this.math = shared.math;
        this.vector = shared.vector;
        this.tag = shared.tag;
        this.color = shared.color;
        this.transforms = shared.transforms;
        this.point = shared.point;
        this.frame = shared.frame;
        this.engineering = shared.engineering;
        this.recipes = shared.recipes;
        this.io = shared.io;
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
        this.playcanvas = new PlayCanvas(this.context, drawHelper);
        this.draw = new Draw(drawHelper, this.context, this.tag);
    }

    /**
     * Connects the library to a PlayCanvas application and scene root and to the web workers that
     * run the CAD kernels; nothing works before it is called.
     *
     * A kernel whose worker is left out is unavailable, so pass only the ones your application
     * loads.
     * @param app - The PlayCanvas application
     * @param scene - The entity everything is drawn under, normally the application's root
     * @param occt - The worker running the Bitbybit OCCT Kernel, when OCCT is used
     * @param jscad - The worker running the JSCAD kernel, when JSCAD is used
     * @param manifold - The worker running the Manifold kernel, when Manifold is used
     * @returns Nothing
     * @example
     * ```typescript
     * const bitbybit = new BitByBitBase();
     * const occtWorker = new Worker(new URL("./occt.worker", import.meta.url), { name: "OCC", type: "module" });
     * bitbybit.init(app, app.root, occtWorker);
     * ```
     */
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

    /**
     * Sets the settings this instance works by, such as the coordinate system that files, drawings
     * and text map by.
     *
     * They reach the kernel workers without waiting for a kernel to load, so every later call works
     * by them. A setting left out keeps the earlier behaviour; one it does not take rejects.
     * `engineSettings` gives those that fit PlayCanvas.
     * @param settings - The settings to work by; an empty object for none
     * @returns The settings now in force
     * @example
     * ```typescript
     * await bitbybit.setSettings(bitbybit.engineSettings());
     * ```
     */
    setSettings(settings: BitbybitSettings): Promise<BitbybitSettings> {
        return this.applySettings(settings);
    }

    /**
     * Sets the settings that content saved with a conventions level runs by: 0 for the behaviour
     * from before settings existed, 1 for PlayCanvas's own coordinate system. Save the level with
     * your content, so content made earlier keeps running as it did. A level that is no
     * whole number from 0 rejects, and the earlier settings stay.
     * @param level - The conventions level the content was saved with
     * @returns The settings now in force
     * @example
     * ```typescript
     * await bitbybit.setConventions(1);
     * ```
     */
    setConventions(level: number): Promise<BitbybitSettings> {
        return this.applyConventions(level, this.engineSettings());
    }

    /**
     * The settings that fit PlayCanvas: its numbers are right-handed coordinates.
     * @returns The settings for `setSettings`
     * @example
     * ```typescript
     * const settings = bitbybit.engineSettings();
     * ```
     */
    engineSettings(): BitbybitSettings {
        return { coordinateSystem: Inputs.Base.coordinateSystemEnum.rightHanded };
    }
}
