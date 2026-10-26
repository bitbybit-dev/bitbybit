import * as Inputs from "../inputs";
import { radiansOf, roundedToMillionths } from "../services/helpers/geometry/scalars";
import { InputError } from "../kernel-calls/errors";
import { checkedIsoSize, isoThread } from "../threads/iso-threads";
import { COARSE_THREADS } from "../threads/iso-threads.constants";
import type { IsoThreadSize } from "../threads/thread-types";
import { checkedFit } from "./fasteners";
import type { ChamferedWasherSizes, ClearanceFit, HexBoltSizes, HexNutSizes, IsoSetScrewPoint, SetScrewSizes, SocketHeadCapScrewSizes, WasherSizes } from "./fastener-types";
import {
    BOLT_LENGTH_MEDIUM,
    BOLT_LENGTH_SHORT,
    BOLT_THREAD_EXTRA_LONG,
    BOLT_THREAD_EXTRA_MEDIUM,
    BOLT_THREAD_EXTRA_SHORT,
    CLEARANCE_HOLES,
    CONE_LONG_ANGLE,
    CONE_SHORT_ANGLE,
    COUNTERBORE_SINK,
    CUP_ANGLE,
    HEX_BOLT_HEADS,
    HEX_NUTS,
    PLAIN_WASHERS,
    POINT_CHAMFER_ANGLE,
    SCREW_THREAD_EXTRA,
    SET_SCREWS,
    SMALLEST_CHAMFERED_WASHER,
    SOCKET_HEAD_CAP_SCREWS,
    WASHER_CHAMFER_ANGLE,
    WASHER_CHAMFER_SHARE,
} from "./iso-fasteners.constants";

const POINTS: readonly IsoSetScrewPoint[] = Object.values(Inputs.Engineering.isoSetScrewPointEnum);


export function isoClearanceHoleDiameter(size: IsoThreadSize, fit: ClearanceFit): number {
    return CLEARANCE_HOLES[checkedIsoSize(size)][checkedFit(fit)];
}

export function isoSocketHeadCapScrewSizes(size: IsoThreadSize): SocketHeadCapScrewSizes {
    const row = SOCKET_HEAD_CAP_SCREWS[checkedIsoSize(size)];
    return { ...row, threadLength: Math.round(2 * COARSE_THREADS[size].diameter + SCREW_THREAD_EXTRA), counterboreDepth: roundedToMillionths(row.headHeight + COUNTERBORE_SINK) };
}

export function isoHexBoltSizes(size: IsoThreadSize, length: number): HexBoltSizes {
    const row = HEX_BOLT_HEADS[checkedIsoSize(size)];
    if (!(length > 0)) {
        throw new InputError("`length` is not more than 0.", "length");
    }
    const extra = length <= BOLT_LENGTH_SHORT ? BOLT_THREAD_EXTRA_SHORT : length <= BOLT_LENGTH_MEDIUM ? BOLT_THREAD_EXTRA_MEDIUM : BOLT_THREAD_EXTRA_LONG;
    return { acrossFlats: row.acrossFlats, headHeight: row.height, threadLength: 2 * COARSE_THREADS[size].diameter + extra };
}

export function isoHexNutSizes(size: IsoThreadSize): HexNutSizes {
    const row = HEX_NUTS[checkedIsoSize(size)];
    return { acrossFlats: row.acrossFlats, height: row.height };
}

export function isoWasherSizes(size: IsoThreadSize): WasherSizes {
    return { ...PLAIN_WASHERS[checkedIsoSize(size)] };
}

export function isoSetScrewSizes(size: IsoThreadSize, point: IsoSetScrewPoint, length = Infinity): SetScrewSizes {
    const row = SET_SCREWS[checkedIsoSize(size)];
    if (row === undefined) {
        throw new InputError(`\`size\` is ${size}, which ISO 4026 to 4029 give no set screw for.`, "size");
    }
    if (!POINTS.includes(point)) {
        throw new InputError(`\`point\` is not one of ${POINTS.join(", ")}.`, "point");
    }
    const minorDiameter = isoThread(size).minorDiameter;
    const shape = row[point];
    const short = length <= shape.shortUpTo;
    const socket = { socketSize: row.key, socketDepth: short ? row.depthShort : row.depthLong, pointDiameter: shape.diameter, shortUpTo: shape.shortUpTo };
    const chamfer = (minorDiameter - shape.diameter) / 2;
    if (point === "cone") {
        const angle = short ? CONE_SHORT_ANGLE : CONE_LONG_ANGLE;
        return { ...socket, pointLength: roundedToMillionths(chamfer / Math.tan(radiansOf(angle / 2))), pointAngle: angle, pointRadius: 0 };
    }
    if (point === "cup") {
        return { ...socket, pointLength: roundedToMillionths(shape.diameter / 2 / Math.tan(radiansOf(CUP_ANGLE / 2))), pointAngle: CUP_ANGLE, pointRadius: 0 };
    }
    const dog = point === "dog" ? (short ? row.dog.lengthShort : row.dog.lengthLong) : 0;
    return { ...socket, pointLength: roundedToMillionths(chamfer + dog), pointAngle: POINT_CHAMFER_ANGLE, pointRadius: 0 };
}

export function isoChamferedWasherSizes(size: IsoThreadSize): ChamferedWasherSizes {
    const washer = isoWasherSizes(size);
    if (COARSE_THREADS[size].diameter < SMALLEST_CHAMFERED_WASHER) {
        throw new InputError(`\`size\` is ${size}; ISO 7090 starts at M${String(SMALLEST_CHAMFERED_WASHER)}.`, "size");
    }
    const chamferHeight = washer.thickness * WASHER_CHAMFER_SHARE;
    return { ...washer, chamferHeight, chamferWidth: roundedToMillionths(chamferHeight * Math.tan(radiansOf(WASHER_CHAMFER_ANGLE))) };
}
