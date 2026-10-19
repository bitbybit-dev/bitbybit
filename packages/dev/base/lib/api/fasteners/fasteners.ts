import * as Inputs from "../inputs";
import { radiansOf, roundedToMillionths } from "../services/helpers/geometry/scalars";
import { InputError } from "../kernel-calls/errors";
import type { ChamferedWasherSizes, ClearanceFit, HexBoltSizes, HexNutSizes, MetricSize, MetricThread, SetScrewPoint, SetScrewSizes, SocketHeadCapScrewSizes, WasherSizes } from "./fastener-types";
import {
    BOLT_LENGTH_MEDIUM,
    BOLT_LENGTH_SHORT,
    BOLT_THREAD_EXTRA_LONG,
    BOLT_THREAD_EXTRA_MEDIUM,
    BOLT_THREAD_EXTRA_SHORT,
    CLEARANCE_HOLES,
    COARSE_THREADS,
    CONE_LONG_ANGLE,
    COUNTERBORE_SINK,
    CONE_SHORT_ANGLE,
    CUP_ANGLE,
    HEX_BOLT_HEADS,
    HEX_NUTS,
    INTERNAL_DEPTH_FACTOR,
    METRIC_SIZES,
    PITCH_DEPTH_FACTOR,
    PLAIN_WASHERS,
    POINT_CHAMFER_ANGLE,
    SCREW_THREAD_EXTRA,
    SET_SCREWS,
    SMALLEST_CHAMFERED_WASHER,
    SOCKET_HEAD_CAP_SCREWS,
    THREAD_DEPTH_FACTOR,
    WASHER_CHAMFER_ANGLE,
    WASHER_CHAMFER_SHARE,
} from "./fasteners.constants";

const FITS: readonly ClearanceFit[] = Object.values(Inputs.Engineering.clearanceFitEnum);
const POINTS: readonly SetScrewPoint[] = Object.values(Inputs.Engineering.setScrewPointEnum);
const DRILL_STEP = 0.05;

const checkedSize = (size: MetricSize): MetricSize => {
    if (!METRIC_SIZES.includes(size)) {
        throw new InputError(`\`size\` is not one of ${METRIC_SIZES.join(", ")}.`, "size");
    }
    return size;
};

export function metricSizes(): MetricSize[] {
    return [...METRIC_SIZES];
}

export function metricThread(size: MetricSize, pitch?: number): MetricThread {
    const row = COARSE_THREADS[checkedSize(size)];
    const given = pitch ?? row.pitch;
    if (!(given > 0 && given <= row.pitch)) {
        throw new InputError(`\`pitch\` is not more than 0 and at most the coarse pitch of ${size}, ${String(row.pitch)}.`, "pitch");
    }
    const tapDrill = given === row.pitch ? row.tapDrill : Math.round((row.diameter - given) / DRILL_STEP) * DRILL_STEP;
    return {
        size,
        diameter: row.diameter,
        pitch: given,
        pitchDiameter: roundedToMillionths(row.diameter - PITCH_DEPTH_FACTOR * given),
        minorDiameter: roundedToMillionths(row.diameter - THREAD_DEPTH_FACTOR * given),
        internalMinorDiameter: roundedToMillionths(row.diameter - INTERNAL_DEPTH_FACTOR * given),
        tapDrill: roundedToMillionths(tapDrill),
    };
}

export function clearanceHoleDiameter(size: MetricSize, fit: ClearanceFit = "normal"): number {
    const row = CLEARANCE_HOLES[checkedSize(size)];
    if (!FITS.includes(fit)) {
        throw new InputError(`\`fit\` is not one of ${FITS.join(", ")}.`, "fit");
    }
    return row[fit];
}

export function socketHeadCapScrewSizes(size: MetricSize): SocketHeadCapScrewSizes {
    const row = SOCKET_HEAD_CAP_SCREWS[checkedSize(size)];
    return { ...row, threadLength: Math.round(2 * COARSE_THREADS[size].diameter + SCREW_THREAD_EXTRA), counterboreDepth: roundedToMillionths(row.headHeight + COUNTERBORE_SINK) };
}

export function hexBoltSizes(size: MetricSize, length: number): HexBoltSizes {
    const row = HEX_BOLT_HEADS[checkedSize(size)];
    if (!(length > 0)) {
        throw new InputError("`length` is not more than 0.", "length");
    }
    const extra = length <= BOLT_LENGTH_SHORT ? BOLT_THREAD_EXTRA_SHORT : length <= BOLT_LENGTH_MEDIUM ? BOLT_THREAD_EXTRA_MEDIUM : BOLT_THREAD_EXTRA_LONG;
    return { acrossFlats: row.acrossFlats, headHeight: row.height, threadLength: 2 * COARSE_THREADS[size].diameter + extra };
}

export function hexNutSizes(size: MetricSize): HexNutSizes {
    const row = HEX_NUTS[checkedSize(size)];
    return { acrossFlats: row.acrossFlats, height: row.height };
}

export function washerSizes(size: MetricSize): WasherSizes {
    return { ...PLAIN_WASHERS[checkedSize(size)] };
}

export function setScrewSizes(size: MetricSize, point: SetScrewPoint = "flat", length = Infinity): SetScrewSizes {
    const row = SET_SCREWS[checkedSize(size)];
    if (row === undefined) {
        throw new InputError(`\`size\` is ${size}, which ISO 4026 to 4029 give no set screw for.`, "size");
    }
    if (!POINTS.includes(point)) {
        throw new InputError(`\`point\` is not one of ${POINTS.join(", ")}.`, "point");
    }
    const minorDiameter = metricThread(size).minorDiameter;
    const shape = row[point];
    const short = length <= shape.shortUpTo;
    const socket = { socketSize: row.key, socketDepth: short ? row.depthShort : row.depthLong, pointDiameter: shape.diameter, shortUpTo: shape.shortUpTo };
    const chamfer = (minorDiameter - shape.diameter) / 2;
    if (point === "cone") {
        const angle = short ? CONE_SHORT_ANGLE : CONE_LONG_ANGLE;
        return { ...socket, pointLength: roundedToMillionths(chamfer / Math.tan(radiansOf(angle / 2))), pointAngle: angle };
    }
    if (point === "cup") {
        return { ...socket, pointLength: roundedToMillionths(shape.diameter / 2 / Math.tan(radiansOf(CUP_ANGLE / 2))), pointAngle: CUP_ANGLE };
    }
    const dog = point === "dog" ? (short ? row.dog.lengthShort : row.dog.lengthLong) : 0;
    return { ...socket, pointLength: roundedToMillionths(chamfer + dog), pointAngle: POINT_CHAMFER_ANGLE };
}

export function chamferedWasherSizes(size: MetricSize): ChamferedWasherSizes {
    const washer = washerSizes(size);
    if (metricThread(size).diameter < SMALLEST_CHAMFERED_WASHER) {
        throw new InputError(`\`size\` is ${size}; ISO 7090 starts at M${String(SMALLEST_CHAMFERED_WASHER)}.`, "size");
    }
    const chamferHeight = washer.thickness * WASHER_CHAMFER_SHARE;
    return { ...washer, chamferHeight, chamferWidth: roundedToMillionths(chamferHeight * Math.tan(radiansOf(WASHER_CHAMFER_ANGLE))) };
}
