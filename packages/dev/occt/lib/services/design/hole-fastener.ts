import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { EngineeringFasteners, EngineeringThreads, isRecord } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { release } from "../base/release";
import { HOLE_HEAD_SINK, TAPPED_WALL_SHARE } from "./constants";
import { faceSignatures } from "./helpers";
import { tripleOf } from "./placement";
import type { DesignRun } from "./state";
import type { HoleSize } from "./hole-types";
import { DesignProblem, pointer } from "./problems";
import { isExpressionObject, textOf } from "./values";
import type { DesignValues } from "./values";

const FASTENER_KEYS = ["size", "fit", "head"];
const FITS = ["close", "normal", "loose", "tapped"];
const HEADS = ["socket"];

const METRIC_SIZES: readonly Inputs.Engineering.metricSizeEnum[] = Object.values(Inputs.Engineering.metricSizeEnum);
const FASTENERS = new EngineeringFasteners();
const THREADS = new EngineeringThreads();

const metricSizeOf = (size: string): Inputs.Engineering.metricSizeEnum | undefined => METRIC_SIZES.find(each => each.valueOf() === size);

export function checkHoleFastener(value: unknown, path: string, checkExpression: (text: string, at: string) => void): void {
    if (!isRecord(value) || value["size"] === undefined) {
        throw new DesignProblem(path, "a fastener is { size, fit, head } with at least its size");
    }
    const extra = Object.keys(value).find(key => !FASTENER_KEYS.includes(key));
    if (extra !== undefined) {
        throw new DesignProblem(pointer(path, extra), `a fastener has ${FASTENER_KEYS.join(", ")}, not ${extra}`);
    }
    const size = value["size"];
    if (isExpressionObject(size)) {
        checkExpression(size.expr, pointer(path, "size", "expr"));
    } else if (typeof size !== "string" || metricSizeOf(size) === undefined) {
        throw new DesignProblem(pointer(path, "size"), `a fastener's size is one of ${METRIC_SIZES.join(", ")}, or { expr }`);
    }
    const fit = value["fit"];
    if (fit !== undefined && (typeof fit !== "string" || !FITS.includes(fit))) {
        throw new DesignProblem(pointer(path, "fit"), `a fastener's fit is ${FITS.join(", ")}`);
    }
    const head = value["head"];
    if (head !== undefined && (typeof head !== "string" || !HEADS.includes(head))) {
        throw new DesignProblem(pointer(path, "head"), `a fastener's head is ${HEADS.join(", ")}`);
    }
}

export function holeSizeOf(fastener: Models.OCCT.DesignHoleFastener, parameters: DesignValues, path: string): HoleSize {
    const text = textOf(fastener.size, parameters, pointer(path, "size"));
    const size = metricSizeOf(text);
    if (size === undefined) {
        throw new DesignProblem(pointer(path, "size"), `"${text}" is not a metric size from M1.6 to M24`);
    }
    const fit = fastener.fit ?? "normal";
    const diameter = fit === "tapped" ? THREADS.metricThread({ size }).diameter : FASTENERS.clearanceHole({ size, fit: Inputs.Engineering.clearanceFitEnum[fit] });
    const head = fastener.head === undefined ? undefined : FASTENERS.socketHeadCapScrewSizes({ size });
    return { diameter, counterbore: head === undefined ? undefined : { diameter: head.counterboreDiameter, depth: head.headHeight + HOLE_HEAD_SINK }, tapped: fit === "tapped" };
}

export function tappedWallsOf(shape: TopoDS_Shape, faces: readonly number[], frame: Inputs.Base.Frame, radius: number, run: DesignRun): number[] {
    const signatures = faceSignatures(shape, run);
    return faces.filter(index => {
        const signature = signatures[index];
        if (signature?.type !== Inputs.OCCT.surfaceTypeEnum.cylinder) {
            return false;
        }
        const along = run.base.vector.dot({ first: run.base.vector.sub({ first: signature.centre, second: frame.origin }), second: frame.normal });
        const onAxis = tripleOf(run.base.vector.add({ first: frame.origin, second: run.base.vector.mul({ vector: frame.normal, scalar: along }) }));
        const face = run.occt.shapes.face.getFace({ shape, index });
        try {
            return Math.abs(run.occt.operations.distancesToShapeFromPoints({ shape: face, points: [onAxis] })[0]! - radius) <= TAPPED_WALL_SHARE * radius;
        } finally {
            release(face);
        }
    });
}

export function checkHoleSizing(feature: Record<string, unknown>, path: string, lengthUnit: string): void {
    if (feature["counterbore"] !== undefined && feature["countersink"] !== undefined) {
        throw new DesignProblem(pointer(path, "countersink"), "a hole has a counterbore or a countersink, not both");
    }
    if ((feature["diameter"] === undefined) === (feature["fastener"] === undefined)) {
        throw new DesignProblem(feature["diameter"] === undefined ? path : pointer(path, "fastener"), "a hole is sized by its diameter or by its fastener, one of the two");
    }
    if (feature["fastener"] !== undefined && lengthUnit !== "mm") {
        throw new DesignProblem(pointer(path, "fastener"), `a fastener sizes holes in millimetres, and this document is in ${lengthUnit}: give the hole a diameter`);
    }
    const head = isRecord(feature["fastener"]) ? feature["fastener"]["head"] : undefined;
    if (head !== undefined && isRecord(feature["fastener"]) && feature["fastener"]["fit"] === "tapped") {
        throw new DesignProblem(pointer(path, "fastener", "head"), "a tapped hole takes the screw's thread, so it has no counterbore for its head");
    }
    if (head !== undefined && (feature["counterbore"] !== undefined || feature["countersink"] !== undefined)) {
        throw new DesignProblem(pointer(path, "fastener", "head"), "a fastener's head makes the hole's counterbore, so the hole takes no counterbore or countersink of its own");
    }
}
