import { Color, Dates, Frame, GeometryHelper, Line, Lists, Logic, MathBitByBit, MeshBitByBit, Point, Polyline, TextBitByBit, Transforms, Vector } from "@bitbybit-dev/base";
import { JSCAD, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldBitByBit, ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { IFCBitByBit, IFCWorkerManager } from "@bitbybit-dev/ifc-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import type { ContextBase } from "./context";
import type { SharedServices } from "./shared-services-types";
import { Tag } from "./bitbybit/tag";
import { Time } from "./bitbybit/time";
import { Asset } from "./bitbybit/asset";
import { JSONBitByBit } from "./bitbybit/json";
import { CSVBitByBit } from "./bitbybit/csv";
import { Verb } from "./bitbybit/verb/verb";
import { OCCTW } from "./bitbybit/occt/occt";


/**
 * Builds the engine-agnostic half of a renderer's root object. Which service takes which
 * collaborators is stated here once, so a constructor that gains an argument is a change to this
 * file rather than to every renderer that mirrors it.
 * @param context the renderer's own context, which the services that need one are given
 * @returns every shared service, already wired
 */
export function createSharedServices(context: ContextBase): SharedServices {
    const jscadWorkerManager = new JSCADWorkerManager();
    const manifoldWorkerManager = new ManifoldWorkerManager();
    const occtWorkerManager = new OCCTWorkerManager();
    const jscad = new JSCAD(jscadWorkerManager);
    const manifold = new ManifoldBitByBit(manifoldWorkerManager);
    const ifcWorkerManager = new IFCWorkerManager();
    const ifc = new IFCBitByBit(ifcWorkerManager);

    const geometryHelper = new GeometryHelper();
    const lists = new Lists();
    const math = new MathBitByBit();
    const vector = new Vector(math, geometryHelper);
    const transforms = new Transforms(vector, math);
    const point = new Point(geometryHelper, transforms, vector, lists);
    const line = new Line(vector, point, geometryHelper);
    const polyline = new Polyline(vector, point, line, geometryHelper);

    return {
        jscadWorkerManager, manifoldWorkerManager, occtWorkerManager, ifcWorkerManager, jscad, manifold, ifc,
        lists, math, vector, transforms, point, line, polyline, geometryHelper,
        frame: new Frame(vector, math, geometryHelper),
        tag: new Tag(context),
        color: new Color(math),
        verb: new Verb(context, geometryHelper, math),
        time: new Time(context),
        occt: new OCCTW(context, occtWorkerManager),
        asset: new Asset(),
        logic: new Logic(),
        json: new JSONBitByBit(context),
        csv: new CSVBitByBit(),
        text: new TextBitByBit(point),
        dates: new Dates(),
        mesh: new MeshBitByBit(vector, polyline),
    };
}
