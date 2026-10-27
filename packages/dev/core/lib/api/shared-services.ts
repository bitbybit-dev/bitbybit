import { BaseBitByBit } from "@bitbybit-dev/base";
import { JSCAD, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldBitByBit, ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { IFCWorkerManager } from "@bitbybit-dev/ifc-worker";
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
import { IFCW } from "./bitbybit/ifc/ifc";


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
    const occt = new OCCTW(context, occtWorkerManager);
    const ifc = new IFCW(ifcWorkerManager, occt);

    const base = new BaseBitByBit();

    return {
        jscadWorkerManager, manifoldWorkerManager, occtWorkerManager, ifcWorkerManager, jscad, manifold, ifc,
        lists: base.lists, math: base.math, vector: base.vector, transforms: base.transforms, point: base.point,
        line: base.line, polyline: base.polyline, geometryHelper: base.geometryHelper,
        frame: base.frame,
        engineering: base.engineering,
        recipes: base.recipes,
        tag: new Tag(context),
        color: base.color,
        verb: new Verb(context, base.geometryHelper, base.math),
        time: new Time(context),
        occt,
        asset: new Asset(),
        logic: base.logic,
        json: new JSONBitByBit(context),
        csv: new CSVBitByBit(),
        text: base.textService,
        dates: base.dates,
        mesh: base.mesh,
    };
}
