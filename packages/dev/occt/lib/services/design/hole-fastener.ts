import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { EngineeringFastenersAnsi, EngineeringFastenersIso, EngineeringThreadsAnsi, EngineeringThreadsIso, InputError, isRecord } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { release } from "../base/release";
import { TAPPED_WALL_SHARE } from "./constants";
import { faceSignatures } from "./helpers";
import { tripleOf } from "./placement";
import type { DesignRun } from "./state";
import type { HoleSize } from "./hole-types";
import { DesignProblem, pointer } from "./problems";
import { isExpressionObject, textOf } from "./values";
import type { DesignValues } from "./values";

const FASTENER_KEYS = ["standard", "size", "series", "fit", "head"];
const STANDARDS = ["iso", "ansi"];
const FITS = ["close", "normal", "loose", "tapped"];
const HEADS = ["socket"];

const ISO_SIZES: readonly Inputs.Engineering.isoThreadSizeEnum[] = Object.values(Inputs.Engineering.isoThreadSizeEnum);
const ANSI_SIZES: readonly Inputs.Engineering.ansiThreadSizeEnum[] = Object.values(Inputs.Engineering.ansiThreadSizeEnum);
const ANSI_SERIES: readonly Inputs.Engineering.ansiThreadSeriesEnum[] = Object.values(Inputs.Engineering.ansiThreadSeriesEnum);
const ISO_FASTENERS = new EngineeringFastenersIso();
const ISO_THREADS = new EngineeringThreadsIso();
const ANSI_FASTENERS = new EngineeringFastenersAnsi();
const ANSI_THREADS = new EngineeringThreadsAnsi();

const isoSizeOf = (size: string): Inputs.Engineering.isoThreadSizeEnum | undefined => ISO_SIZES.find(each => each.valueOf() === size);
const ansiSizeOf = (size: string): Inputs.Engineering.ansiThreadSizeEnum | undefined => ANSI_SIZES.find(each => each.valueOf() === size);

export function checkHoleFastener(value: unknown, path: string, checkExpression: (text: string, at: string) => void): void {
    if (!isRecord(value) || value["size"] === undefined) {
        throw new DesignProblem(path, "a fastener is { standard, size, series, fit, head } with at least its size");
    }
    const extra = Object.keys(value).find(key => !FASTENER_KEYS.includes(key));
    if (extra !== undefined) {
        throw new DesignProblem(pointer(path, extra), `a fastener has ${FASTENER_KEYS.join(", ")}, not ${extra}`);
    }
    const standard = value["standard"] ?? "iso";
    if (typeof standard !== "string" || !STANDARDS.includes(standard)) {
        throw new DesignProblem(pointer(path, "standard"), `a fastener's standard is ${STANDARDS.join(", ")}`);
    }
    const ansi = standard === "ansi";
    const size = value["size"];
    if (isExpressionObject(size)) {
        checkExpression(size.expr, pointer(path, "size", "expr"));
    } else if (typeof size !== "string" || (ansi ? ansiSizeOf(size) : isoSizeOf(size)) === undefined) {
        throw new DesignProblem(pointer(path, "size"), `a${ansi ? "n ANSI" : "n ISO"} fastener's size is one of ${(ansi ? ANSI_SIZES : ISO_SIZES).join(", ")}, or { expr }`);
    }
    const series = value["series"];
    if (series !== undefined && (!ansi || typeof series !== "string" || !ANSI_SERIES.includes(series as Inputs.Engineering.ansiThreadSeriesEnum))) {
        throw new DesignProblem(pointer(path, "series"), ansi ? `an ANSI fastener's series is ${ANSI_SERIES.join(", ")}` : "a series names an ANSI thread's pitch; an ISO fastener has none");
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

function sizedAt<T>(path: string, size: () => T): T {
    try {
        return size();
    } catch (error) {
        if (error instanceof InputError) {
            throw new DesignProblem(pointer(path, error.property === "series" ? "series" : "size"), error.message);
        }
        throw error;
    }
}

function isoHoleSize(text: string, fit: Inputs.Engineering.clearanceFitEnum | "tapped", socket: boolean, path: string, unit: Inputs.Base.unitOfLengthEnum): HoleSize {
    const size = isoSizeOf(text);
    if (size === undefined) {
        throw new DesignProblem(pointer(path, "size"), `"${text}" is not an ISO metric size from M1.6 to M24`);
    }
    return sizedAt(path, () => {
        const diameter = fit === "tapped" ? ISO_THREADS.thread({ size, unit }).diameter : ISO_FASTENERS.clearanceHole({ size, fit, unit });
        const head = socket ? ISO_FASTENERS.socketHeadCapScrewSizes({ size, unit }) : undefined;
        return { diameter, counterbore: head === undefined ? undefined : { diameter: head.counterboreDiameter, depth: head.counterboreDepth }, tapped: fit === "tapped" };
    });
}

function ansiHoleSize(text: string, series: Inputs.Engineering.ansiThreadSeriesEnum, fit: Inputs.Engineering.clearanceFitEnum | "tapped", socket: boolean, path: string, unit: Inputs.Base.unitOfLengthEnum): HoleSize {
    const size = ansiSizeOf(text);
    if (size === undefined) {
        throw new DesignProblem(pointer(path, "size"), `"${text}" is not a Unified inch size from #0 to 1`);
    }
    return sizedAt(path, () => {
        const diameter = fit === "tapped" ? ANSI_THREADS.thread({ size, series, unit }).diameter : ANSI_FASTENERS.clearanceHole({ size, fit, unit });
        const head = socket ? ANSI_FASTENERS.socketHeadCapScrewSizes({ size, unit }) : undefined;
        return { diameter, counterbore: head === undefined ? undefined : { diameter: head.counterboreDiameter, depth: head.counterboreDepth }, tapped: fit === "tapped" };
    });
}

export function holeSizeOf(fastener: Models.OCCT.DesignHoleFastener, parameters: DesignValues, path: string, unit: Inputs.Base.unitOfLengthEnum): HoleSize {
    const text = textOf(fastener.size, parameters, pointer(path, "size"));
    const fit = fastener.fit === "tapped" ? "tapped" : Inputs.Engineering.clearanceFitEnum[fastener.fit ?? "normal"];
    const socket = fastener.head !== undefined;
    return fastener.standard === "ansi"
        ? ansiHoleSize(text, fastener.series === undefined ? Inputs.Engineering.ansiThreadSeriesEnum.unc : fastener.series as Inputs.Engineering.ansiThreadSeriesEnum, fit, socket, path, unit)
        : isoHoleSize(text, fit, socket, path, unit);
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

export function checkHoleSizing(feature: Record<string, unknown>, path: string): void {
    if (feature["counterbore"] !== undefined && feature["countersink"] !== undefined) {
        throw new DesignProblem(pointer(path, "countersink"), "a hole has a counterbore or a countersink, not both");
    }
    if ((feature["diameter"] === undefined) === (feature["fastener"] === undefined)) {
        throw new DesignProblem(feature["diameter"] === undefined ? path : pointer(path, "fastener"), "a hole is sized by its diameter or by its fastener, one of the two");
    }
    const head = isRecord(feature["fastener"]) ? feature["fastener"]["head"] : undefined;
    if (head !== undefined && isRecord(feature["fastener"]) && feature["fastener"]["fit"] === "tapped") {
        throw new DesignProblem(pointer(path, "fastener", "head"), "a tapped hole takes the screw's thread, so it has no counterbore for its head");
    }
    if (head !== undefined && (feature["counterbore"] !== undefined || feature["countersink"] !== undefined)) {
        throw new DesignProblem(pointer(path, "fastener", "head"), "a fastener's head makes the hole's counterbore, so the hole takes no counterbore or countersink of its own");
    }
}
